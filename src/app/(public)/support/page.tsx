import type { Metadata } from "next";
import { LocalizedSupportContent } from "./localized-support-content";

export const metadata: Metadata = {
  title: "Support",
  description: "Help with your account, community listings and privacy questions.",
  alternates: { canonical: "https://app.apnbc.ca/support" },
};

export default function SupportPage() {
  return <LocalizedSupportContent />;
}
