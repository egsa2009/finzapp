import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../_lib/prisma'
import { signAccessToken } from '../_lib/auth'
import { cors, ok, fail } from '../_lib/helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña son requeridos' })
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Este correo ya está registrado' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password_hash, full_name: name, monthly_budget: 0 },
      select: { id: true, email: true, full_name: true, pay_day: true, monthly_budget: true, created_at: true },
    })

    const access_token = signAccessToken(user.id)
    const refresh_token = crypto.randomBytes(32).toString('hex')

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: refresh_token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Crear categorías del sistema para el nuevo usuario
    const systemCategories = await prisma.category.findMany({ where: { is_system: true } })
    if (systemCategories.length === 0) {
      const defaults = [
        { name: 'Hogar', icon: '🏠', color: '#6366F1' },
        { name: 'Transporte', icon: '🚌', color: '#F59E0B' },
        { name: 'Bienestar', icon: '💚', color: '#22C55E' },
        { name: 'Deudas', icon: '💳', color: '#EF4444' },
        { name: 'Ahorro', icon: '🏦', color: '#3B82F6' },
        { name: 'Generosidad', icon: '🎁', color: '#A855F7' },
        { name: 'Otros', icon: '📦', color: '#6B7280' },
      ]
      await prisma.category.createMany({ data: defaults.map(c => ({ ...c, is_system: true })) })
    }

    return ok(res, { access_token, refresh_token, user })
  } catch (e) {
    return fail(res, e)
  }
}
