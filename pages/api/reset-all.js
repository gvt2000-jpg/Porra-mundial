import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { isMissingAchievementColumns } from '../../lib/schemaStatus'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  try {
    // Reset all team stats to 0
    const { data: teams } = await supabase.from('teams').select('id')
    if (!teams || teams.length === 0) {
      return res.status(400).json({ error: 'No teams found to reset' })
    }

    for (const team of teams) {
      const { error } = await supabase
        .from('teams')
        .update({
          passed_group: false,
          group_finish_position: 0,
          phases_advanced: 0,
          reached_round_of_32: false,
          reached_round_of_16: false,
          reached_quarter_final: false,
          reached_semi_final: false,
          reached_final: false,
          finalist: false,
          third_place: false,
          champion: false
        })
        .eq('id', team.id)
      if (error && !isMissingAchievementColumns(error)) throw error
    }

    // Delete all picks
    await supabase.from('picks').delete().gte('id', '00000000-0000-0000-0000-000000000000')

    // Reset team points
    await supabase.from('team_points').delete().gte('team_id', '00000000-0000-0000-0000-000000000000')

    return res.status(200).json({ ok: true, reset_teams: teams.length, message: 'System reset to initial state' })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
