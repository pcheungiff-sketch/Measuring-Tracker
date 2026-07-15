import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { sql } from '@vercel/postgres'

const JWT_SECRET = process.env.JWT_SECRET!
const SESSION_COOKIE = 'ht_session'

export interface SessionPayload {
  userId: number
  email: string
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' })
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: '/',
  })
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE)
}

export async function getOrCreateUser(email: string): Promise<{ id: number; email: string }> {
  const existing = await sql`
    SELECT id, email FROM users WHERE email = ${email}
  `
  if (existing.rows.length > 0) return existing.rows[0] as { id: number; email: string }
  
  const created = await sql`
    INSERT INTO users (email) VALUES (${email}) RETURNING id, email
  `
  return created.rows[0] as { id: number; email: string }
}
