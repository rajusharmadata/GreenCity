// components/dashboard/NearbyHotspots.jsx
// Replace the SVG map with a real map lib (e.g. react-leaflet or mapbox) as needed.

const HOTSPOTS = [
  { x: 45, y: 32, color: "#4ade80" },
  { x: 70, y: 55, color: "#f59e0b" },
  { x: 52, y: 72, color: "#4ade80" },
];

export default function NearbyHotspots() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
        Nearby Hotspots
      </p>

      <div
        className="card relative overflow-hidden"
        style={{ minHeight: 320, borderRadius: 16 }}
      >
        {/* Map background */}
        <svg
          width="100%" height="100%"
          viewBox="0 0 200 280"
          className="absolute inset-0"
          style={{ opacity: 0.18 }}
        >
          {/* Street grid lines */}
          {[20, 50, 80, 110, 140, 170].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="#4ade80" strokeWidth="0.5" />
          ))}
          {[30, 70, 110, 150].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="280" stroke="#4ade80" strokeWidth="0.5" />
          ))}
          {/* Blocks */}
          <rect x="32" y="22" width="36" height="26" fill="#4ade80" opacity="0.3" rx="2"/>
          <rect x="72" y="22" width="36" height="26" fill="#4ade80" opacity="0.2" rx="2"/>
          <rect x="32" y="52" width="36" height="56" fill="#4ade80" opacity="0.25" rx="2"/>
          <rect x="72" y="52" width="36" height="26" fill="#4ade80" opacity="0.15" rx="2"/>
          <rect x="72" y="82" width="36" height="26" fill="#4ade80" opacity="0.2" rx="2"/>
          <rect x="32" y="112" width="76" height="26" fill="#4ade80" opacity="0.15" rx="2"/>
          <rect x="112" y="22" width="56" height="56" fill="#4ade80" opacity="0.2" rx="2"/>
          <rect x="112" y="82" width="56" height="56" fill="#4ade80" opacity="0.3" rx="2"/>
        </svg>

        {/* Hotspot dots */}
        {HOTSPOTS.map((h, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              background: h.color,
              boxShadow: `0 0 8px ${h.color}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3"
          style={{
            background: "rgba(9,26,14,0.9)",
            borderTop: "1px solid rgba(74,222,128,0.15)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#4ade80">
                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C12.95 21.5 20 15.4 20 10a8 8 0 0 0-8-8z"/>
              </svg>
            </div>
            <span className="text-white text-xs font-semibold">New York, NY</span>
          </div>
          <button className="text-xs font-bold text-green-400 hover:text-green-300 tracking-widest transition-colors">
            EXPAND
          </button>
        </div>
      </div>
    </div>
  );
}
