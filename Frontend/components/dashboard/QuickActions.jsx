import { QUICK_ACTIONS } from "../../lib/data";

const ICONS = {
  megaphone: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <path d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 0 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  bike: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 3"/><path d="m6 17.5 6-6 2-5h3"/>
    </svg>
  ),
  chart: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  history: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
    </svg>
  ),
};

export default function QuickActions() {
  return (
    <section>
      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
        Quick Actions
      </p>
      <div className="grid grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="card card-hover p-5 text-left flex flex-col gap-3 transition-all duration-200"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: action.color }}
            >
              {ICONS[action.icon]?.(action.iconColor)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{action.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{action.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
