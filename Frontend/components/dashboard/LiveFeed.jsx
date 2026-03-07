"use client"
import { LIVE_FEED } from '../../lib/data'
import StatusBadge from '../ui/StatusBadge'

export default function LiveFeed() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          Live Feed
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500 tracking-widest uppercase">
            Real-Time Updates
          </span>
        </div>
      </div>

      {LIVE_FEED.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  )
}

function FeedItem({ item }) {
  return (
    <div
      className="card flex items-center gap-4 p-4 cursor-pointer transition-all duration-200"
      style={{ borderRadius: '12px' }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(74,222,128,0.2)'
        e.currentTarget.style.background = '#142b1c'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.background = ''
      }}
    >
      {/* Avatar placeholder */}
      <div
        className="w-12 h-12 rounded-xl flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{item.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <PinIcon /> {item.location}
          </span>
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <ClockIcon /> {item.time}
          </span>
        </div>
      </div>

      <StatusBadge status={item.status} />
    </div>
  )
}

function PinIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
