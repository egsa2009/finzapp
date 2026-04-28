import type { VercelRequest, VercelResponse } from '@vercel/node'

export function cors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }
  return false
}

export function ok(res: VercelResponse, data: unknown) {
  return res.json({ success: true, data })
}

export function fail(res: VercelResponse, error: unknown) {
  const err = error as { status?: number; message?: string }
  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'
  console.error('[API Error]', message)
  return res.status(status).json({ success: false, message })
}
