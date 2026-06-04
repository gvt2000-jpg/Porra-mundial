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
    points: 0
  }
}

function sortStandings(standings) {
  return [...standings].sort((a, b) =>
    b.points - a.points ||
    b.goal_diff - a.goal_diff ||
    b.goals_for - a.goals_for ||
    a.team_id.localeCompare(b.team_id)
  )
}

export function calculateGroupQualification(matches) {
  const groups = Object.fromEntries(GROUP_LABELS.map((label) => [label, { label, matches: [], standings: new Map() }]))

  for (const match of matches || []) {
    const groupName = getGroupName(match.stage)
    if (!groupName || !groups[groupName]) continue
    groups[groupName].matches.push(match)
    if (!groups[groupName].standings.has(match.home_team_id)) groups[groupName].standings.set(match.home_team_id, emptyStanding(match.home_team_id))
    if (!groups[groupName].standings.has(match.away_team_id)) groups[groupName].standings.set(match.away_team_id, emptyStanding(match.away_team_id))
  }

  for (const group of Object.values(groups)) {
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
    const table = sortStandings([...group.standings.values()])
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
    sortStandings(thirdPlaced).slice(0, 8).forEach((standing) => qualified.add(standing.team_id))
  }

  return {
    allGroupsComplete,
    completedGroups,
    qualified,
    thirdPlaced: sortStandings(thirdPlaced),
    groups: groupTables
  }
}
