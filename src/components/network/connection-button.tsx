"use client";

import Link from "next/link";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { useUiCopy } from "@/components/i18n/localized";
import styles from "./network-surfaces.module.css";
import { startConversation } from "@/app/(dashboard)/messages/actions";
import {
  removeConnection,
  sendConnectionRequest,
} from "@/app/(dashboard)/network/actions";

type ConnectionButtonProps = {
  currentUserId: string;
  memberId: string;
  connection: {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: string;
  } | null;
};

export function ConnectionButton({
  currentUserId,
  memberId,
  connection,
}: ConnectionButtonProps) {
  const { t } = useUiCopy();
  if (currentUserId === memberId) return null;

  const primaryButton =
    `inline-flex items-center justify-center bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 ${styles.control}`;
  const secondaryButton =
    `inline-flex items-center justify-center border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted ${styles.control}`;

  if (!connection) {
    return (
      <form action={sendConnectionRequest}>
        <input type="hidden" name="recipient_id" value={memberId} />
        <PendingSubmitButton pendingLabel={t("network.sending")} className={`${primaryButton} min-w-32`}>{t("network.connect")}</PendingSubmitButton>
      </form>
    );
  }

  if (connection.status === "accepted") {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex min-h-11 items-center rounded-full bg-primary/[0.07] px-4 py-2.5 text-sm font-semibold text-primary">
          {t("network.connected")}
        </span>

        <form action={startConversation}>
          <input type="hidden" name="member_id" value={memberId} />
          <PendingSubmitButton pendingLabel={t("network.opening")} className={`${primaryButton} min-w-32`}>{t("network.message")}</PendingSubmitButton>
        </form>

        <form
          action={removeConnection}
          onSubmit={(event) => {
            if (!window.confirm(t("network.disconnectConfirm"))) event.preventDefault();
          }}
        >
          <input type="hidden" name="connection_id" value={connection.id} />
          <PendingSubmitButton
            pendingLabel={t("network.disconnecting")}
            className={`inline-flex items-center justify-center px-3 py-2.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-destructive ${styles.control}`}
          >
            {t("network.disconnect")}
          </PendingSubmitButton>
        </form>
      </div>
    );
  }

  if (connection.status === "pending") {
    if (connection.requester_id === currentUserId) {
      return (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex min-h-11 items-center rounded-sm border border-border bg-muted/70 px-4 py-2.5 text-sm font-semibold text-muted-foreground">
            {t("network.requestSent")}
          </span>

          <form action={removeConnection}>
            <input type="hidden" name="connection_id" value={connection.id} />
            <PendingSubmitButton pendingLabel={t("network.cancelling")} className={`${secondaryButton} min-w-40`}>{t("network.cancelRequest")}</PendingSubmitButton>
          </form>
        </div>
      );
    }

    return (
      <Link href="/network" className={primaryButton}>
        {t("network.respondRequest")}
      </Link>
    );
  }

  if (connection.status === "declined") {
    return (
      <span className="inline-flex min-h-11 items-center rounded-sm border border-border bg-muted/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground">
        {t("network.requestDeclined")}
      </span>
    );
  }

  return null;
}
