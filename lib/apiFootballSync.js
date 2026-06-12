const API_BASE_URL = 'https://v3.football.api-sports.io'
const WORLD_CUP_LEAGUE_ID = 1
const WORLD_CUP_SEASON = 2026
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

const API_TEAM_NAME_ALIASES = {
  Belgium: 'Bélgica',
  'Bosnia-Herzegovina': 'Bosnia y Herzegovina',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  Canada: 'Canadá',
  'Cape Verde': 'Cabo Verde',
  Colombia: 'Colombia',
  'Costa Rica': 'Costa Rica',
  'Congo DR': 'RD Congo',
  'Czech Republic': 'República Checa',
  Curacao: 'Curazao',
  Curaçao: 'Curazao',
  England: 'Inglaterra',
  Germany: 'Alemania',
  Haiti: 'Haití',
  Iran: 'Irán',
  Ivory: 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil',
  Japan: 'Japón',
  Mexico: 'México',
  Morocco: 'Marruecos',
  Netherlands: 'Países Bajos',
  Panama: 'Panamá',
  Qatar: 'Catar',
  'Saudi Arabia': 'Arabia Saudí',
  Scotland: 'Escocia',
  Spain: 'España',
  'South Africa': 'Sudáfrica',
  Switzerland: 'Suiza',
  Tunisia: 'Túnez',
  Turkey: 'Turquía',
  Türkiye: 'Turquía',
  USA: 'Estados Unidos',
  'United States': 'Estados Unidos',
  Uzbekistan: 'Uzbekistán'
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function localNameFromApiName(name) {
  return API_TEAM_NAME_ALIASES[name] || name
}

function apiKey() {
  return process.env.API_FOOTBALL_KEY || process.env.APISPORTS_KEY || process.env.API_SPORTS_KEY || ''
}

async function apiFootballGet(path, params = {}) {
  const key = apiKey()
  if (!key) {
    const err = new Error('Falta API_FOOTBALL_KEY en variables de entorno.')
    err.missingApiKey = true
    throw err
  }

  const url = new URL(`${API_BASE_URL}${path}`)
  Object.entries(params).forEach(([param, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(param, String(value))
  })

  const response = await fetch(url, { headers: { 'x-apisports-key': key } })
  const json = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(json?.message || json?.errors?.token || `API-Football error ${response.status}`)
  }
  if (json?.errors && Object.keys(json.errors).length > 0) {
    throw new Error(JSON.stringify(json.errors))
  }
  return json.response || []
}

function teamMaps(teams) {
  const byId = Object.fromEntries((teams || []).map((team) => [team.id, team]))
  const byName = new Map()
  for (const team of teams || []) byName.set(normalizeName(team.name), team)
  return { byId, byName }
}

function localTeamByApiName(apiName, teamsByName) {
  return teamsByName.get(normalizeName(localNameFromApiName(apiName))) || teamsByName.get(normalizeName(apiName)) || null
}

function dateDistance(a, b) {
  if (!a || !b) return Number.MAX_SAFE_INTEGER
  return Math.abs(new Date(a).getTime() - new Date(b).getTime())
}

function findLocalMatch(fixture, matches, homeTeamId, awayTeamId) {
  const fixtureId = Number(fixture.fixture?.id)
  const byExternalId = matches.find((match) => Number(match.api_football_fixture_id) === fixtureId)
  if (byExternalId) return byExternalId

  const candidates = matches.filter((match) => {
    const sameOrder = match.home_team_id === homeTeamId && match.away_team_id === awayTeamId
    const reversed = match.home_team_id === awayTeamId && match.away_team_id === homeTeamId
    return sameOrder || reversed
  })
  if (candidates.length === 0) return null

  return candidates.sort((a, b) => dateDistance(a.starts_at, fixture.fixture?.date) - dateDistance(b.starts_at, fixture.fixture?.date))[0]
}

function winnerTeamIdFromFixture(fixture, homeTeamId, awayTeamId, localMatch) {
  const homeGoals = Number(fixture.goals?.home ?? 0)
  const awayGoals = Number(fixture.goals?.away ?? 0)
  const localHomeIsApiHome = localMatch.home_team_id === homeTeamId

  const localHomeGoals = localHomeIsApiHome ? homeGoals : awayGoals
  const localAwayGoals = localHomeIsApiHome ? awayGoals : homeGoals
  if (localHomeGoals > localAwayGoals) return localMatch.home_team_id
  if (localAwayGoals > localHomeGoals) return localMatch.away_team_id

  if (fixture.teams?.home?.winner === true) return homeTeamId
  if (fixture.teams?.away?.winner === true) return awayTeamId

  const penaltyHome = fixture.score?.penalty?.home
  const penaltyAway = fixture.score?.penalty?.away
  if (penaltyHome !== null && penaltyHome !== undefined && penaltyAway !== null && penaltyAway !== undefined) {
    if (Number(penaltyHome) > Number(penaltyAway)) return homeTeamId
    if (Number(penaltyAway) > Number(penaltyHome)) return awayTeamId
  }

  return null
}

function updatePayloadForFixture(fixture, homeTeamId, awayTeamId, localMatch, canStoreExternalId) {
  const homeGoals = Number(fixture.goals?.home ?? 0)
  const awayGoals = Number(fixture.goals?.away ?? 0)
  const localHomeIsApiHome = localMatch.home_team_id === homeTeamId
  const home_score = localHomeIsApiHome ? homeGoals : awayGoals
  const away_score = localHomeIsApiHome ? awayGoals : homeGoals
  const payload = {
    home_score,
    away_score,
    played: true
  }

  if (canStoreExternalId) payload.api_football_fixture_id = Number(fixture.fixture.id)
  if (!String(localMatch.stage || '').startsWith('group')) {
    payload.winner_team_id = winnerTeamIdFromFixture(fixture, homeTeamId, awayTeamId, localMatch)
  }

  return payload
}

function chunks(items, size) {
  const result = []
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size))
  return result
}

