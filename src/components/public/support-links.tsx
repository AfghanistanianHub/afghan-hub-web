import Link from "next/link";

export function SupportLinks() {
  return (
    <nav aria-label="Privacy, terms and support" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {["privacy", "terms", "support"].map((page) => (
        <Link key={page} href={"/" + page} className="inline-flex min-h-11 items-center rounded-sm px-1 capitalize hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{page}</Link>
      ))}
    </nav>
  );
}
