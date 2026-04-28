import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'
import { TransactionType } from '@prisma/client'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)
    const { id } = req.query as { id: string }

    const existing = await prisma.transaction.findFirst({ where: { id, user_id: userId, deleted_at: null } })
    if (!existing) return res.status(404).json({ success: false, message: 'Transacción no encontrada' })

    if (req.method === 'GET') {
      const tx = await prisma.transaction.findUnique({ where: { id }, include: { category: true } })
      return ok(res, tx)
    }

    if (req.method === 'PATCH') {
      const { amount, description, transaction_type, transaction_at, category_id, merchant, confirmed } = req.body
      const tx = await prisma.transaction.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount }),
          ...(description && { description }),
          ...(transaction_type && { transaction_type: transaction_type as TransactionType }),
          ...(transaction_at && { transaction_at: new Date(transaction_at) }),
          ...(category_id !== undefined && { category_id }),
          ...(merchant !== undefined && { merchant }),
          ...(confirmed !== undefined && { confirmed }),
        },
        include: { category: true },
      })
      return ok(res, tx)
    }

    if (req.method === 'DELETE') {
      await prisma.transaction.update({ where: { id }, data: { deleted_at: new Date() } })
      return ok(res, null)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
