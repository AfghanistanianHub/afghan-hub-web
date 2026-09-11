"use client";

import { PageRecovery, type RecoveryProps } from "@/components/feedback/page-recovery";

// Do not render the error message: client errors may contain private details.
export default function ErrorPage(props: RecoveryProps) {
  return <PageRecovery unstable_retry={props.unstable_retry} />;
}
