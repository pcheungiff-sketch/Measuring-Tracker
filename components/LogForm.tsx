'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ACTIVITY_CATEGORIES } from '@/lib/types'
import type { Entry } from '@/lib/types'

interface Props {
  initialEntry: Entry | null
  today: string
}

const HAPPINESS_LABELS: Record<number, string> = {
  1: 'Really rough', 2: 'Hard day', 3: 'Below par', 4: 'Okay',
  5: 'Fine', 6: 'Pretty good', 7: 'Good', 8: 'Really good',
  9: 'Excellent', 10: 'Best possible',
}

const ENERGY_LABELS: Record<number, string> = {
  1: 'Depleted', 2: 'Very low', 3: 'Low', 4: 'Slightly low',
  5: 'Okay', 6: 'Decent', 7: 'Good', 8: 'Energised',
  9: 'High energy', 10: 'Peak',
}

const ANXIETY_LABELS: Record<number, string> = {
  1: 'Calm', 2: 'Very relaxed', 3: 'At ease', 4: 'Slightly tense',
  5: 'Noticeable', 6: 'Elevated', 7: 'High', 8: 'Very high',
  9: 'Intense', 10: 'Overwhelming',
}

export default function LogForm({ initialEntry, today }: Props) {
  const router = useRouter()
  const [happiness, setHappiness] = useState(initialEntry?.happiness ?? 7)
  const [energy, setEnergy] = useState(initialEntry?.energy ?? 6)
  const [anxiety, setAnxiety] = useState(initialEntry?.anxiety ?? 3)
  const [journal, setJournal] = useState(initialEntry?.journal ?? '')
  const [activities, setActivities] = useState<Set<string>>(
    new Set(initialEntry?.activities ?? [])
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function toggleActivity(id: string) {
    setActivities(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          happiness,
          energy,
          anxiety,
          journal,
          activities: Array.from(activities),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }

      setSaved(true)
      setTimeout(() => {
        router.push('/insights')
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="animate-slide-up text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-stone-300 text-lg font-light">Saved.</p>
        <p className="text-stone-500 text-sm mt-2">Heading to your insights...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Sliders */}
      <section className="space-y-7">
        <SliderField
          label="Happiness"
          value={happiness}
          onChange={setHappiness}
          colorClass=""
          labelMap={HAPPINESS_LABELS}
          accentColor="#6366f1"
        />
        <SliderField
          label="Energy"
          value={energy}
          onChange={setEnergy}
          colorClass="energy"
          labelMap={ENERGY_LABELS}
          accentColor="#f59e0b"
        />
        <SliderField
          label="Anxiety"
          value={anxiety}
          onChange={setAnxiety}
          colorClass="anxiety"
          labelMap={ANXIETY_LABELS}
          accentColor="#ec4899"
          invertedColor
        />
      </section>

      {/* Activities */}
      <section>
        <h2 className="text-xs text-stone-500 uppercase tracking-widest mb-5">
          What happened today
        </h2>
        <div className="space-y-5">
          {ACTIVITY_CATEGORIES.map(category => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">
                  {category.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.items.map(item => {
                  const active = activities.has(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleActivity(item.id)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all
                        ${active
                          ? 'bg-stone-100 text-stone-900 font-medium'
                          : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-600 hover:text-stone-300'
                        }
                      `}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journal */}
      <section>
        <label className="block text-xs text-stone-500 uppercase tracking-widest mb-3">
          Anything else
        </label>
        <textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Notes, reflections, what's on your mind..."
          rows={4}
          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-4 py-3 text-stone-200 placeholder-stone-600 text-sm resize-none focus:outline-none focus:border-stone-600 transition-colors leading-relaxed"
        />
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-stone-100 text-stone-900 font-medium px-6 py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? 'Saving...' : initialEntry ? 'Update entry' : 'Save entry'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </form>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  onChange: (v: number) => void
  colorClass: string
  labelMap: Record<number, string>
  accentColor: string
  invertedColor?: boolean
}

function SliderField({ label, value, onChange, colorClass, labelMap, accentColor, invertedColor }: SliderFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-xs text-stone-500 uppercase tracking-widest">{label}</label>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light" style={{ color: invertedColor && value > 5 ? '#ef4444' : accentColor }}>
            {value}
          </span>
          <span className="text-stone-500 text-sm">{labelMap[value]}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full ${colorClass}`}
          style={{
            // Filled track
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${(value - 1) / 9 * 100}%, #292524 ${(value - 1) / 9 * 100}%, #292524 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-stone-700 text-xs">1</span>
          <span className="text-stone-700 text-xs">10</span>
        </div>
      </div>
    </div>
  )
}
