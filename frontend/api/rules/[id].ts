import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)
    const { id } = req.query as { id: string }

    const existing = await prisma.classificationRule.findFirst({ where: { id, user_id: userId } })
    if (!existing) return res.status(404).json({ success: false, message: 'Regla no encontrada' })

    if (req.method === 'PATCH') {
      const { pattern, category_id, priority, is_active } = req.body
      const rule = await prisma.classificationRule.update({
        where: { id },
        data: {
          ...(pattern && { pattern }),
          ...(category_id && { category_id }),
          ...(priority !== undefined && { priority }),
          ...(is_active !== undefined && { is_active }),
        },
        include: { category: true },
      })
      return ok(res, rule)
    }

    if (req.method === 'DELETE') {
      await prisma.classificationRule.delete({ where: { id } })
      return ok(res, null)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
