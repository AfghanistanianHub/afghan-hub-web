import Link from "next/link";

type SupportLinkLabels = {
  privacy: string;
  terms: string;
  support: string;
  navigation: string;
};

export function SupportLinks({ labels }: { labels?: SupportLinkLabels }) {
  const items = [
    { page: "privacy", label: labels?.privacy ?? "Privacy" },
    { page: "terms", label: labels?.terms ?? "Terms" },
    { page: "support", label: labels?.support ?? "Support" },
  ];
  return (
    <nav aria-label={labels?.navigation ?? "Privacy, terms and support"} className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {items.map(({ page, label }) => (
        <Link key={page} href={"/" + page} className="inline-flex min-h-11 items-center rounded-sm px-0 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{label}</Link>
      ))}
    </nav>
  );
}
