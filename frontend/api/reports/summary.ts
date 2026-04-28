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

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        transaction_at: { gte: periodStart, lte: new Date(periodEnd.setHours(23, 59, 59)) },
      },
    })

    const totalIncome = transactions
      .filter(t => t.transaction_type === 'INCOME')
      .reduce((s, t) => s + new Decimal(t.amount).toNumber(), 0)

    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'EXPENSE')
      .reduce((s, t) => s + new Decimal(t.amount).toNumber(), 0)

    const budget = new Decimal(user.monthly_budget).toNumber()
    const daysPassed = Math.max(1, Math.floor((now.getTime() - periodStart.getTime()) / 86400000) + 1)
    const daysInPeriod = Math.floor((periodEnd.getTime() - periodStart.getTime()) / 86400000) + 1
    const projectedExpenses = Math.round((totalExpenses / daysPassed) * daysInPeriod)

    return ok(res, {
      period: { start: periodStart, end: periodEnd },
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      budgetLimit: budget,
      budgetPercentage: budget > 0 ? Math.min(Math.round((totalExpenses / budget) * 100), 100) : 0,
      projectedExpenses,
      remainingBudget: Math.max(budget - totalExpenses, 0),
    })
  } catch (e) {
    return fail(res, e)
  }
}
