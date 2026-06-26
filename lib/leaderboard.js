import { getTeamFlag } from './teamMeta'

export const LEADERBOARD_SNAPSHOTS_SQL = `
create table if not exists leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text default 'recompute',
  rows jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_leaderboard_snapshots_created_at
on leaderboard_snapshots(created_at desc);
`

function isMissingLeaderboardSnapshots(error) {
  return error?.code === '42P01' || String(error?.message || '').includes('leaderboard_snapshots')
}

function snapshotRows(leaderboard) {
  return leaderboard.map((row) => ({
    submitter: row.submitter,
    rank: row.rank,
    total: row.total
  }))
}

function normalizeSnapshotRows(rows) {
  if (Array.isArray(rows)) return rows
  if (!rows || typeof rows !== 'object') return []
  return Object.entries(rows).map(([submitter, value]) => ({
    submitter,
    rank: value?.rank,
    total: value?.total
  }))
}

export function applyLeaderboardMovement(leaderboard, previousRows) {
  const previous = Object.fromEntries(normalizeSnapshotRows(previousRows).map((row) => [row.submitter, row]))

  return leaderboard.map((row) => {
    const before = previous[row.submitter]
    const rankDelta = before ? Number(before.rank || row.rank) - Number(row.rank || 0) : null
    const pointsDelta = before ? Number(row.total || 0) - Number(before.total || 0) : null
    return { ...row, rankDelta, pointsDelta, previousRank: before?.rank || null }
  })
}

export async function buildLeaderboard(supabase) {
  const [{ data: tpoints, error: pointsError }, { data: picks, error: picksError }, { data: teams, error: teamsError }] = await Promise.all([
    supabase.from('team_points').select('*'),
    supabase.from('picks').select('*'),
    supabase.from('teams').select('id,name')
  ])

  if (pointsError) throw pointsError
  if (picksError) throw picksError
  if (teamsError) throw teamsError

  const teamPoints = {}
  for (const t of tpoints || []) teamPoints[t.team_id] = Number(t.points || 0)
  const teamNames = Object.fromEntries((teams || []).map((t) => [t.id, t.name]))

  const scores = {}
  for (const p of picks || []) {
    const submitter = p.submitter_name || String(p.user_id)
    const mult = Number(p.multiplier || 1)
    const teamPts = Number(teamPoints[p.team_id] || 0)
    if (!scores[submitter]) scores[submitter] = { submitter, total: 0, breakdown: [] }
    const add = teamPts * mult
    scores[submitter].total += add
    scores[submitter].breakdown.push({
      team_id: p.team_id,
      team_name: teamNames[p.team_id] || 'Equipo desconocido',
      rank: p.rank,
      multiplier: mult,
      team_points: teamPts,
      contributed: add
    })
  }

  const leaderboard = Object.values(scores).sort((a, b) => b.total - a.total)
  leaderboard.forEach((row, index) => {
    row.rank = index + 1
    row.breakdown.sort((a, b) => Number(a.rank) - Number(b.rank))
    row.breakdown = row.breakdown.map((item) => ({
      ...item,
      flag: getTeamFlag(item.team_name)
    }))
  })

  const updatedAt = (tpoints || [])
    .map((row) => row.last_updated)
    .filter(Boolean)
    .sort()
    .pop() || new Date().toISOString()

  return { leaderboard, updatedAt }
}

export async function latestLeaderboardSnapshots(supabase) {
  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .select('id,created_at,source,rows')
    .order('created_at', { ascending: false })
    .limit(2)

  if (error && isMissingLeaderboardSnapshots(error)) {
    return { snapshots: [], schemaMissing: true }
  }
  if (error) throw error
  return { snapshots: data || [], schemaMissing: false }
}

export async function saveLeaderboardSnapshot(supabase, source = 'recompute') {
  const { leaderboard } = await buildLeaderboard(supabase)
  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .insert([{ source, rows: snapshotRows(leaderboard) }])
    .select('id,created_at')
    .single()

  if (error && isMissingLeaderboardSnapshots(error)) {
    return { saved: false, schema_missing: true, setup_sql: LEADERBOARD_SNAPSHOTS_SQL }
  }
  if (error) throw error
  return { saved: true, snapshot: data }
}
