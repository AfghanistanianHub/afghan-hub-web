"use client";

import { useSiteLanguage } from "@/components/i18n/localized";

export const BUSINESS_CATEGORIES = [
  ["Technology & IT", "فناوری و آی‌تی", "ټکنالوژي او معلوماتي ټکنالوژي"],
  ["Food & Restaurants", "غذا و رستوران", "خواړه او رستورانتونه"],
  ["Retail & Shopping", "فروشگاه و خرده‌فروشی", "پلورنځي او پېرود"],
  ["Professional Services", "خدمات حرفه‌ای", "مسلکي خدمتونه"],
  ["Education & Training", "آموزش و مهارت‌آموزی", "زده‌کړه او روزنه"],
  ["Health & Wellness", "سلامت و تندرستی", "روغتیا او هوساینه"],
  ["Construction & Trades", "ساختمان و خدمات فنی", "ودانیزې او تخنیکي چارې"],
  ["Arts & Media", "هنر و رسانه", "هنر او رسنۍ"],
  ["Transportation & Logistics", "حمل‌ونقل و لجستیک", "ترانسپورت او لوژستیک"],
  ["Beauty & Personal Care", "زیبایی و مراقبت شخصی", "ښکلا او شخصي پاملرنه"],
  ["Finance & Insurance", "مالی و بیمه", "مالي چارې او بیمه"],
  ["Real Estate", "املاک", "املاک"],
  ["Hospitality & Tourism", "مهمان‌داری و گردشگری", "مېلمه پالنه او ګرځندوی"],
  ["Nonprofit & Community", "غیرانتفاعی و اجتماعی", "ناانتفاعي او ټولنیزې چارې"],
  ["Other", "سایر", "نور"],
] as const;

type CategorySelectProps = {
  name?: string;
  defaultValue?: string;
  className: string;
  labelClassName?: string;
  required?: boolean;
  filter?: boolean;
};

export function BusinessCategorySelect({
  name = "category", defaultValue = "", className, labelClassName = "grid gap-2 text-sm font-medium",
  required = false, filter = false,
}: CategorySelectProps) {
  const language = useSiteLanguage();
  const index = language === "ps" ? 2 : language === "fa" ? 1 : 0;
  const label = filter
    ? ["Business category", "دسته‌بندی بیزینس", "د سوداګرۍ کټګوري"][index]
    : ["Category", "دسته‌بندی", "کټګوري"][index];
  const placeholder = filter
    ? ["Any category", "همه دسته‌بندی‌ها", "ټولې کټګورۍ"][index]
    : ["Select a category", "یک دسته‌بندی انتخاب کنید", "یوه کټګوري غوره کړئ"][index];
  const known = BUSINESS_CATEGORIES.some(([value]) => value === defaultValue);
  return (
    <label className={labelClassName}>
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} required={required} className={className} dir={language === "en" ? "ltr" : "rtl"}>
        <option value="">{placeholder}</option>
        {defaultValue && !known ? <option value={defaultValue}>{defaultValue}</option> : null}
        {BUSINESS_CATEGORIES.map((entry) => <option key={entry[0]} value={entry[0]}>{entry[index]}</option>)}
      </select>
    </label>
  );
}
