import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { getTeamFlag } from '../../lib/teamMeta'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    try {
      const [{ data: picks, error: picksError }, { data: teams, error: teamsError }] = await Promise.all([
        supabase.from('picks').select('*').order('submitter_name').order('rank'),
        supabase.from('teams').select('id,name')
      ])
      if (picksError) throw picksError
      if (teamsError) throw teamsError

      const teamNames = Object.fromEntries((teams || []).map((team) => [team.id, team.name]))
      const grouped = {}
      for (const pick of picks || []) {
        const submitter = pick.submitter_name || String(pick.user_id || 'Sin nombre')
        if (!grouped[submitter]) grouped[submitter] = { submitter, count: 0, created_at: pick.created_at, picks: [] }
        grouped[submitter].count += 1
        grouped[submitter].created_at = grouped[submitter].created_at < pick.created_at ? grouped[submitter].created_at : pick.created_at
        const teamName = teamNames[pick.team_id] || 'Equipo desconocido'
        grouped[submitter].picks.push({
          id: pick.id,
          team_id: pick.team_id,
          team_name: teamName,
          flag: getTeamFlag(teamName),
          rank: pick.rank,
          multiplier: pick.multiplier
        })
      }

      return res.status(200).json({ submissions: Object.values(grouped).sort((a, b) => a.submitter.localeCompare(b.submitter, 'es')) })
    } catch (err) {
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  if (req.method === 'DELETE') {
    const { submitter_name } = req.body || {}
    if (!submitter_name) return res.status(400).json({ error: 'submitter_name required' })

    const { data, error } = await supabase.from('picks').delete().eq('submitter_name', submitter_name).select('id')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, deleted: data?.length || 0 })
  }

  return res.status(405).end()
}
