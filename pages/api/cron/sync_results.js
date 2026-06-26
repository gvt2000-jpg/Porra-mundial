import { supabase } from '../../../lib/supabaseServer'
import { syncApiFootballResults } from '../../../lib/apiFootballSync'
import { recomputeTeamPoints } from '../../../lib/recomputeTeamPoints'

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.authorization === `Bearer ${secret}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()
  if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' })

  try {
    const imported = await syncApiFootballResults(supabase)
    const recomputed = await recomputeTeamPoints(supabase)
    return res.status(200).json({
      ok: true,
      imported,
      recomputed,
      ran_at: new Date().toISOString()
    })
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      ok: false,
      error: err.message || String(err),
      pending_winner_match_ids: err.pending_winner_match_ids
    })
  }
}
