import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Information use and privacy choices in the current Afghan Hub service.",
  alternates: { canonical: "https://app.apnbc.ca/privacy" },
};

const sections = [
  {
    "title": "Information you provide",
    "text": "Your account uses an email address and authentication credentials. Profiles, avatars, connections, messages, saved opportunities, event RSVPs and contributed listings store the information needed to provide the features you choose."
  },
  {
    "title": "Visibility and sharing",
    "text": "Published listings can be viewed without an account, including any contact details you add to them. Eligible visible profiles can appear in the member directory. Your account email and internal role are not public profile fields. Change profile visibility in Settings; hiding a profile does not delete previous messages, connections or contributions."
  },
  {
    "title": "Messages and media",
    "text": "In-app conversation access is restricted to conversation members; this is not a claim of end-to-end encryption. Business and organization draft media is restricted to its owner; published listing media is accessible to visitors. Avatars use public image storage, so avoid uploading confidential images."
  },
  {
    "title": "Service providers and cookies",
    "text": "Afghan Hub uses Supabase for authentication, application data and uploaded files, and Vercel for hosting. Sign-in uses session cookies. Information needed to operate the service is processed through these providers."
  },
  {
    "title": "Corrections, deletion and data export",
    "text": "Edit your profile and visibility through your account. Contact support for information questions, corrections, account deletion or a copy of your data. Self-service account deletion and export are not currently available. Share only the minimum personal information needed to explain your request."
  },
  {
    "title": "Retention and request scope",
    "text": "A fixed retention period and backup-deletion schedule have not yet been published. Ask support to clarify the scope and timing of a deletion or export request, including shared conversations, contributions and backups. This notice does not promise immediate removal or a specific completion date."
  }
];

export default function PrivacyPage() {
  return <InformationPage title="Privacy" description="Information use and privacy choices in the current Afghan Hub service." sections={sections} />;
}
