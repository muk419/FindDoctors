const MESSAGE =
  "🚀 We're coming with exciting new features soon!  •  🧪 This app is for testing purposes only — please verify doctor and hospital details before visiting.";

/** Scrolling banner at the top of the page. */
export function AnnouncementBar() {
  return (
    <div
      className="overflow-hidden bg-gradient-to-r from-teal-700 to-indigo-700 py-1 text-xs text-white sm:py-1.5 sm:text-sm"
      role="status"
    >
      <div className="marquee flex w-max whitespace-nowrap hover:[animation-play-state:paused]">
        {/* Two copies so the text loops without a gap. */}
        <span className="px-8">{MESSAGE}</span>
        <span className="px-8" aria-hidden>
          {MESSAGE}
        </span>
      </div>
    </div>
  );
}
