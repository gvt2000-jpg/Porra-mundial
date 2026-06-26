import { calculateGroupQualification } from './groupQualification'
import { thirdPlaceAssignmentForGroups } from './thirdPlaceCombinations'

export const KNOCKOUT_TEMPLATE = [
  { order: 73, stage: 'round_of_32', home: '2A', away: '2B' },
  { order: 74, stage: 'round_of_32', home: '1E', away: '3A/B/C/D/F' },
  { order: 75, stage: 'round_of_32', home: '1F', away: '2C' },
  { order: 76, stage: 'round_of_32', home: '1C', away: '2F' },
  { order: 77, stage: 'round_of_32', home: '1I', away: '3C/D/F/G/H' },
  { order: 78, stage: 'round_of_32', home: '2E', away: '2I' },
  { order: 79, stage: 'round_of_32', home: '1A', away: '3C/E/F/H/I' },
  { order: 80, stage: 'round_of_32', home: '1L', away: '3E/H/I/J/K' },
  { order: 81, stage: 'round_of_32', home: '1D', away: '3B/E/F/I/J' },
  { order: 82, stage: 'round_of_32', home: '1G', away: '3A/E/H/I/J' },
  { order: 83, stage: 'round_of_32', home: '2K', away: '2L' },
  { order: 84, stage: 'round_of_32', home: '1H', away: '2J' },
  { order: 85, stage: 'round_of_32', home: '1B', away: '3E/F/G/I/J' },
  { order: 86, stage: 'round_of_32', home: '1J', away: '2H' },
  { order: 87, stage: 'round_of_32', home: '1K', away: '3D/E/I/J/L' },
  { order: 88, stage: 'round_of_32', home: '2D', away: '2G' },
  { order: 89, stage: 'round_of_16', home: 'W74', away: 'W77' },
  { order: 90, stage: 'round_of_16', home: 'W73', away: 'W75' },
  { order: 91, stage: 'round_of_16', home: 'W76', away: 'W78' },
  { order: 92, stage: 'round_of_16', home: 'W79', away: 'W80' },
  { order: 93, stage: 'round_of_16', home: 'W83', away: 'W84' },
  { order: 94, stage: 'round_of_16', home: 'W81', away: 'W82' },
  { order: 95, stage: 'round_of_16', home: 'W86', away: 'W88' },
  { order: 96, stage: 'round_of_16', home: 'W85', away: 'W87' },
  { order: 97, stage: 'quarter_final', home: 'W89', away: 'W90' },
  { order: 98, stage: 'quarter_final', home: 'W93', away: 'W94' },
  { order: 99, stage: 'quarter_final', home: 'W91', away: 'W92' },
  { order: 100, stage: 'quarter_final', home: 'W95', away: 'W96' },
  { order: 101, stage: 'semi_final', home: 'W97', away: 'W98' },
  { order: 102, stage: 'semi_final', home: 'W99', away: 'W100' },
  { order: 103, stage: 'third_place', home: 'L101', away: 'L102' },
  { order: 104, stage: 'final', home: 'W101', away: 'W102' }
]

export const KNOCKOUT_STAGES = [
  { key: 'round_of_32', label: 'Dieciseisavos' },
  { key: 'round_of_16', label: 'Octavos' },
  { key: 'quarter_final', label: 'Cuartos' },
  { key: 'semi_final', label: 'Semifinales' },
  { key: 'third_place', label: 'Tercer puesto' },
  { key: 'final', label: 'Final' }
]

export function getMatchWinner(match) {
  if (!match?.played) return null
  const homeScore = Number(match.home_score || 0)
  const awayScore = Number(match.away_score || 0)
  if (homeScore > awayScore) return match.home_team_id
  if (awayScore > homeScore) return match.away_team_id
  return match.winner_team_id || null
}

export function getMatchLoser(match) {
  const winner = getMatchWinner(match)
  if (!winner) return null
  if (winner === match.home_team_id) return match.away_team_id
  if (winner === match.away_team_id) return match.home_team_id
  return null
}

function groupSlotTeamId(slot, qualification) {
  const position = Number(slot[0])
  const group = slot[1]
  return qualification.groups?.[group]?.table?.[position - 1]?.team_id || null
}

function thirdPlaceTeamId(slot, qualification) {
  const candidates = slot.slice(1).split('/')
  return (qualification.thirdPlaced || []).find((standing) => candidates.includes(standing.group))?.team_id || null
}

