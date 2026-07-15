export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import { format } from 'date-fns'

export default async function Home() {
  const session = await getSession()
  if (session) redirect('/log')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <div className="mb-12">
        <p className="text-stone-500 text-sm mb-3">{today}</p>
        <h1 className="text-4xl font-light text-stone-100 mb-3">{greeting}.</h1>
        <p className="text-stone-400 text-lg leading-relaxed max-w-sm">
          A private place to close the day, notice what matters, and build a record you can learn from.
        </p>
      </div>
      <LoginForm />
      <p className="mt-8 text-stone-600 text-xs">
        Enter your email to receive a sign-in link. No password needed.
      </p>
    </div>
  )
}
