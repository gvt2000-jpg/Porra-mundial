const GROUP_LABELS = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i))

function getGroupName(stage) {
  const match = String(stage || '').match(/^group_?([A-L])$/i)
  return match ? match[1].toUpperCase() : null
}

function emptyStanding(teamId) {
  return {
    team_id: teamId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_diff: 0,
    points: 0,
    fair_play_points: 0,
    fifa_ranking: null
  }
}

function compareOverall(a, b) {
  const aRanking = Number(a.fifa_ranking || Number.MAX_SAFE_INTEGER)
  const bRanking = Number(b.fifa_ranking || Number.MAX_SAFE_INTEGER)
  return (
    b.goal_diff - a.goal_diff ||
    b.goals_for - a.goals_for ||
    b.fair_play_points - a.fair_play_points ||
    aRanking - bRanking ||
    a.team_id.localeCompare(b.team_id)
  )
}

export function sortThirdPlacedStandings(standings) {
  return [...standings].sort((a, b) =>
    b.points - a.points ||
    b.goal_diff - a.goal_diff ||
    b.goals_for - a.goals_for ||
    b.fair_play_points - a.fair_play_points ||
    Number(a.fifa_ranking || Number.MAX_SAFE_INTEGER) - Number(b.fifa_ranking || Number.MAX_SAFE_INTEGER) ||
    a.team_id.localeCompare(b.team_id)
  )
}

function miniStanding(teamId) {
  return { team_id: teamId, points: 0, goals_for: 0, goals_against: 0, goal_diff: 0 }
}

function applyResult(home, away, homeScore, awayScore) {
  home.goals_for += homeScore
  home.goals_against += awayScore
  away.goals_for += awayScore
  away.goals_against += homeScore
  if (homeScore > awayScore) home.points += 3
  else if (awayScore > homeScore) away.points += 3
  else {
    home.points += 1
    away.points += 1
  }
}

function sortHeadToHead(tiedStandings, matches) {
  if (tiedStandings.length <= 1) return tiedStandings
  const tiedIds = new Set(tiedStandings.map((standing) => standing.team_id))
  const mini = new Map(tiedStandings.map((standing) => [standing.team_id, miniStanding(standing.team_id)]))

  for (const match of matches) {
    if (!match.played || !tiedIds.has(match.home_team_id) || !tiedIds.has(match.away_team_id)) continue
    applyResult(mini.get(match.home_team_id), mini.get(match.away_team_id), Number(match.home_score || 0), Number(match.away_score || 0))
  }
  for (const standing of mini.values()) standing.goal_diff = standing.goals_for - standing.goals_against

  const miniByTeamId = Object.fromEntries([...mini.values()].map((standing) => [standing.team_id, standing]))
  const sorted = [...tiedStandings].sort((a, b) => {
    const miniA = miniByTeamId[a.team_id]
    const miniB = miniByTeamId[b.team_id]
    return (
      miniB.points - miniA.points ||
      miniB.goal_diff - miniA.goal_diff ||
      miniB.goals_for - miniA.goals_for
    )
  })

  const ranked = []
  for (let index = 0; index < sorted.length;) {
    const current = sorted[index]
    const currentMini = miniByTeamId[current.team_id]
    const same = sorted.filter((standing) => {
      const standingMini = miniByTeamId[standing.team_id]
      return standingMini.points === currentMini.points &&
        standingMini.goal_diff === currentMini.goal_diff &&
        standingMini.goals_for === currentMini.goals_for
    })
    if (same.length === sorted.length) return [...tiedStandings].sort(compareOverall)
    ranked.push(...(same.length > 1 ? sortHeadToHead(same, matches) : same))
    index += same.length
  }
  return ranked
}

export function sortGroupStandings(standings, matches = []) {
  const byPoints = [...standings].sort((a, b) => b.points - a.points)
  const ranked = []

  for (let index = 0; index < byPoints.length;) {
    const points = byPoints[index].points
    const tied = byPoints.filter((standing) => standing.points === points)
    ranked.push(...(tied.length > 1 ? sortHeadToHead(tied, matches) : tied))
    index += tied.length
  }

  return ranked
}

function applyFairPlay(standingsByTeamId, events, matchIds) {
  for (const event of events || []) {
    if (event.match_id && matchIds && !matchIds.has(event.match_id)) continue
    const standing = standingsByTeamId.get(event.team_id)
    if (!standing) continue
    if (event.event_type === 'red_card') standing.fair_play_points -= 4
    if (event.event_type === 'yellow_card') standing.fair_play_points -= 1
    if (event.event_type === 'second_yellow_red_card') standing.fair_play_points -= 3
    if (event.event_type === 'yellow_and_red_card') standing.fair_play_points -= 5
  }
}

export function calculateGroupQualification(matches, options = {}) {
  const groups = Object.fromEntries(GROUP_LABELS.map((label) => [label, { label, matches: [], standings: new Map() }]))

  for (const match of matches || []) {
    const groupName = getGroupName(match.stage)
    if (!groupName || !groups[groupName]) continue
    groups[groupName].matches.push(match)
    if (!groups[groupName].standings.has(match.home_team_id)) groups[groupName].standings.set(match.home_team_id, emptyStanding(match.home_team_id))
    if (!groups[groupName].standings.has(match.away_team_id)) groups[groupName].standings.set(match.away_team_id, emptyStanding(match.away_team_id))
  }

  for (const group of Object.values(groups)) {
    applyFairPlay(group.standings, options.events, new Set(group.matches.map((match) => match.id).filter(Boolean)))

    for (const match of group.matches) {
      if (!match.played) continue
      const home = group.standings.get(match.home_team_id)
      const away = group.standings.get(match.away_team_id)
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
        away.losses += 1
        home.points += 3
      } else if (awayScore > homeScore) {
        away.wins += 1
        home.losses += 1
        away.points += 3
      } else {
        home.draws += 1
        away.draws += 1
        home.points += 1
        away.points += 1
      }
    }

    for (const standing of group.standings.values()) {
      standing.goal_diff = standing.goals_for - standing.goals_against
    }
  }

  const qualified = new Set()
  const thirdPlaced = []
  const completedGroups = []
  const groupTables = {}

  for (const group of Object.values(groups)) {
    const hasFourTeams = group.standings.size === 4
    const complete = hasFourTeams && group.matches.length === 6 && group.matches.every((match) => match.played)
    const table = sortGroupStandings([...group.standings.values()], group.matches)
    groupTables[group.label] = {
      label: group.label,
      complete,
      table
    }

    if (complete) {
      completedGroups.push(group.label)
      table.slice(0, 2).forEach((standing) => qualified.add(standing.team_id))
      if (table[2]) thirdPlaced.push({ ...table[2], group: group.label })
    }
  }

  const allGroupsComplete = completedGroups.length === GROUP_LABELS.length
  if (allGroupsComplete) {
    sortThirdPlacedStandings(thirdPlaced).slice(0, 8).forEach((standing) => qualified.add(standing.team_id))
  }

  return {
    allGroupsComplete,
    completedGroups,
    qualified,
    thirdPlaced: sortThirdPlacedStandings(thirdPlaced),
    groups: groupTables
  }
}
