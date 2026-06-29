import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { syncTournamentProgression } from '../../lib/tournamentProgression'
import { MATCH_PROGRESSION_COLUMNS_SQL, isMissingMatchProgressionColumns } from '../../lib/schemaStatus'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!requireAdmin(req, res)) return

  try {
    const [{ data: matches, error }, { data: events, error: eventsError }] = await Promise.all([
      supabase.from('matches').select('*').order('starts_at'),
      supabase.from('match_events').select('team_id,match_id,event_type')
    ])
    if (error && isMissingMatchProgressionColumns(error)) {
      return res.status(400).json({
        error: 'Faltan columnas de bracket en matches. Ejecuta la migracion 005_add_knockout_progression_columns.sql en Supabase.',
        schema_missing: true,
        setup_sql: MATCH_PROGRESSION_COLUMNS_SQL
      })
    }
    if (error) throw error
    if (eventsError) throw eventsError

    const playedMatchIds = new Set((matches || []).filter((match) => match.played).map((match) => match.id))
    const playedEvents = (events || []).filter((event) => !event.match_id || playedMatchIds.has(event.match_id))
    const result = await syncTournamentProgression(supabase, matches || [], { events: playedEvents })
    return res.status(200).json({
      ok: true,
      created: result.created.length,
      updated: result.updated.length
    })
  } catch (err) {
    if (isMissingMatchProgressionColumns(err)) {
      return res.status(400).json({
        error: 'Faltan columnas de bracket en matches. Ejecuta la migracion 005_add_knockout_progression_columns.sql en Supabase.',
        schema_missing: true,
        setup_sql: MATCH_PROGRESSION_COLUMNS_SQL
      })
    }
    return res.status(500).json({ error: err.message || String(err) })
  }
}