function isRedCardEvent(event) {
  return event?.type === 'Card' && /red/i.test(String(event.detail || ''))
}

export const API_FOOTBALL_FIXTURE_SQL = `ALTER TABLE matches
ADD COLUMN IF NOT EXISTS api_football_fixture_id INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS unique_matches_api_football_fixture_id
ON matches (api_football_fixture_id)
WHERE api_football_fixture_id IS NOT NULL;`

export async function syncApiFootballResults(supabase) {
  const [{ data: teams, error: teamsError }, matchesResponse] = await Promise.all([
    supabase.from('teams').select('id,name'),
    supabase.from('matches').select('*, api_football_fixture_id')
  ])
  if (teamsError) throw teamsError

  let matches = matchesResponse.data || []
  let canStoreExternalId = true
  if (matchesResponse.error) {
    const message = String(matchesResponse.error.message || '')
    if (!message.includes('api_football_fixture_id')) throw matchesResponse.error
    canStoreExternalId = false
    const fallback = await supabase.from('matches').select('*')
    if (fallback.error) throw fallback.error
    matches = fallback.data || []
  }

  const { byName: teamsByName } = teamMaps(teams || [])
  const fixtures = await apiFootballGet('/fixtures', { league: WORLD_CUP_LEAGUE_ID, season: WORLD_CUP_SEASON })
  const finishedFixtures = fixtures.filter((fixture) => FINISHED_STATUSES.has(fixture.fixture?.status?.short))

  const syncedMatchIds = []
  const matchedFixtureIds = []
  const matchIdByFixtureId = {}
  const unmatched = []
  const updates = []

  for (const fixture of finishedFixtures) {
    const homeTeam = localTeamByApiName(fixture.teams?.home?.name, teamsByName)
    const awayTeam = localTeamByApiName(fixture.teams?.away?.name, teamsByName)
    if (!homeTeam || !awayTeam) {
      unmatched.push({ fixture_id: fixture.fixture?.id, home: fixture.teams?.home?.name, away: fixture.teams?.away?.name, reason: 'team_not_found' })
      continue
    }

    const localMatch = findLocalMatch(fixture, matches, homeTeam.id, awayTeam.id)
    if (!localMatch) {
      unmatched.push({ fixture_id: fixture.fixture?.id, home: fixture.teams?.home?.name, away: fixture.teams?.away?.name, reason: 'match_not_found' })
      continue
    }

    const payload = updatePayloadForFixture(fixture, homeTeam.id, awayTeam.id, localMatch, canStoreExternalId)
    const { data, error } = await supabase.from('matches').update(payload).eq('id', localMatch.id).select().single()
    if (error) throw error
    updates.push(data)
    syncedMatchIds.push(localMatch.id)
    const fixtureId = Number(fixture.fixture.id)
    matchedFixtureIds.push(fixtureId)
    matchIdByFixtureId[fixtureId] = localMatch.id
  }

  let redCardsImported = 0
  if (syncedMatchIds.length > 0 && matchedFixtureIds.length > 0) {
    await supabase.from('match_events').delete().in('match_id', syncedMatchIds).eq('event_type', 'red_card')

    const redCardRows = []
    for (const fixtureIds of chunks(matchedFixtureIds, 20)) {
      const detailedFixtures = await apiFootballGet('/fixtures', { ids: fixtureIds.join('-') })
      for (const fixture of detailedFixtures) {
        const matchId = matchIdByFixtureId[Number(fixture.fixture?.id)]
        if (!matchId) continue
        for (const event of fixture.events || []) {
          if (!isRedCardEvent(event)) continue
          const team = localTeamByApiName(event.team?.name, teamsByName)
          if (!team) continue
          redCardRows.push({
            match_id: matchId,
            team_id: team.id,
            event_type: 'red_card',
            player_name: event.player?.name || '',
            minute: event.time?.elapsed || null
          })
        }
      }
    }

    if (redCardRows.length > 0) {
      const { error } = await supabase.from('match_events').insert(redCardRows)
      if (error) throw error
      redCardsImported = redCardRows.length
    }
  }

  return {
    matched: updates.length,
    red_cards: redCardsImported,
    unmatched,
    schema_missing: !canStoreExternalId,
    setup_sql: !canStoreExternalId ? API_FOOTBALL_FIXTURE_SQL : undefined
  }
}
