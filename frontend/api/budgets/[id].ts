import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)
    const { id } = req.query as { id: string }

    const existing = await prisma.budget.findFirst({ where: { id, user_id: userId } })
    if (!existing) return res.status(404).json({ success: false, message: 'Presupuesto no encontrado' })

    if (req.method === 'PATCH') {
      const { limit_amount } = req.body
      const budget = await prisma.budget.update({
        where: { id },
        data: { limit_amount },
        include: { category: true },
      })
      return ok(res, budget)
    }

    if (req.method === 'DELETE') {
      await prisma.budget.delete({ where: { id } })
      return ok(res, null)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
