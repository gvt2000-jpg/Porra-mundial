import { supabase } from '../../../lib/supabaseServer'
import { getTeamFlag } from '../../../lib/teamMeta'

function teamDto(team) {
  if (!team) return null
  return { id: team.id, name: team.name, flag: getTeamFlag(team.name) }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id required' })

  try {
    const { data: match, error: matchError } = await supabase.from('matches').select('*').eq('id', id).single()
    if (matchError) return res.status(404).json({ error: matchError.message })

    const teamIds = [match.home_team_id, match.away_team_id]
    const [{ data: teams, error: teamsError }, { data: events, error: eventsError }, { data: points, error: pointsError }, { data: picks, error: picksError }] = await Promise.all([
      supabase.from('teams').select('id,name').in('id', teamIds),
      supabase.from('match_events').select('*').eq('match_id', id).order('minute'),
      supabase.from('team_points').select('team_id,points').in('team_id', teamIds),
      supabase.from('picks').select('submitter_name,team_id,rank,multiplier').in('team_id', teamIds)
    ])

    if (teamsError) throw teamsError
    if (eventsError) throw eventsError
    if (pointsError) throw pointsError
    if (picksError) throw picksError

    const teamsById = Object.fromEntries((teams || []).map((team) => [team.id, team]))
    const pointsById = Object.fromEntries((points || []).map((point) => [point.team_id, Number(point.points || 0)]))
    const home = teamsById[match.home_team_id]
    const away = teamsById[match.away_team_id]

    const impacted = {}
    for (const pick of picks || []) {
      const submitter = pick.submitter_name || 'Sin nombre'
      if (!impacted[submitter]) impacted[submitter] = { submitter, teams: [], potential: 0 }
      const teamPoints = pointsById[pick.team_id] || 0
      const contribution = teamPoints * Number(pick.multiplier || 1)
      impacted[submitter].teams.push({
        team_id: pick.team_id,
        team_name: teamsById[pick.team_id]?.name || 'Equipo',
        flag: getTeamFlag(teamsById[pick.team_id]?.name),
        rank: pick.rank,
        multiplier: pick.multiplier,
        team_points: teamPoints,
        contribution
      })
      impacted[submitter].potential += contribution
    }

    return res.status(200).json({
      match: {
        ...match,
        home_team: teamDto(home),
        away_team: teamDto(away)
      },
      events: (events || []).map((event) => ({
        ...event,
        team_name: teamsById[event.team_id]?.name || 'Equipo',
        flag: getTeamFlag(teamsById[event.team_id]?.name)
      })),
      team_points: teamIds.map((teamId) => ({
        team_id: teamId,
        team_name: teamsById[teamId]?.name || 'Equipo',
        flag: getTeamFlag(teamsById[teamId]?.name),
        points: pointsById[teamId] || 0
      })),
      impacted_participants: Object.values(impacted).sort((a, b) => b.potential - a.potential)
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
