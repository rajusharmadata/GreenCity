// components/ui/StatusBadge.jsx
const STATUS_STYLES = {
  "IN PROGRESS": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "PENDING REVIEW": { color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  "RESOLVED": { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)" };
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full tracking-wide"
      style={{ color: style.color, background: style.bg }}
    >
      {status}
    </span>
  );
}
