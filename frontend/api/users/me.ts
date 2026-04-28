import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)

    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, full_name: true, phone: true, pay_day: true, monthly_budget: true, created_at: true },
      })
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
      return ok(res, user)
    }

    if (req.method === 'PATCH') {
      const { full_name, phone, pay_day, monthly_budget } = req.body
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(full_name && { full_name }),
          ...(phone !== undefined && { phone }),
          ...(pay_day && { pay_day: Number(pay_day) }),
          ...(monthly_budget !== undefined && { monthly_budget }),
        },
        select: { id: true, email: true, full_name: true, phone: true, pay_day: true, monthly_budget: true },
      })
      return ok(res, updated)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
