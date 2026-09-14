import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";

export const metadata: Metadata = {
  title: "Support",
  description: "Help with your account, community listings and privacy questions.",
  alternates: { canonical: "https://app.apnbc.ca/support" },
};

const sections = [
  {
    "title": "Account and technical help",
    "text": "For sign-in problems, try Forgot password on the sign-in page. For other issues, email the page address, what you tried and what happened. Remove private information from screenshots. Never send passwords or confirmation or recovery links."
  },
  {
    "title": "Privacy, deletion and export requests",
    "text": "Email support to ask about your information, request corrections, discuss account deletion or request a copy of your data. Use your account email where possible. Download your account details and profile from Settings as JSON. Messages, connections, contributions, saved items, RSVPs and uploaded files are outside that download. Contact support for wider requests or account deletion, and clarify scope and timing."
  },
  {
    "title": "Report abuse or misleading content",
    "text": "Send the relevant listing or profile link and a short description. Redact unrelated personal information and private messages. Reporting and member blocking are not currently available as dedicated in-app controls."
  },
  {
    "title": "Response expectations",
    "text": "Support is reached by email. A fixed response time has not been published. This address is not an emergency service; contact local emergency services for an immediate safety emergency."
  }
];

export default function SupportPage() {
  return <InformationPage title="Support" description="Help with your account, community listings and privacy questions." sections={sections} />;
}
