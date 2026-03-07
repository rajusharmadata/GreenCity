import HeroSection from '../../components/dashboard/HeroSection'
import QuickActions from '../../components/dashboard/QuickActions'
import StatsSection from '../../components/dashboard/StatsSection'
import LiveFeed from '../../components/dashboard/LiveFeed'
import NearbyHotspots from '../../components/dashboard/NearbyHotspots'

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-10 w-full">
      <HeroSection />
      <QuickActions />
      <StatsSection />

      {/* Bottom row: Feed + Map */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <LiveFeed />
        </div>
        <div>
          <NearbyHotspots />
        </div>
      </div>
    </div>
  )
}
