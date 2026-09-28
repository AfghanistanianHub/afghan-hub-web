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
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/76">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 sm:gap-x-6 sm:gap-y-3 sm:px-8 sm:py-3.5">
          <Link href="/" aria-label="Afghan Hub home" className="group inline-flex min-w-0 items-center gap-2.5 rounded-xl sm:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] bg-primary text-primary-foreground shadow-sm sm:size-9 sm:rounded-xl">
              <span aria-hidden="true" className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-primary-foreground/35" />
              <span aria-hidden="true" className="text-[0.78rem] font-black tracking-[-0.08em] sm:text-sm">AH</span>
            </span>
            <span className="truncate text-[0.72rem] font-extrabold tracking-[0.13em] text-foreground transition-colors group-hover:text-primary sm:text-sm sm:tracking-[0.15em]">
              AFGHAN HUB
            </span>
          </Link>

          <nav
            aria-label="Public navigation"
            className="order-3 grid w-full grid-cols-3 gap-1 rounded-xl border border-border/70 bg-muted/35 p-1 text-xs font-semibold sm:flex sm:flex-wrap sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm sm:font-medium md:order-none md:w-auto"
          >
            <Link href="/explore" className="inline-flex min-h-9 items-center justify-center rounded-lg px-2 text-center transition hover:bg-background hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-10 sm:px-3 sm:hover:bg-muted">
              Explore
            </Link>
            <Link href="/about" className="inline-flex min-h-9 items-center justify-center rounded-lg px-2 text-center transition hover:bg-background hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-10 sm:px-3 sm:hover:bg-muted">
              Our mission
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-9 items-center justify-center rounded-lg px-2 text-center transition hover:bg-background hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-10 sm:px-3 sm:hover:bg-muted">
              Member home
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1 text-xs font-semibold sm:gap-2 sm:text-sm">
            <Link href="/login" className="inline-flex min-h-9 items-center rounded-lg px-2.5 transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-10 sm:px-3">
              Sign in
            </Link>
            <Link
              href="/login?mode=join"
              className="rounded-lg bg-primary px-3 py-2 text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:rounded-xl sm:px-4 sm:py-2.5"
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
            <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
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
              <Link key={kind} href={`/explore?type=${kind}`} className="rounded-sm text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">
                {publicCategories[kind].label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Community footer" className="grid content-start gap-3 text-sm">
            <p className="font-semibold">Be part of it</p>
            <Link href="/about" className="rounded-sm text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">Our mission</Link>
            <Link href="/login?mode=join" className="rounded-sm text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">Join the community</Link>
            <Link href="/dashboard" className="rounded-sm text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">Member home</Link>
          </nav>
        </div>
        <div className="mx-auto max-w-7xl border-t border-border px-5 py-6 sm:px-8"><SupportLinks /></div>
      </footer>
    </div>
  );
}
