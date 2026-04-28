import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'
import { TransactionType, TransactionSource } from '@prisma/client'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return

  try {
    const userId = requireAuth(req)

    if (req.method === 'GET') {
      const { page = 1, limit = 50, type, category_id, start_date, end_date } = req.query

      const where: any = { user_id: userId, deleted_at: null }
      if (type) where.transaction_type = type as TransactionType
      if (category_id) where.category_id = category_id as string
      if (start_date || end_date) {
        where.transaction_at = {
          ...(start_date && { gte: new Date(start_date as string) }),
          ...(end_date && { lte: new Date(end_date as string) }),
        }
      }

      const [data, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { category: true },
          orderBy: { transaction_at: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.transaction.count({ where }),
      ])

      return ok(res, { data, total, page: Number(page), limit: Number(limit) })
    }

    if (req.method === 'POST') {
      const { amount, description, transaction_type, transaction_at, category_id, merchant } = req.body

      if (!amount || !description || !transaction_type || !transaction_at) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' })
      }

      const tx = await prisma.transaction.create({
        data: {
          user_id: userId,
          amount,
          description,
          transaction_type: transaction_type as TransactionType,
          transaction_source: TransactionSource.MANUAL,
          transaction_at: new Date(transaction_at),
          category_id: category_id || null,
          merchant: merchant || null,
          confirmed: true,
        },
        include: { category: true },
      })

      return ok(res, tx)
    }

    return res.status(405).end()
  } catch (e) {
    return fail(res, e)
  }
}
