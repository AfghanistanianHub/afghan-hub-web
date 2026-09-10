import Link from "next/link";
export default function ListingNotFound() {
  return <main id="main-content" className="mx-auto max-w-3xl px-5 py-20"><h1 className="text-3xl font-semibold">This listing isn’t available.</h1><p className="mt-4 text-muted-foreground">It may have been removed or may not be public.</p><Link href="/explore" className="mt-6 inline-block font-medium text-primary underline">Explore community listings</Link></main>;
}
