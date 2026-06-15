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

  const matches = getWorldCupGroupMatches().map((match) => ({
    home_team_id: teamByName[match.home_team_name],
    away_team_id: teamByName[match.away_team_name],
    stage: match.stage,
    starts_at: match.starts_at
  }))

  if (matches.some((match) => !match.home_team_id || !match.away_team_id)) {
    return res.status(500).json({ error: 'No todos los equipos están disponibles para crear partidos' })
  }

  const { data: existingMatches, error: matchesError } = await supabase
    .from('matches')
    .select('id,home_team_id,away_team_id,stage')
    .like('stage', 'group_%')
  if (matchesError) return res.status(500).json({ error: matchesError.message })

  const existingByFixture = new Map((existingMatches || []).map((match) => [
    `${match.stage}:${match.home_team_id}:${match.away_team_id}`,
    match
  ]))

  let imported = 0
  let updated = 0

  for (const match of matches) {
    const existing = existingByFixture.get(`${match.stage}:${match.home_team_id}:${match.away_team_id}`)
    if (existing) {
      const { error } = await supabase
        .from('matches')
        .update({ starts_at: match.starts_at })
        .eq('id', existing.id)
      if (error) return res.status(500).json({ error: error.message })
      updated += 1
    } else {
      const { error } = await supabase.from('matches').insert([match])
      if (error) return res.status(500).json({ error: error.message })
      imported += 1
    }
  }

  return res.status(200).json({ imported, updated, total: matches.length })
}
