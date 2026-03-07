// components/ui/DailyGoalItem.jsx
export default function DailyGoalItem({ goal }) {
  const isCompleted = goal.status === "completed";
  const pct = Math.round((goal.value / goal.max) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{goal.label}</span>
        <span
          className="text-xs font-semibold"
          style={{ color: isCompleted ? "#4ade80" : "#6b7280" }}
        >
          {isCompleted ? "Completed" : `Pending`}
        </span>
      </div>
      {/* Sub label for pending */}
      {!isCompleted && (
        <p className="text-xs text-gray-600">
          Issue Reports ({goal.value}/{goal.max})
        </p>
      )}
      {/* Progress Bar */}
      <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isCompleted ? "#4ade80" : "#374151",
          }}
        />
      </div>
    </div>
  );
}
