"use client";

import Link from "next/link";

import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { formatCopy } from "@/lib/i18n/ui-copy";
import {
  getWorkspaceCopy,
  type WorkspaceCopyKey,
} from "@/lib/i18n/workspace-copy";
import { useSiteLanguage } from "./localized";

/** Client components for workspace copy use this to localize any catalog string. */
export function useWorkspaceCopy() {
  const language = useSiteLanguage();
  const t = (key: WorkspaceCopyKey, values?: Record<string, string | number>) =>
    formatCopy(getWorkspaceCopy(language, key), values);
  return { language, t };
}

/** Renders a workspace catalog string with its own language boundary. */
export function W({
  k,
  values,
  className,
}: {
  k: WorkspaceCopyKey;
  values?: Record<string, string | number>;
  className?: string;
}) {
  const { language, t } = useWorkspaceCopy();
  return (
    <span lang={language} dir={language === "en" ? "ltr" : "rtl"} className={className}>
      {t(k, values)}
    </span>
  );
}

type LocalizedFieldProps = {
  labelKey: WorkspaceCopyKey;
  name: string;
  fieldClassName: string;
  labelClassName?: string;
  wrapperClassName?: string;
  hintKey?: WorkspaceCopyKey;
  placeholderKey?: WorkspaceCopyKey;
  /** Literal placeholder for values that must stay Latin, such as URLs. */
  placeholder?: string;
  type?: string;
  rows?: number;
  id?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  defaultValue?: string | number;
  autoComplete?: string;
};

const latinValueTypes = new Set(["url", "email", "tel"]);

/**
 * Label + input/textarea pair whose visible copy follows the site language.
 * URL, email and phone values keep left-to-right text direction so technical
 * values stay readable inside right-to-left layouts.
 */
export function LocalizedField({
  labelKey,
  name,
  fieldClassName,
  labelClassName = "text-sm font-medium text-foreground",
  wrapperClassName,
  hintKey,
  placeholderKey,
  placeholder,
  type = "text",
  rows,
  id,
  required,
  minLength,
  maxLength,
  min,
  defaultValue,
  autoComplete,
}: LocalizedFieldProps) {
  const { language, t } = useWorkspaceCopy();
  const ltr = latinValueTypes.has(type) || name.endsWith("_url");
  const resolvedPlaceholder = placeholderKey ? t(placeholderKey) : placeholder;

  return (
    <label className={wrapperClassName} htmlFor={id}>
      <span className={labelClassName}>
        <W k={labelKey} />
      </span>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          placeholder={resolvedPlaceholder}
          defaultValue={defaultValue}
          className={fieldClassName}
          {...(ltr ? { dir: "ltr" as const } : {})}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          min={min}
          placeholder={resolvedPlaceholder}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          className={fieldClassName}
          {...(ltr ? { dir: "ltr" as const } : {})}
        />
      )}
      {hintKey ? (
        <span className="mt-2 block text-xs text-muted-foreground" lang={language}>
          {t(hintKey)}
        </span>
      ) : null}
    </label>
  );
}

type LocalizedSelectProps = {
  labelKey: WorkspaceCopyKey;
  name: string;
  fieldClassName: string;
  labelClassName?: string;
  wrapperClassName?: string;
  options: ReadonlyArray<{ value: string; key: WorkspaceCopyKey }>;
  placeholderKey?: WorkspaceCopyKey;
  defaultValue?: string;
  id?: string;
  required?: boolean;
};

/**
 * Select whose visible options are localized while the submitted value stays
 * the canonical English token stored in the database.
 */
export function LocalizedSelect({
  labelKey,
  name,
  fieldClassName,
  labelClassName = "text-sm font-medium text-foreground",
  wrapperClassName,
  options,
  placeholderKey,
  defaultValue,
  id,
  required,
}: LocalizedSelectProps) {
  const { t } = useWorkspaceCopy();
  return (
    <label className={wrapperClassName} htmlFor={id}>
      <span className={labelClassName}>
        <W k={labelKey} />
      </span>
      <select id={id} name={name} defaultValue={defaultValue} required={required} className={fieldClassName}>
        {placeholderKey ? (
          <option value="">{t(placeholderKey)}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.key)}
          </option>
        ))}
      </select>
    </label>
  );
}

type LocalizedChoiceFieldProps = {
  labelKey: WorkspaceCopyKey;
  name: string;
  fieldClassName: string;
  labelClassName?: string;
  wrapperClassName?: string;
  placeholderKey: WorkspaceCopyKey;
  defaultValue?: string;
  id?: string;
  required?: boolean;
  children: React.ReactNode;
};

/**
 * Select whose options come from server data (for example owned
 * organizations). Only the empty option is localized; option content stays
 * user-authored.
 */
export function LocalizedChoiceField({
  labelKey,
  name,
  fieldClassName,
  labelClassName = "text-sm font-medium text-foreground",
  wrapperClassName,
  placeholderKey,
  defaultValue,
  id,
  required,
  children,
}: LocalizedChoiceFieldProps) {
  const { t } = useWorkspaceCopy();
  return (
    <label className={wrapperClassName} htmlFor={id}>
      <span className={labelClassName}>
        <W k={labelKey} />
      </span>
      <select id={id} name={name} defaultValue={defaultValue} required={required} className={fieldClassName}>
        <option value="">{t(placeholderKey)}</option>
        {children}
      </select>
    </label>
  );
}

type LocalizedCheckboxProps = {
  name: string;
  labelKey: WorkspaceCopyKey;
  hintKey?: WorkspaceCopyKey;
  defaultChecked?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  labelSpanClassName?: string;
};

export function LocalizedCheckbox({
  name,
  labelKey,
  hintKey,
  defaultChecked,
  wrapperClassName,
  inputClassName = "mt-1 size-4 accent-primary",
  labelSpanClassName = "block text-sm font-semibold",
}: LocalizedCheckboxProps) {
  const { language, t } = useWorkspaceCopy();
  return (
    <label className={wrapperClassName}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className={inputClassName} />
      <span lang={language}>
        <span className={labelSpanClassName}>{t(labelKey)}</span>
        {hintKey ? (
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t(hintKey)}</span>
        ) : null}
      </span>
    </label>
  );
}

export function LocalizedBackLink({
  href,
  k,
  className,
}: {
  href: string;
  k: WorkspaceCopyKey;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <span aria-hidden="true">←</span> <W k={k} />
    </Link>
  );
}

export function LocalizedSubmitButton({
  k,
  pendingKey,
  className,
}: {
  k: WorkspaceCopyKey;
  pendingKey: WorkspaceCopyKey;
  className?: string;
}) {
  const { t } = useWorkspaceCopy();
  return (
    <PendingSubmitButton pendingLabel={t(pendingKey)} className={className}>
      <W k={k} />
    </PendingSubmitButton>
  );
}

export function LocalizedCancelLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <W k="common.cancel" />
    </Link>
  );
}
