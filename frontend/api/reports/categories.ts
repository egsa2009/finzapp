import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { requireAuth } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'
import { Decimal } from '@prisma/client/runtime/library'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const userId = requireAuth(req)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })

    const now = new Date()
    let periodStart: Date, periodEnd: Date
    if (now.getDate() >= user.pay_day) {
      periodStart = new Date(now.getFullYear(), now.getMonth(), user.pay_day)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, user.pay_day - 1)
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, user.pay_day)
      periodEnd = new Date(now.getFullYear(), now.getMonth(), user.pay_day - 1)
    }

    const prevStart = new Date(periodStart); prevStart.setMonth(prevStart.getMonth() - 1)
    const prevEnd = new Date(periodStart); prevEnd.setDate(prevEnd.getDate() - 1)

    const [categories, allTxs] = await Promise.all([
      prisma.category.findMany({ where: { OR: [{ user_id: userId }, { is_system: true }] } }),
      prisma.transaction.findMany({
        where: {
          user_id: userId,
          transaction_type: 'EXPENSE',
          deleted_at: null,
          transaction_at: { gte: prevStart, lte: new Date(periodEnd.setHours(23, 59, 59)) },
        },
      }),
    ])

    const totalCurrentExpenses = allTxs
      .filter(t => t.transaction_at >= periodStart)
      .reduce((s, t) => s + new Decimal(t.amount).toNumber(), 0)

    const reports = categories.map(cat => {
      const current = allTxs.filter(t => t.category_id === cat.id && t.transaction_at >= periodStart)
      const prev = allTxs.filter(t => t.category_id === cat.id && t.transaction_at < periodStart)
      const currentAmount = current.reduce((s, t) => s + new Decimal(t.amount).toNumber(), 0)
      const prevAmount = prev.reduce((s, t) => s + new Decimal(t.amount).toNumber(), 0)
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        amount: currentAmount,
        percentage: totalCurrentExpenses > 0 ? Math.round((currentAmount / totalCurrentExpenses) * 100) : 0,
        previousAmount: prevAmount,
        trend: prevAmount > 0 ? Math.round(((currentAmount - prevAmount) / prevAmount) * 100) : 0,
      }
    })

    return ok(res, reports.filter(r => r.amount > 0).sort((a, b) => b.amount - a.amount))
  } catch (e) {
    return fail(res, e)
  }
}
