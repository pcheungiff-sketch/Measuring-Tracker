'use client'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 text-sm text-stone-300">
          <span className="text-green-400">✓</span>
          Check your email — a sign-in link is on its way to <span className="text-stone-100">{email}</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-stone-500 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-stone-100 text-stone-900 font-medium text-sm px-5 py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? 'Sending...' : 'Send link'}
      </button>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </form>
  )
}
