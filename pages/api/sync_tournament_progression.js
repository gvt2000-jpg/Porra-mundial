import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { syncTournamentProgression } from '../../lib/tournamentProgression'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  try {
    const { data: matches, error } = await supabase.from('matches').select('*').order('starts_at')
    if (error) throw error

    const result = await syncTournamentProgression(supabase, matches || [])
    return res.status(200).json({
      ok: true,
      created: result.created.length,
      updated: result.updated.length
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
