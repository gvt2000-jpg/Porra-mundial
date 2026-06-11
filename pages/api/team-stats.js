import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { ACHIEVEMENT_COLUMNS_SQL, isMissingAchievementColumns } from '../../lib/schemaStatus'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, passed_group, group_finish_position, phases_advanced, reached_round_of_32, reached_round_of_16, reached_quarter_final, reached_semi_final, reached_final, finalist, third_place, champion')
        .order('name')
      if (error && isMissingAchievementColumns(error)) {
        const fallback = await supabase.from('teams').select('id, name').order('name')
        if (fallback.error) return res.status(500).json({ error: fallback.error.message })
        return res.status(200).json({
          teams: (fallback.data || []).map((team) => ({
            ...team,
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
          })),
          schema_missing: true,
          setup_sql: ACHIEVEMENT_COLUMNS_SQL
        })
      }
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ teams: data || [], schema_missing: false })
    } catch (err) {
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  if (req.method === 'POST') {
    const {
      team_id,
      passed_group,
      group_finish_position,
      phases_advanced,
      reached_round_of_32,
      reached_round_of_16,
      reached_quarter_final,
      reached_semi_final,
      reached_final,
      finalist,
      third_place,
      champion
    } = req.body
    if (!team_id) {
      return res.status(400).json({ error: 'team_id required' })
    }

    try {
      const updates = {
        passed_group: Boolean(passed_group),
        group_finish_position: Math.max(0, Math.min(3, Number(group_finish_position) || 0)),
        phases_advanced: Math.max(0, Number(phases_advanced) || 0),
        reached_round_of_32: Boolean(reached_round_of_32),
        reached_round_of_16: Boolean(reached_round_of_16),
        reached_quarter_final: Boolean(reached_quarter_final),
        reached_semi_final: Boolean(reached_semi_final),
        reached_final: Boolean(reached_final),
        finalist: Boolean(finalist),
        third_place: Boolean(third_place),
        champion: Boolean(champion)
      }
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', team_id)
        .select()
      if (error && isMissingAchievementColumns(error)) {
        return res.status(400).json({
          error: 'Faltan columnas de logros en teams. Ejecuta la migracion 004_add_scoring_achievement_columns.sql en Supabase.',
          schema_missing: true,
          setup_sql: ACHIEVEMENT_COLUMNS_SQL
        })
      }
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true, data: data?.[0] })
    } catch (err) {
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  return res.status(405).end()
}
