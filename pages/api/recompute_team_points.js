import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { recomputeTeamPoints } from '../../lib/recomputeTeamPoints'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  try {
    const result = await recomputeTeamPoints(supabase)
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: err.message || String(err),
      pending_winner_match_ids: err.pending_winner_match_ids
    })
  }
}
