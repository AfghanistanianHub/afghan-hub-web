import Link from "next/link";

export default function OrganizationNotFound() {
  return (
    <main className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Organization not found</h1>

        <p className="mt-4 text-slate-400">
          This organization does not exist or is not publicly available.
        </p>

        <Link
          href="/organizations"
          className="mt-8 inline-flex rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950"
        >
          View organizations
        </Link>
      </div>
    </main>
  );
}
