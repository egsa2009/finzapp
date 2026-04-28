import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { prisma } from '../_lib/prisma'
import { signAccessToken } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { refresh_token } = req.body
    if (!refresh_token) {
      return res.status(400).json({ success: false, message: 'refresh_token requerido' })
    }

    const stored = await prisma.refreshToken.findFirst({
      where: { token_hash: refresh_token, revoked_at: null },
    })

    if (!stored) return res.status(401).json({ success: false, message: 'Token inválido' })
    if (stored.expires_at < new Date()) {
      return res.status(401).json({ success: false, message: 'Token expirado' })
    }

    // Rotar el refresh token
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked_at: new Date() },
    })

    const new_refresh_token = crypto.randomBytes(32).toString('hex')
    await prisma.refreshToken.create({
      data: {
        user_id: stored.user_id,
        token_hash: new_refresh_token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    const access_token = signAccessToken(stored.user_id)
    return ok(res, { access_token, refresh_token: new_refresh_token })
  } catch (e) {
    return fail(res, e)
  }
}
