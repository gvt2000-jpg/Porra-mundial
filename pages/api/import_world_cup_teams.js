import { supabase } from '../../lib/supabaseServer'
import { worldCupTeams2026 } from '../../lib/worldcupData'
import { requireAdmin } from '../../lib/adminAuth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  const rows = worldCupTeams2026.map((name) => ({ name }))
  const { data, error } = await supabase.from('teams').upsert(rows, { onConflict: 'name' })
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ imported: data?.length ?? 0 })
}
