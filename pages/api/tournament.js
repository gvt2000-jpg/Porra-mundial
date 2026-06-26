import { supabase } from '../../lib/supabaseServer'
import { getTeamFlag } from '../../lib/teamMeta'
import { worldCupGroups2026 } from '../../lib/worldcupData'
import { calculateGroupQualification } from '../../lib/groupQualification'
import { KNOCKOUT_STAGES, buildVirtualBracket } from '../../lib/tournamentProgression'

const GROUP_LABELS = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i))

function emptyStats(team) {
  return {
    ...team,
    flag: getTeamFlag(team.name),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_diff: 0,
    group_points: 0,
    red_cards: 0,
    porra_points: 0
  }
}

function applyMatchStats(statsByTeamId, match) {
  if (!match.played) return
  const home = statsByTeamId[match.home_team_id]
  const away = statsByTeamId[match.away_team_id]
  if (!home || !away) return

  const homeScore = Number(match.home_score || 0)
  const awayScore = Number(match.away_score || 0)

  home.played += 1
  away.played += 1
  home.goals_for += homeScore
  home.goals_against += awayScore
  away.goals_for += awayScore
  away.goals_against += homeScore

  if (homeScore > awayScore) {
    home.wins += 1
    home.group_points += 3
    away.losses += 1
  } else if (awayScore > homeScore) {
    away.wins += 1
    away.group_points += 3
    home.losses += 1
  } else {
    home.draws += 1
    away.draws += 1
    home.group_points += 1
    away.group_points += 1
  }
}

function sortStandings(teams) {
  return [...teams].sort((a, b) =>
    b.group_points - a.group_points ||
    b.goal_diff - a.goal_diff ||
    b.goals_for - a.goals_for ||
    a.name.localeCompare(b.name, 'es')
  )
}

function getGroupName(stage) {
  const match = String(stage || '').match(/^group_?([A-L])$/i)
  return match ? match[1].toUpperCase() : null
}

function buildFallbackGroups(teamsByName, statsByTeamId) {
  return worldCupGroups2026.map((group) => {
    return {
      label: group.label,
      teams: sortStandings(group.teams.map((name) => teamsByName[name]).filter(Boolean).map((team) => statsByTeamId[team.id])),
      matches: []
    }
  })
}

function formatMatch(match, teamsById) {
  const home = teamsById[match.home_team_id]
  const away = teamsById[match.away_team_id]
  return {
    id: match.id,
    stage: match.stage,
    bracket_order: match.bracket_order,
    home_source: match.home_source,
    away_source: match.away_source,
    starts_at: match.starts_at,
    played: Boolean(match.played),
    home_score: match.home_score,
    away_score: match.away_score,
    winner_team_id: match.winner_team_id,
    home_team: home ? { id: home.id, name: home.name, flag: getTeamFlag(home.name) } : null,
    away_team: away ? { id: away.id, name: away.name, flag: getTeamFlag(away.name) } : null
  }
}

function formatBracketSlot(slot, teamsById) {
  if (slot.match) return formatMatch(slot.match, teamsById)

  const home = teamsById[slot.home_team_id]
  const away = teamsById[slot.away_team_id]
  return {
    id: `slot-${slot.order}`,
    is_virtual: true,
    stage: slot.stage,
    bracket_order: slot.order,
    home_source: slot.home,
    away_source: slot.away,
    starts_at: null,
    played: false,
    home_score: null,
    away_score: null,
    winner_team_id: null,
    home_team: home ? { id: home.id, name: home.name, flag: getTeamFlag(home.name) } : null,
    away_team: away ? { id: away.id, name: away.name, flag: getTeamFlag(away.name) } : null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [{ data: teams, error: teamsError }, { data: matches, error: matchesError }, { data: events, error: eventsError }, { data: teamPoints, error: pointsError }] = await Promise.all([
      supabase.from('teams').select('id,name,passed_group,group_finish_position,phases_advanced,finalist,third_place,champion').order('name'),
      supabase.from('matches').select('*').order('starts_at'),
      supabase.from('match_events').select('team_id,match_id,event_type'),
      supabase.from('team_points').select('team_id,points')
    ])

    if (teamsError) throw teamsError
    if (matchesError) throw matchesError
    if (eventsError) throw eventsError
    if (pointsError) throw pointsError

    const teamsById = Object.fromEntries((teams || []).map((team) => [team.id, team]))
    const teamsByName = Object.fromEntries((teams || []).map((team) => [team.name, team]))
    const statsByTeamId = Object.fromEntries((teams || []).map((team) => [team.id, emptyStats(team)]))

    for (const point of teamPoints || []) {
      if (statsByTeamId[point.team_id]) statsByTeamId[point.team_id].porra_points = Number(point.points || 0)
    }

    for (const match of matches || []) applyMatchStats(statsByTeamId, match)

    for (const event of events || []) {
      if (event.event_type === 'red_card' && statsByTeamId[event.team_id]) {
        statsByTeamId[event.team_id].red_cards += 1
      }
    }

    for (const stats of Object.values(statsByTeamId)) {
      stats.goal_diff = stats.goals_for - stats.goals_against
    }

    const playedMatchIds = new Set((matches || []).filter((match) => match.played).map((match) => match.id))
    const playedEvents = (events || []).filter((event) => !event.match_id || playedMatchIds.has(event.match_id))
    const qualification = calculateGroupQualification(matches || [], { events: playedEvents })

    const groupMap = Object.fromEntries(GROUP_LABELS.map((label) => [label, { label, teamIds: new Set(), matches: [] }]))
    for (const match of matches || []) {
      const groupName = getGroupName(match.stage)
      if (!groupName || !groupMap[groupName]) continue
      groupMap[groupName].teamIds.add(match.home_team_id)
      groupMap[groupName].teamIds.add(match.away_team_id)
      groupMap[groupName].matches.push(formatMatch(match, teamsById))
    }

    let groups = Object.values(groupMap).map((group) => {
      const table = qualification.groups?.[group.label]?.table || []
      const orderedTeamIds = table.length > 0 ? table.map((standing) => standing.team_id) : [...group.teamIds]
      return {
        label: group.label,
        teams: orderedTeamIds.map((id) => statsByTeamId[id]).filter(Boolean),
        matches: group.matches
      }
    })

    if (groups.every((group) => group.teams.length === 0)) {
      groups = buildFallbackGroups(teamsByName, statsByTeamId)
    }

    const virtualBracket = buildVirtualBracket(matches || [], { events: playedEvents })
    const bracket = KNOCKOUT_STAGES.map((stage) => ({
      ...stage,
      matches: virtualBracket
        .filter((slot) => slot.stage === stage.key)
        .map((slot) => formatBracketSlot(slot, teamsById))
    }))

    return res.status(200).json({
      groups,
      bracket,
      standings: sortStandings(Object.values(statsByTeamId)),
      updated_at: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
