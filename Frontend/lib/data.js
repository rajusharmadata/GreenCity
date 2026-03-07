// lib/data.js — all mock data in one place

export const USER = {
  name: 'Alex',
  avatar: null,
  level: 4,
  tierLabel: 'Eco-Warrior',
  nextLevel: 'Level 5 Master Guardian',
  pointsAway: 450,
  progress: 70,
}

export const DAILY_GOALS = [
  { label: 'Sustainable Commute', status: 'completed', value: 1, max: 1 },
  { label: 'Issue Reports', status: 'pending', value: 0, max: 2 },
]

export const CARBON_OFFSET = 12.4

export const QUICK_ACTIONS = [
  {
    label: 'Report Issue',
    sub: 'Civic reporting',
    color: '#2d1a0a',
    icon: 'megaphone',
    iconColor: '#f59e0b',
  },
  {
    label: 'Eco Routes',
    sub: 'Sustainable paths',
    color: '#0a1f2d',
    icon: 'bike',
    iconColor: '#38bdf8',
  },
  {
    label: 'Leaderboard',
    sub: 'Community rank',
    color: '#1a1200',
    icon: 'chart',
    iconColor: '#f59e0b',
  },
  {
    label: 'My Reports',
    sub: 'View history',
    color: '#0f1a12',
    icon: 'history',
    iconColor: '#9ca3af',
  },
]

export const STATS = [
  {
    label: 'Reports Filed',
    value: '24',
    note: '+3 this week',
    noteColor: '#4ade80',
  },
  {
    label: 'Resolved',
    value: '18',
    note: '75% success rate',
    noteColor: '#4ade80',
  },
  {
    label: 'Eco Points',
    value: '1,250',
    note: 'Top 5% contributors',
    noteColor: '#f59e0b',
  },
  {
    label: 'Global Rank',
    value: '#412',
    note: 'In New York City',
    noteColor: '#38bdf8',
  },
]

export const LIVE_FEED = [
  {
    id: 1,
    title: 'Damaged Solar Street Light',
    location: 'Greenwich Village',
    time: '2h ago',
    status: 'IN PROGRESS',
    statusColor: '#f59e0b',
  },
  {
    id: 2,
    title: 'Overflowing Recycling Bin',
    location: 'Chelsea Market',
    time: '4h ago',
    status: 'PENDING REVIEW',
    statusColor: '#6b7280',
  },
  {
    id: 3,
    title: 'Illegal Parking in Bike Lane',
    location: 'Broadway Ave',
    time: '6h ago',
    status: 'RESOLVED',
    statusColor: '#4ade80',
  },
]

export const NAV_LINKS = [
  { label: 'Dashboard', active: true },
  { label: 'Reports', active: false },
  { label: 'Eco Routes', active: false },
  { label: 'Leaderboard', active: false },
]
