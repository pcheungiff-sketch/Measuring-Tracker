'use client'
import { useState } from 'react'
import type { Entry } from '@/lib/types'
import { ALL_ACTIVITIES, ACTIVITY_CATEGORIES } from '@/lib/types'
import { format, parseISO } from 'date-fns'

interface Props { entries: Entry[] }

const CAT_COLOR: Record<string, string> = Object.fromEntries(
  ACTIVITY_CATEGORIES.map(c => [c.id, c.color])
)

function HappinessDot({ value }: { value: number }) {
  const color = value >= 8 ? '#22c55e' : value >= 6 ? '#6366f1' : value >= 4 ? '#f59e0b' : '#ef4444'
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-stone-950"
      style={{ backgroundColor: color }}
    >
      {value}
    </div>
  )
}

export default function HistoryView({ entries }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-500 text-sm">No entries yet.</p>
        <a href="/log" className="text-sm text-stone-400 underline mt-2 inline-block">Log your first day</a>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map(entry => {
        const isOpen = expanded === entry.id
        const date = parseISO(entry.date)
        return (
          <div
            key={entry.id}
            className="border border-stone-800 rounded-xl overflow-hidden transition-colors hover:border-stone-700"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-4">
                <HappinessDot value={entry.happiness} />
                <div>
                  <span className="text-stone-200 text-sm font-medium">
                    {format(date, 'EEEE')}
                  </span>
                  <span className="text-stone-500 text-sm ml-2">
                    {format(date, 'MMM d')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 text-xs text-stone-500">
                  <span>⚡ {entry.energy}</span>
                  <span>〰 {entry.anxiety}</span>
                  {entry.activities.length > 0 && (
                    <span>{entry.activities.length} logged</span>
                  )}
                </div>
                <span className="text-stone-600 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-stone-800/60 pt-4 space-y-4 animate-slide-up">
                {/* Metrics */}
                <div className="flex gap-6">
                  {[
                    { label: 'Happiness', value: entry.happiness, color: '#6366f1' },
                    { label: 'Energy', value: entry.energy, color: '#f59e0b' },
                    { label: 'Anxiety', value: entry.anxiety, color: '#ec4899' },
                  ].map(m => (
                    <div key={m.label}>
                      <span className="text-xl font-light" style={{ color: m.color }}>{m.value}</span>
                      <p className="text-stone-600 text-xs mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Activities */}
                {entry.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.activities.map(actId => {
                      const act = ALL_ACTIVITIES[actId]
                      if (!act) return null
                      const color = CAT_COLOR[act.category] || '#78716c'
                      return (
                        <span
                          key={actId}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: `${color}18`, color }}
                        >
                          {act.emoji} {act.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Journal */}
                {entry.journal && (
                  <p className="text-stone-400 text-sm leading-relaxed border-l-2 border-stone-700 pl-3">
                    {entry.journal}
                  </p>
                )}

                {/* Edit link */}
                <a
                  href={`/log?date=${entry.date}`}
                  className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                >
                  Edit this entry
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
