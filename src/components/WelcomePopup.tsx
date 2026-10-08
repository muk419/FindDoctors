"use client";

import { useEffect, useState } from "react";

export const WELCOME_SEEN_KEY = "finddoctor-welcome-seen";
export const WELCOME_CLOSED_EVENT = "finddoctor:welcome-closed";

const HIGHLIGHTS = [
  { icon: "🔎", text: "Find doctors, clinics & hospitals near you" },
  { icon: "🧭", text: "Get directions in one tap" },
  { icon: "💊", text: "Locate 24×7 medicals" },
  { icon: "💡", text: "Simple health tips for everyday illnesses" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Warm welcome shown once per visit; stays until the user closes it. */
export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [hello, setHello] = useState("Welcome");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(WELCOME_SEEN_KEY) === "1";
    } catch {}
    if (seen) return;
    const id = setTimeout(() => {
      setHello(greeting());
      setOpen(true);
    }, 300);
    return () => clearTimeout(id);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
    } catch {}
    window.dispatchEvent(new Event(WELCOME_CLOSED_EVENT));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="splash-pop relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-br from-teal-500 to-indigo-600 px-5 pb-6 pt-6 text-center text-white sm:px-6 sm:pb-8 sm:pt-7">
          <button
            onClick={close}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/90 hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-4xl shadow-lg">
            🩺
          </div>
          <p className="text-sm opacity-90">{hello} 👋</p>
          <h2 id="welcome-title" className="mt-1 text-2xl font-bold">
            Welcome to FindDoctor
          </h2>
          <p className="mt-2 text-sm opacity-95">
            We&apos;re so glad you&apos;re here. Let&apos;s help you find the right care, close to home.
          </p>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <ul className="space-y-2.5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-base">
                  {h.icon}
                </span>
                {h.text}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-xl bg-teal-50 px-4 py-3 text-center text-sm font-medium italic text-teal-800">
            “Health is wealth — take care of yourself and your loved ones.”
          </p>

          <button
            onClick={close}
            className="mt-5 w-full rounded-full bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Let&apos;s get started →
          </button>
        </div>
      </div>
    </div>
  );
}
