import { supabase } from '../../lib/supabaseServer'
import { LEADERBOARD_SNAPSHOTS_SQL, applyLeaderboardMovement, buildLeaderboard, latestLeaderboardSnapshots } from '../../lib/leaderboard'

function hasVisibleMovement(rows) {
  return rows.some((row) =>
    row.rankDelta !== null &&
    row.rankDelta !== undefined &&
    (row.rankDelta !== 0 || Math.abs(Number(row.pointsDelta || 0)) > 0.001)
  )
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [{ leaderboard, updatedAt, pendingScoringStage }, snapshotResult] = await Promise.all([
      buildLeaderboard(supabase),
      latestLeaderboardSnapshots(supabase)
    ])

    const latestSnapshot = snapshotResult.snapshots[0]
    let referenceSnapshot = null
    let leaderboardWithMovement = null

    for (const snapshot of snapshotResult.snapshots || []) {
      const candidate = applyLeaderboardMovement(leaderboard, snapshot.rows || [])
      if (hasVisibleMovement(candidate)) {
        referenceSnapshot = snapshot
        leaderboardWithMovement = candidate
        break
      }
    }

    if (!leaderboardWithMovement) {
      referenceSnapshot = latestSnapshot || null
      leaderboardWithMovement = applyLeaderboardMovement(leaderboard, referenceSnapshot?.rows || [])
    }

    return res.status(200).json({
      leaderboard: leaderboardWithMovement,
      updated_at: updatedAt,
      pending_scoring_stage: pendingScoringStage,
      movement_reference_at: referenceSnapshot?.created_at || null,
      current_snapshot_at: latestSnapshot?.created_at || null,
      snapshot_schema_missing: snapshotResult.schemaMissing,
      setup_sql: snapshotResult.schemaMissing ? LEADERBOARD_SNAPSHOTS_SQL : undefined
    })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
