import { calculateGroupQualification } from './groupQualification'
import { applyPlayedMatchScore, calculateTeamPoints, emptyTeamScore, findKnockoutTiesMissingWinner, isGroupStage } from './scoring'
import { ACHIEVEMENT_COLUMNS_SQL, isMissingAchievementColumns } from './schemaStatus'
import { getMatchWinner, syncTournamentProgression } from './tournamentProgression'

const STAGE_REACHED_FIELD = {
  round_of_32: 'reached_round_of_32',
  round_of_16: 'reached_round_of_16',
  quarter_final: 'reached_quarter_final',
  semi_final: 'reached_semi_final',
  final: 'reached_final'
}

export async function recomputeTeamPoints(supabase) {
  let schemaMissing = false
  let { data: teams, error: teamError } = await supabase
    .from('teams')
    .select('id, passed_group, group_finish_position, phases_advanced, reached_round_of_32, reached_round_of_16, reached_quarter_final, reached_semi_final, reached_final, finalist, third_place, champion')

  if (teamError && isMissingAchievementColumns(teamError)) {
    schemaMissing = true
    const fallback = await supabase.from('teams').select('id')
    teams = fallback.data
    teamError = fallback.error
  }
  if (teamError) throw teamError
  if (!teams || teams.length === 0) {
    const error = new Error('No teams found')
    error.statusCode = 400
    throw error
  }

  const scores = Object.fromEntries(teams.map((team) => [team.id, emptyTeamScore()]))

  let { data: matches, error: matchError } = await supabase.from('matches').select('*')
  if (matchError) throw matchError

  await syncTournamentProgression(supabase, matches || [])

  const refreshed = await supabase.from('matches').select('*')
  if (refreshed.error) throw refreshed.error
  matches = refreshed.data || []

  const tiesMissingWinner = findKnockoutTiesMissingWinner(matches)
  if (tiesMissingWinner.length > 0) {
    const error = new Error('Hay eliminatorias jugadas y empatadas sin equipo clasificado por penaltis. Selecciona quien pasa antes de recalcular.')
    error.statusCode = 400
    error.pending_winner_match_ids = tiesMissingWinner.map((match) => match.id)
    throw error
  }

  for (const match of matches || []) applyPlayedMatchScore(scores, match)

  const { data: redCards, error: eventError } = await supabase
    .from('match_events')
    .select('team_id, match_id')
    .eq('event_type', 'red_card')
  if (eventError) throw eventError

  const playedMatchIds = new Set((matches || []).filter((match) => match.played).map((match) => match.id))
  for (const event of redCards || []) {
    if (playedMatchIds.has(event.match_id) && scores[event.team_id]) scores[event.team_id].red_cards += 1
  }

  const qualification = calculateGroupQualification(matches || [])
  for (const teamId of qualification.qualified) {
    if (scores[teamId]) {
      scores[teamId].passed_group = true
      scores[teamId].reached_round_of_32 = true
    }
  }

  for (const group of Object.values(qualification.groups || {})) {
    if (!group.complete) continue
    const first = group.table[0]?.team_id
    const second = group.table[1]?.team_id
    const third = group.table[2]?.team_id
    if (scores[first]) scores[first].group_finish_position = 1
    if (scores[second]) scores[second].group_finish_position = 2
    if (scores[third] && qualification.qualified.has(third)) scores[third].group_finish_position = 3
  }

  for (const match of matches || []) {
    if (isGroupStage(match.stage)) continue
    if (!match.played) continue

    const reachedField = STAGE_REACHED_FIELD[match.stage]
    if (reachedField) {
      if (scores[match.home_team_id]) scores[match.home_team_id][reachedField] = true
      if (scores[match.away_team_id]) scores[match.away_team_id][reachedField] = true
    }

    const winnerId = getMatchWinner(match)
    if (!winnerId || !scores[winnerId]) continue

    if (match.stage === 'third_place') scores[winnerId].third_place = true
    if (match.stage === 'final') scores[winnerId].champion = true
  }

  if (!schemaMissing) {
    const updates = teams.map((team) => ({
      id: team.id,
      passed_group: Boolean(scores[team.id]?.passed_group),
      group_finish_position: Number(scores[team.id]?.group_finish_position || 0),
      phases_advanced: Number(scores[team.id]?.phases_advanced || 0),
      reached_round_of_32: Boolean(scores[team.id]?.reached_round_of_32),
      reached_round_of_16: Boolean(scores[team.id]?.reached_round_of_16),
      reached_quarter_final: Boolean(scores[team.id]?.reached_quarter_final),
      reached_semi_final: Boolean(scores[team.id]?.reached_semi_final),
      reached_final: Boolean(scores[team.id]?.reached_final),
      finalist: Boolean(scores[team.id]?.reached_final),
      third_place: Boolean(scores[team.id]?.third_place),
      champion: Boolean(scores[team.id]?.champion)
    }))

    for (const update of updates) {
      const { id, ...teamUpdates } = update
      const { error } = await supabase.from('teams').update(teamUpdates).eq('id', id)
      if (error) throw error
    }
  }

  const upserts = Object.entries(scores).map(([team_id, score]) => ({
    team_id,
    points: calculateTeamPoints(score),
    last_updated: new Date().toISOString()
  }))

  if (upserts.length > 0) {
    const { error } = await supabase.from('team_points').upsert(upserts, { onConflict: 'team_id' })
    if (error) throw error
  }

  return {
    computed: upserts.length,
    method: schemaMissing ? 'matches_events_without_achievement_columns' : 'matches_events_achievements',
    groups_complete: qualification.allGroupsComplete,
    qualified_count: qualification.qualified.size,
    schema_missing: schemaMissing,
    setup_sql: schemaMissing ? ACHIEVEMENT_COLUMNS_SQL : undefined
  }
}
