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

    const smallTxs = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        transaction_type: 'EXPENSE',
        deleted_at: null,
        amount: { lt: 30000 },
        transaction_at: { gte: periodStart, lte: new Date(periodEnd.setHours(23, 59, 59)) },
      },
      include: { category: true },
    })

    const map = new Map<string, typeof smallTxs>()
    for (const tx of smallTxs) {
      const key = tx.merchant || tx.category_id || 'unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }

    const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`

    const ants = Array.from(map.entries())
      .filter(([, txs]) => txs.length >= 3)
      .map(([key, txs]) => {
        const total = txs.reduce((s, t) => s + new Decimal(t.amount).toNumber(), 0)
        const avg = total / txs.length
        const projected = total * 12
        const saving = Math.round(total * 0.75)
        return {
          key,
          merchant: txs[0].merchant || 'Sin comercio',
          category: txs[0].category?.name || 'Otros',
          occurrences: txs.length,
          totalAmount: Math.round(total),
          averageAmount: Math.round(avg),
          projectedAnnual: Math.round(projected),
          recommendation: `Gastaste ${fmt(total)} en ${txs.length} transacciones pequeñas. Proyectado anual: ${fmt(projected)}. Si reduces a la mitad, ahorras ${fmt(saving)}/mes — ${fmt(saving * 12)} al año.`,
        }
      })
      .sort((a, b) => b.projectedAnnual - a.projectedAnnual)

    return ok(res, {
      count: ants.length,
      ants,
      totalProjectedAnnual: ants.reduce((s, a) => s + a.projectedAnnual, 0),
    })
  } catch (e) {
    return fail(res, e)
  }
}
