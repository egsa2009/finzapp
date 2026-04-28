import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)

    if (req.method === 'GET') {
      const budgets = await prisma.budget.findMany({
        where: { user_id: userId },
        include: { category: true },
        orderBy: { month: 'desc' },
      })
      return ok(res, budgets)
    }

    if (req.method === 'POST') {
      const { category_id, month, limit_amount } = req.body
      if (!category_id || !month || !limit_amount) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' })
      }

      const budget = await prisma.budget.upsert({
        where: { user_id_category_id_month: { user_id: userId, category_id, month: new Date(month) } },
        create: { user_id: userId, category_id, month: new Date(month), limit_amount },
        update: { limit_amount },
        include: { category: true },
      })
      return ok(res, budget)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
