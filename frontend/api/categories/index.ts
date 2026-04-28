import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)

    if (req.method === 'GET') {
      const categories = await prisma.category.findMany({
        where: { OR: [{ user_id: userId }, { is_system: true }] },
        orderBy: [{ is_system: 'desc' }, { name: 'asc' }],
      })
      return ok(res, categories)
    }

    if (req.method === 'POST') {
      const { name, icon, color } = req.body
      if (!name) return res.status(400).json({ success: false, message: 'Nombre requerido' })

      const category = await prisma.category.create({
        data: { user_id: userId, name, icon, color },
      })
      return ok(res, category)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
