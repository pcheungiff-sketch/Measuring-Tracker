import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getOrCreateUser, signSession, setSessionCookie } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/?error=invalid', req.url))

  try {
    const result = await sql`
      SELECT email, expires_at, used 
      FROM magic_links 
      WHERE token = ${token}
    `

    if (result.rows.length === 0) {
      return NextResponse.redirect(new URL('/?error=invalid', req.url))
    }

    const link = result.rows[0]
    
    if (link.used) {
      return NextResponse.redirect(new URL('/?error=used', req.url))
    }

    if (new Date(link.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/?error=expired', req.url))
    }

    // Mark as used
    await sql`UPDATE magic_links SET used = true WHERE token = ${token}`

    // Get or create user
    const user = await getOrCreateUser(link.email)

    // Issue session
    const sessionToken = signSession({ userId: user.id, email: user.email })
    
    const response = NextResponse.redirect(new URL('/log', req.url))
    response.cookies.set('ht_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('verify error:', err)
    return NextResponse.redirect(new URL('/?error=server', req.url))
  }
}
