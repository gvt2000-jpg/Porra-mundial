import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { syncApiFootballResults } from '../../lib/apiFootballSync'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  try {
    const result = await syncApiFootballResults(supabase)
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    const status = err.missingApiKey ? 400 : 500
    return res.status(status).json({ error: err.message || String(err) })
  }
}
