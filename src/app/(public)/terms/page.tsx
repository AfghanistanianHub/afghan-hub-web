import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Community participation and service information for Afghan Hub.",
  alternates: { canonical: "https://app.apnbc.ca/terms" },
};

const sections = [
  {
    "title": "Respectful participation",
    "text": "Use the community to make useful connections and share relevant listings. Do not use the service for harassment, threats, impersonation, spam or attempts to access another person's account or private information."
  },
  {
    "title": "Responsible contributions",
    "text": "Keep your profile and listing information accurate. Upload and publish only material you have permission to share. Do not publish another person's confidential documents or private contact details without permission."
  },
  {
    "title": "Listings and moderation",
    "text": "Contributions can pass through draft and moderation states before publication. Review details with the relevant organizer or provider before applying, paying or attending. A listing or verification badge should not replace your own checks."
  },
  {
    "title": "Account security",
    "text": "Keep passwords and sign-in links private. Reset your password and contact support if you suspect misuse. Do not bypass permissions, collect private member information or interfere with the service."
  },
  {
    "title": "Concerns and legal scope",
    "text": "Email support about misleading content, abuse, privacy concerns or account problems. Include the relevant page link and a brief explanation. A response time is not promised. These community terms do not specify a governing jurisdiction, dispute process or contractual liability limits; those legal terms remain to be confirmed."
  }
];

export default function TermsPage() {
  return <InformationPage title="Terms" description="Community participation and service information for Afghan Hub." sections={sections} />;
}
