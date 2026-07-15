import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { computeInsights } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const insights = await computeInsights(session.userId)
    return NextResponse.json({ insights })
  } catch (err) {
    console.error('insights error:', err)
    return NextResponse.json({ error: 'Failed to compute insights' }, { status: 500 })
  }
}
