"use client";

import { useEffect, useState } from "react";
import type { Pharmacy } from "@/lib/types";
import { WELCOME_CLOSED_EVENT, WELCOME_SEEN_KEY } from "./WelcomePopup";

// Replace with your real on-call doctor's number (or set NEXT_PUBLIC_CONSULT_PHONE in .env.local).
const PHONE = process.env.NEXT_PUBLIC_CONSULT_PHONE || "+91 90000 12345";
const IS_DEMO = !process.env.NEXT_PUBLIC_CONSULT_PHONE;
const DIGITS = PHONE.replace(/[^\d+]/g, "");
const SEEN_KEY = "finddoctor-consult-seen";

/** Right-side emergency popup (doctor on call + nearest 24×7 medical); collapses to a floating button. */
export function EmergencyConsult({
  medical,
  nearestMedical,
  onShowMedical,
  searching,
}: {
  /** Nearest medical store marked open 24×7, if any. */
  medical: Pharmacy | null;
  /** Nearest medical store of any kind — shown when no 24×7 one is known. */
  nearestMedical: Pharmacy | null;
  onShowMedical: (p: Pharmacy) => void;
  searching: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Slide the popup out once per visit — after the welcome popup has been closed.
  useEffect(() => {
    let seen = false;
    let welcomeDone = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      welcomeDone = sessionStorage.getItem(WELCOME_SEEN_KEY) === "1";
    } catch {}
    if (seen) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      timer = setTimeout(() => {
        setOpen(true);
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
      }, 1500);
    };
    if (welcomeDone) show();
    else window.addEventListener(WELCOME_CLOSED_EVENT, show, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener(WELCOME_CLOSED_EVENT, show);
    };
  }, []);

  return (
    <>
      {/* Floating button (always visible when the popup is closed) */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 z-[1200] flex items-center gap-2 rounded-full bg-red-600 p-2 text-sm sm:bottom-6 sm:py-2.5 sm:pl-3 sm:pr-4 font-semibold text-white shadow-lg transition hover:bg-red-700 ${
          open ? "pointer-events-none scale-75 opacity-0" : "opacity-100"
        }`}
        aria-label="Emergency doctor consult"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-base">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative">🩺</span>
        </span>
        <span className="hidden sm:inline">Doctor & Medical 24×7</span>
      </button>

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-label="Emergency doctor consult"
        aria-hidden={!open}
        className={`fixed bottom-4 right-4 z-[1200] max-h-[calc(100dvh-2rem)] sm:bottom-6 sm:max-h-[calc(100dvh-3rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-red-100 bg-white shadow-2xl transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-red-600 to-rose-500 p-4 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow">
            🩺
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">Emergency consult</p>
            <p className="text-lg font-bold leading-tight">Doctor & Medical 24×7</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm text-slate-700">
            Need urgent medical advice? Consult a doctor instantly on a <b>phone call</b> or <b>video call</b>.
          </p>

          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="text-xs text-red-700">Doctor on call 24×7</p>
            <a href={`tel:${DIGITS}`} className="text-2xl font-bold tracking-wide text-red-700">
              📞 {PHONE}
            </a>
            {IS_DEMO && <p className="mt-0.5 text-[11px] text-slate-500">(demo number — for testing only)</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${DIGITS}`}
              className="rounded-lg bg-red-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-red-700"
            >
              📞 Call now
            </a>
            <a
              href={`https://wa.me/${DIGITS.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-green-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
            >
              🎥 Video call
            </a>
          </div>

          <MedicalSection
            medical={medical ?? nearestMedical}
            is24x7={!!medical}
            searching={searching}
            onShow={(p) => {
              setOpen(false);
              onShowMedical(p);
            }}
          />

          <p className="border-t border-slate-100 pt-2 text-xs text-slate-500">
            Life-threatening emergency? Call{" "}
            <a href="tel:108" className="font-semibold text-red-600 underline">
              108
            </a>{" "}
            (ambulance) or{" "}
            <a href="tel:112" className="font-semibold text-red-600 underline">
              112
            </a>
            .
          </p>
        </div>
      </aside>
    </>
  );
}

function MedicalSection({
  medical,
  is24x7,
  searching,
  onShow,
}: {
  medical: Pharmacy | null;
  is24x7: boolean;
  searching: boolean;
  onShow: (p: Pharmacy) => void;
}) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
        💊 {is24x7 ? "24×7 Medical near you" : "Nearest medical"}
      </p>
      {searching && !medical && <p className="mt-1 text-sm text-slate-500">Finding medicals near you…</p>}
      {!searching && !medical && <p className="mt-1 text-sm text-slate-600">No medical store found nearby.</p>}
      {medical && (
        <>
          <p className="mt-1 font-semibold text-slate-900">{medical.name}</p>
          <p className="text-xs text-slate-600">
            {medical.distanceKm} km away
            {is24x7 ? " · Open 24×7" : medical.openingHours ? ` · ${medical.openingHours}` : " · hours not known"}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {medical.phone ? (
              <a
                href={`tel:${medical.phone}`}
                className="rounded-lg bg-green-600 py-2 text-center text-sm font-semibold text-white hover:bg-green-700"
              >
                📞 Call medical
              </a>
            ) : (
              <span className="rounded-lg bg-slate-100 py-2 text-center text-xs text-slate-500">No phone listed</span>
            )}
            <button
              onClick={() => onShow(medical)}
              className="rounded-lg border border-green-600 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              🧭 Directions
            </button>
          </div>
        </>
      )}
    </div>
  );
}
