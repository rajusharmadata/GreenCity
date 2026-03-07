import { STATS } from "../../lib/data";

export default function StatsSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          My Stats
        </p>
        <button className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors">
          Full Analytics
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ stat }) {
  return (
    <div className="card p-5 flex flex-col gap-2">
      <p className="text-xs text-gray-500">{stat.label}</p>
      <p className="text-4xl font-bold text-white">{stat.value}</p>
      <p className="text-xs" style={{ color: stat.noteColor }}>
        ● {stat.note}
      </p>
    </div>
  );
}
