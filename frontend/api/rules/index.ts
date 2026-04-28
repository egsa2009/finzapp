import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)

    if (req.method === 'GET') {
      const rules = await prisma.classificationRule.findMany({
        where: { user_id: userId },
        include: { category: true },
        orderBy: { priority: 'desc' },
      })
      return ok(res, rules)
    }

    if (req.method === 'POST') {
      const { pattern, category_id, priority = 100 } = req.body
      if (!pattern || !category_id) {
        return res.status(400).json({ success: false, message: 'pattern y category_id son requeridos' })
      }
      const rule = await prisma.classificationRule.create({
        data: { user_id: userId, pattern, category_id, priority },
        include: { category: true },
      })
      return ok(res, rule)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
