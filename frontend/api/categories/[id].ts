import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)
    const { id } = req.query as { id: string }

    const existing = await prisma.category.findFirst({ where: { id, user_id: userId } })
    if (!existing) return res.status(404).json({ success: false, message: 'Categoría no encontrada' })

    if (req.method === 'PATCH') {
      const { name, icon, color } = req.body
      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(icon !== undefined && { icon }),
          ...(color !== undefined && { color }),
        },
      })
      return ok(res, category)
    }

    if (req.method === 'DELETE') {
      await prisma.category.delete({ where: { id } })
      return ok(res, null)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
