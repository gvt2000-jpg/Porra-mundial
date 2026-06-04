import { supabase } from '../../lib/supabaseServer'
import { worldCupTeams2026, getWorldCupGroupMatches } from '../../lib/worldcupData'
import { requireAdmin } from '../../lib/adminAuth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  await supabase.from('teams').upsert(worldCupTeams2026.map((name) => ({ name })), { onConflict: 'name' })
  const { data: teams, error: teamError } = await supabase.from('teams').select('id,name')
  if (teamError) return res.status(500).json({ error: teamError.message })

  const teamByName = Object.fromEntries((teams || []).map((team) => [team.name, team.id]))
  await supabase.from('matches').delete().like('stage', 'group_%')

  const matches = getWorldCupGroupMatches().map((match) => ({
    home_team_id: teamByName[match.home_team_name],
    away_team_id: teamByName[match.away_team_name],
    stage: match.stage,
    starts_at: match.starts_at
  }))

  if (matches.some((m) => !m.home_team_id || !m.away_team_id)) {
    return res.status(500).json({ error: 'No todos los equipos están disponibles para crear partidos' })
  }

  const { data, error } = await supabase.from('matches').insert(matches)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ imported: data?.length ?? 0 })
}
