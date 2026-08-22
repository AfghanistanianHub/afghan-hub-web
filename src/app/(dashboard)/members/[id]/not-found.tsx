import Link from "next/link";
import { ArrowLeft, UserRoundX } from "lucide-react";

export default function MemberNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center md:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-800">
          <UserRoundX className="size-8 text-slate-500" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          Member not found
        </h1>

        <p className="mt-3 leading-7 text-slate-400">
          This profile may not exist, may not be public, or may not have
          completed onboarding.
        </p>

        <Link
          href="/network"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          <ArrowLeft className="size-4" />
          Return to network
        </Link>
      </div>
    </main>
  );
}
