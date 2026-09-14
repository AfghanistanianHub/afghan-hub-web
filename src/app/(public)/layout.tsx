import { SupportLinks } from "@/components/public/support-links";
import Link from "next/link";
import { publicCategories, publicKinds } from "@/lib/public-catalog";

// Public reads remain fresh when a listing is unpublished or edited.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans [&>main]:flex-1">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-5 py-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/76">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5 sm:px-8">
          <Link href="/" aria-label="Afghan Hub home" className="group inline-flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm">
              <span aria-hidden="true" className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-primary-foreground/35" />
              <span aria-hidden="true" className="text-sm font-black tracking-[-0.08em]">AH</span>
            </span>
            <span className="text-sm font-extrabold tracking-[0.15em] text-foreground transition-colors group-hover:text-primary">
              AFGHAN HUB
            </span>
          </Link>

          <nav
            aria-label="Public navigation"
            className="order-3 flex w-full flex-wrap gap-x-1 gap-y-1 text-sm font-medium md:order-none md:w-auto"
          >
            <Link href="/explore" className="inline-flex min-h-10 items-center rounded-lg px-3 hover:bg-muted hover:text-primary">
              Explore
            </Link>
            <Link href="/about" className="inline-flex min-h-10 items-center rounded-lg px-3 hover:bg-muted hover:text-primary">
              Our mission
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-lg px-3 hover:bg-muted hover:text-primary">
              Member home
            </Link>
          </nav>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/login" className="inline-flex min-h-10 items-center rounded-lg px-3 hover:bg-muted">
              Sign in
            </Link>
            <Link
              href="/login?mode=join"
              className="rounded-xl bg-primary px-4 py-2.5 text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Join us
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-[0.68rem] font-black text-primary-foreground">AH</span>
              <span className="text-sm font-extrabold tracking-[0.15em]">AFGHAN HUB</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              A place for Afghan people, ideas, and opportunities to find each other.
            </p>
          </div>

          <nav aria-label="Explore footer" className="grid gap-3 text-sm">
            <p className="font-semibold">Explore</p>
            {publicKinds.map(kind => (
              <Link key={kind} href={`/explore?type=${kind}`} className="text-muted-foreground hover:text-primary">
                {publicCategories[kind].label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Community footer" className="grid content-start gap-3 text-sm">
            <p className="font-semibold">Be part of it</p>
            <Link href="/about" className="text-muted-foreground hover:text-primary">Our mission</Link>
            <Link href="/login?mode=join" className="text-muted-foreground hover:text-primary">Join the community</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary">Member home</Link>
          </nav>
        </div>
        <div className="mx-auto max-w-7xl border-t border-border px-5 py-6 sm:px-8"><SupportLinks /></div>
      </footer>
    </div>
  );
}
