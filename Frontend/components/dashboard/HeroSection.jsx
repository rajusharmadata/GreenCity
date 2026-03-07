import { USER, DAILY_GOALS, CARBON_OFFSET } from '../../lib/data'
import CircularProgress from '../ui/CircularProgress'
import DailyGoalItem from '../ui/DailyGoalItem'

export default function HeroSection() {
  return (
    <section>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Good morning, {USER.name} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Your impact today is shaping a greener tomorrow.
        </p>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tier Card */}
        <div
          className="col-span-2 card p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f2417 60%, #1a3a22)',
          }}
        >
          {/* Decorative silhouette */}
          <div
            className="absolute right-0 bottom-0 w-48 h-full opacity-10 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at right, #4ade80 0%, transparent 70%)',
            }}
          />

          <div className="flex items-center gap-8">
            <CircularProgress value={USER.progress} />
            <div>
              <span
                className="text-xs font-semibold tracking-widest px-3 py-1 rounded-full mb-3 inline-block"
                style={{
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.4)',
                  background: 'rgba(74,222,128,0.08)',
                }}
              >
                TIER STATUS
              </span>
              <h2 className="text-3xl font-bold text-white mt-2">
                Level {USER.level} {USER.tierLabel}
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">
                You&apos;re just {USER.pointsAway} points away from achieving{' '}
                {USER.nextLevel} status. Keep it up!
              </p>
              <button
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-green-400 transition-all duration-200 hover:bg-green-400/20"
                style={{
                  border: '1px solid rgba(74,222,128,0.4)',
                  background: 'rgba(74,222,128,0.08)',
                }}
              >
                View My Benefits →
              </button>
            </div>
          </div>
        </div>

        {/* Daily Goals Card */}
        <div className="card p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Daily Goal
          </p>
          {DAILY_GOALS.map((goal) => (
            <DailyGoalItem key={goal.label} goal={goal} />
          ))}
          {/* Carbon Offset */}
          <div
            className="flex items-center gap-3 rounded-xl p-3 mt-1"
            style={{
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.1)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(74,222,128,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ade80">
                <path d="M13 2L4.09 12.26c-.34.43-.03 1.07.5 1.07H11l-1 8.74c-.07.52.67.75.95.29L20.91 11.74c.34-.43.03-1.07-.5-1.07H14l1-8.74c.07-.52-.67-.75-.95-.29z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Carbon Offset Today</p>
              <p className="text-white font-bold text-lg leading-tight">
                {CARBON_OFFSET} kg CO<sub>2</sub>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
