"use client";

import Link from "next/link";
import { useState } from "react";
import { fuzzyIncludes } from "@/lib/text";
import { HEALTH_TIPS, type HealthTip } from "@/lib/healthTips";

export function HealthTips() {
  const [query, setQuery] = useState("");
  const tips = HEALTH_TIPS.filter((t) => !query.trim() || fuzzyIncludes(query, `${t.name} ${t.symptoms.join(" ")}`));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Common illnesses — care at home</h1>
      <p className="mt-1 text-sm text-slate-600">
        Simple prevention and home-care tips for everyday illnesses, and the warning signs that mean you should see a
        doctor.
      </p>

      <input
        className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:max-w-sm"
        placeholder="Search illness or symptom (e.g. cough, rash)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {tips.map((t) => (
          <TipCard key={t.id} tip={t} />
        ))}
        {tips.length === 0 && <p className="text-sm text-slate-500">No illness matches “{query}”.</p>}
      </div>

      <p className="mt-8 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        ⚠️ This information is for general awareness only and is not a substitute for medical advice. Don&apos;t start
        medicines without asking a doctor. In an emergency call <b>108</b> (ambulance) or <b>112</b>.
      </p>
    </div>
  );
}

function TipCard({ tip }: { tip: HealthTip }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-2xl">
          {tip.icon}
        </span>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">{tip.name}</h2>
          <p className="line-clamp-1 text-xs text-slate-500">{tip.symptoms.slice(0, 3).join(" · ")}</p>
        </div>
        <span className="text-slate-400 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="space-y-3 border-t border-slate-100 p-4 text-sm">
        <Section title="Symptoms" color="text-slate-700" items={tip.symptoms} />
        <Section title="🏠 Care at home" color="text-teal-700" items={tip.homeCare} />
        <Section title="🛡️ Prevention" color="text-indigo-700" items={tip.prevention} />
        <div className="rounded-lg bg-red-50 p-3">
          <Section title="🚨 See a doctor if" color="text-red-700" items={tip.seeDoctor} />
        </div>
        <Link
          href={`/?disease=${encodeURIComponent(tip.searchAs)}`}
          className="inline-block rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
        >
          Find a {tip.specialty} near me →
        </Link>
      </div>
    </details>
  );
}

function Section({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div>
      <h3 className={`mb-1 font-semibold ${color}`}>{title}</h3>
      <ul className="list-disc space-y-0.5 pl-5 text-slate-700">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
