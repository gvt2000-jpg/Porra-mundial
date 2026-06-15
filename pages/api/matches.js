import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { MATCH_PROGRESSION_COLUMNS_SQL, isMissingMatchProgressionColumns } from '../../lib/schemaStatus'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('matches').select('*').order('starts_at')
    if (error && isMissingMatchProgressionColumns(error)) {
      return res.status(500).json({
        error: 'Faltan columnas de bracket en matches. Ejecuta la migracion 005_add_knockout_progression_columns.sql en Supabase.',
        schema_missing: true,
        setup_sql: MATCH_PROGRESSION_COLUMNS_SQL
      })
    }
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ matches: data, schema_missing: false })
  }

  if (req.method === 'POST') {
    const payload = req.body
    const { data, error } = await supabase.from('matches').insert([payload]).select().single()
    if (error && isMissingMatchProgressionColumns(error)) {
      return res.status(400).json({
        error: 'Faltan columnas de bracket en matches. Ejecuta la migracion 005_add_knockout_progression_columns.sql en Supabase.',
        schema_missing: true,
        setup_sql: MATCH_PROGRESSION_COLUMNS_SQL
      })
    }
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ match: data })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const { data, error } = await supabase.from('matches').update(updates).eq('id', id).select().single()
    if (error && isMissingMatchProgressionColumns(error)) {
      return res.status(400).json({
        error: 'Faltan columnas de bracket en matches. Ejecuta la migracion 005_add_knockout_progression_columns.sql en Supabase.',
        schema_missing: true,
        setup_sql: MATCH_PROGRESSION_COLUMNS_SQL
      })
    }
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ match: data })
  }

  return res.status(405).end()
}
