import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const userId = requireAuth(req)
    const { refresh_token } = req.body

    if (refresh_token) {
      await prisma.refreshToken.updateMany({
        where: { user_id: userId, token_hash: refresh_token },
        data: { revoked_at: new Date() },
      })
    }

    return ok(res, null)
  } catch (e) {
    return fail(res, e)
  }
}
