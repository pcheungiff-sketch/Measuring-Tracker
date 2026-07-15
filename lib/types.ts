export interface User {
  id: number
  email: string
  reminder_time: string
  reminder_enabled: boolean
}

export interface Entry {
  id: number
  user_id: number
  date: string
  happiness: number
  energy: number
  anxiety: number
  journal: string | null
  activities: string[]
}

export interface ActivityItem {
  id: string
  label: string
  emoji: string
}

export interface ActivityCategory {
  id: string
  label: string
  color: string
  items: ActivityItem[]
}

export interface InsightData {
  boosters: { activity: string; category: string; avgHappiness: number; count: number }[]
  drainers: { activity: string; category: string; avgHappiness: number; count: number }[]
  trend: { date: string; happiness: number; energy: number; anxiety: number }[]
  bestDayProfile: {
    topActivities: string[]
    avgHappiness: number
    avgEnergy: number
    avgAnxiety: number
  }
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  {
    id: 'sleep',
    label: 'Sleep',
    color: '#6366f1',
    items: [
      { id: 'slept_well', label: 'Slept well', emoji: '😴' },
      { id: 'napped', label: 'Napped', emoji: '💤' },
      { id: 'slept_poorly', label: 'Slept poorly', emoji: '😵' },
    ],
  },
  {
    id: 'exercise',
    label: 'Movement',
    color: '#f59e0b',
    items: [
      { id: 'gym', label: 'Gym / weights', emoji: '🏋️' },
      { id: 'run', label: 'Run / walk', emoji: '🏃' },
      { id: 'sport', label: 'Sport', emoji: '⚽' },
      { id: 'stretching', label: 'Stretching / yoga', emoji: '🧘' },
    ],
  },
  {
    id: 'social',
    label: 'People',
    color: '#ec4899',
    items: [
      { id: 'quality_time', label: 'Quality time', emoji: '🤝' },
      { id: 'deep_conversation', label: 'Deep conversation', emoji: '💬' },
      { id: 'alone_time', label: 'Intentional alone time', emoji: '🪴' },
      { id: 'social_drain', label: 'Socially drained', emoji: '😶' },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    color: '#14b8a6',
    items: [
      { id: 'deep_work', label: 'Deep work session', emoji: '🎯' },
      { id: 'meetings', label: 'Heavy meetings', emoji: '📅' },
      { id: 'creative', label: 'Creative work', emoji: '✍️' },
      { id: 'admin', label: 'Admin / operations', emoji: '📋' },
    ],
  },
  {
    id: 'spirit',
    label: 'Spirituality',
    color: '#8b5cf6',
    items: [
      { id: 'prayer', label: 'Prayer', emoji: '🙏' },
      { id: 'bible', label: 'Bible reading', emoji: '📖' },
      { id: 'church', label: 'Church / community', emoji: '⛪' },
      { id: 'gratitude', label: 'Gratitude practice', emoji: '💛' },
    ],
  },
  {
    id: 'mental',
    label: 'Mind',
    color: '#0ea5e9',
    items: [
      { id: 'journaled', label: 'Journaled', emoji: '📝' },
      { id: 'learned', label: 'Learned something', emoji: '🧠' },
      { id: 'anxious', label: 'Anxiety episode', emoji: '😰' },
      { id: 'flow', label: 'Flow state', emoji: '⚡' },
    ],
  },
  {
    id: 'leisure',
    label: 'Leisure',
    color: '#22c55e',
    items: [
      { id: 'music', label: 'Music / listening', emoji: '🎵' },
      { id: 'reading', label: 'Reading', emoji: '📚' },
      { id: 'film', label: 'Film / show', emoji: '🎬' },
      { id: 'nature', label: 'Time outdoors', emoji: '🌿' },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    color: '#f97316',
    items: [
      { id: 'ate_well', label: 'Ate well', emoji: '🥗' },
      { id: 'drank_water', label: 'Hydrated', emoji: '💧' },
      { id: 'alcohol', label: 'Alcohol', emoji: '🍷' },
      { id: 'ate_poorly', label: 'Ate poorly', emoji: '🍟' },
    ],
  },
]

export const ALL_ACTIVITIES: Record<string, ActivityItem & { category: string }> = 
  ACTIVITY_CATEGORIES.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.id }))
  ).reduce((acc, item) => ({ ...acc, [item.id]: item }), {})
