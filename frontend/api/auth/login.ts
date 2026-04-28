import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../_lib/prisma'
import { signAccessToken } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ success: false, message: 'Credenciales inválidas' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ success: false, message: 'Credenciales inválidas' })

    const access_token = signAccessToken(user.id)
    const refresh_token = crypto.randomBytes(32).toString('hex')

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: refresh_token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return ok(res, {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        pay_day: user.pay_day,
        monthly_budget: user.monthly_budget,
      },
    })
  } catch (e) {
    return fail(res, e)
  }
}
