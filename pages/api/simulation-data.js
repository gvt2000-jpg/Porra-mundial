import { supabase } from '../../lib/supabaseServer'
import { getTeamFlag } from '../../lib/teamMeta'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [{ data: tpoints, error: pointsError }, { data: picks, error: picksError }, { data: teams, error: teamsError }] = await Promise.all([
      supabase.from('team_points').select('*'),
      supabase.from('picks').select('*'),
      supabase.from('teams').select('id,name').order('name')
    ])
    if (pointsError) throw pointsError
    if (picksError) throw picksError
    if (teamsError) throw teamsError

    const teamPoints = Object.fromEntries((tpoints || []).map((row) => [row.team_id, Number(row.points || 0)]))
    const teamNames = Object.fromEntries((teams || []).map((team) => [team.id, team.name]))
    const participants = {}

    for (const pick of picks || []) {
      const submitter = pick.submitter_name || String(pick.user_id || 'Sin nombre')
      if (!participants[submitter]) participants[submitter] = { submitter, picks: [] }
      const teamName = teamNames[pick.team_id] || 'Equipo desconocido'
      participants[submitter].picks.push({
        team_id: pick.team_id,
        team_name: teamName,
        flag: getTeamFlag(teamName),
        rank: Number(pick.rank),
        multiplier: Number(pick.multiplier || 1)
      })
    }

    const normalizedTeams = (teams || []).map((team) => ({
      id: team.id,
      name: team.name,
      flag: getTeamFlag(team.name),
      points: teamPoints[team.id] || 0
    }))

    return res.status(200).json({
      teams: normalizedTeams,
      participants: Object.values(participants).sort((a, b) => a.submitter.localeCompare(b.submitter, 'es'))
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
