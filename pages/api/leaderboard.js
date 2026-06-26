import { supabase } from '../../lib/supabaseServer'
import { LEADERBOARD_SNAPSHOTS_SQL, applyLeaderboardMovement, buildLeaderboard, latestLeaderboardSnapshots } from '../../lib/leaderboard'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [{ leaderboard, updatedAt }, snapshotResult] = await Promise.all([
      buildLeaderboard(supabase),
      latestLeaderboardSnapshots(supabase)
    ])

    const latestSnapshot = snapshotResult.snapshots[0]
    const previousSnapshot = snapshotResult.snapshots[1]
    const referenceRows = previousSnapshot?.rows || latestSnapshot?.rows || []

    return res.status(200).json({
      leaderboard: applyLeaderboardMovement(leaderboard, referenceRows),
      updated_at: updatedAt,
      movement_reference_at: previousSnapshot?.created_at || null,
      current_snapshot_at: latestSnapshot?.created_at || null,
      snapshot_schema_missing: snapshotResult.schemaMissing,
      setup_sql: snapshotResult.schemaMissing ? LEADERBOARD_SNAPSHOTS_SQL : undefined
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
