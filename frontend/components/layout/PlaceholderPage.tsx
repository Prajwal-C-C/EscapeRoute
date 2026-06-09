import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Compass className="h-6 w-6 text-[#2563eb]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="rounded-xl bg-[#2563eb] px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#1d4ed8]">
              Open dashboard
            </Link>
            <Link href="/create-trip" className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50">
              Plan a trip
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