export function resolveTemplateSlot(slot, matchesByOrder, qualification) {
  if (!slot) return null
  if (/^[12][A-L]$/.test(slot)) return groupSlotTeamId(slot, qualification)
  if (/^3[A-L](\/[A-L])+$/.test(slot)) return thirdPlaceTeamId(slot, qualification)

  const source = slot.match(/^([WL])(\d+)$/)
  if (!source) return null

  const match = matchesByOrder[Number(source[2])]
  if (!match) return null
  return source[1] === 'W' ? getMatchWinner(match) : getMatchLoser(match)
}

export function buildVirtualBracket(matches, options = {}) {
  const qualification = calculateGroupQualification(matches, options)
  const matchesByOrder = Object.fromEntries((matches || []).filter((match) => match.bracket_order).map((match) => [Number(match.bracket_order), match]))
  const thirdGroupByTeamId = Object.fromEntries((qualification.thirdPlaced || []).map((standing) => [standing.team_id, standing.group]))
  const usedThirdGroups = new Set()
  const qualifiedThirdGroups = (qualification.thirdPlaced || [])
    .filter((standing) => qualification.qualified.has(standing.team_id))
    .map((standing) => standing.group)
  const thirdPlaceAssignments = qualifiedThirdGroups.length === 8 ? thirdPlaceAssignmentForGroups(qualifiedThirdGroups) : null

  function thirdStandingByGroup(group) {
    return (qualification.thirdPlaced || []).find((standing) => standing.group === group)
  }

  function resolveSlot(slot, order) {
    if (/^3[A-L](\/[A-L])+$/.test(slot || '')) {
      const assignedGroup = thirdPlaceAssignments?.[order]
      if (assignedGroup) return thirdStandingByGroup(assignedGroup)?.team_id || null

      const candidates = slot.slice(1).split('/')
      const standing = (qualification.thirdPlaced || []).find((item) => candidates.includes(item.group) && !usedThirdGroups.has(item.group))
      if (!standing) return null
      usedThirdGroups.add(standing.group)
      return standing.team_id
    }
    return resolveTemplateSlot(slot, matchesByOrder, qualification)
  }

  return KNOCKOUT_TEMPLATE.map((template) => {
    const existing = matchesByOrder[template.order]
    if (existing) {
      if (/^3[A-L](\/[A-L])+$/.test(template.home || '') && thirdGroupByTeamId[existing.home_team_id]) usedThirdGroups.add(thirdGroupByTeamId[existing.home_team_id])
      if (/^3[A-L](\/[A-L])+$/.test(template.away || '') && thirdGroupByTeamId[existing.away_team_id]) usedThirdGroups.add(thirdGroupByTeamId[existing.away_team_id])
    }
    const resolvedHomeTeamId = resolveSlot(template.home, template.order)
    const resolvedAwayTeamId = resolveSlot(template.away, template.order)
    const homeTeamId = resolvedHomeTeamId || existing?.home_team_id
    const awayTeamId = resolvedAwayTeamId || existing?.away_team_id
    return {
      ...template,
      match: existing || null,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      ready: Boolean(homeTeamId && awayTeamId)
    }
  })
}

export async function syncTournamentProgression(supabase, matches, options = {}) {
  const currentMatches = matches || []
  const virtualBracket = buildVirtualBracket(currentMatches, options)
  const existingByOrder = Object.fromEntries(currentMatches.filter((match) => match.bracket_order).map((match) => [Number(match.bracket_order), match]))
  const created = []
  const updated = []

  for (const slot of virtualBracket) {
    if (!slot.ready) continue

    const existing = existingByOrder[slot.order]
    const payload = {
      home_team_id: slot.home_team_id,
      away_team_id: slot.away_team_id,
      stage: slot.stage,
      bracket_order: slot.order,
      home_source: slot.home,
      away_source: slot.away
    }

    if (!existing) {
      const { data, error } = await supabase.from('matches').insert([payload]).select().single()
      if (error) throw error
      created.push(data)
      existingByOrder[slot.order] = data
      currentMatches.push(data)
    } else if (existing.home_team_id !== payload.home_team_id || existing.away_team_id !== payload.away_team_id || existing.stage !== payload.stage) {
      const { data, error } = await supabase.from('matches').update(payload).eq('id', existing.id).select().single()
      if (error) throw error
      updated.push(data)
      existingByOrder[slot.order] = data
      const index = currentMatches.findIndex((match) => match.id === data.id)
      if (index >= 0) currentMatches[index] = data
    }
  }

  return { created, updated, bracket: virtualBracket }
}
