import jwt from 'jsonwebtoken'
import type { VercelRequest } from '@vercel/node'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-prod'

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' })
}

export function requireAuth(req: VercelRequest): string {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    throw Object.assign(new Error('No autorizado'), { status: 401 })
  }
  const token = auth.substring(7)
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as { sub: string }
    return payload.sub
  } catch {
    throw Object.assign(new Error('Token inválido o expirado'), { status: 401 })
  }
}
