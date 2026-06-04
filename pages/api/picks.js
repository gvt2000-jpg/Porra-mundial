import { supabase } from '../../lib/supabaseServer'
import { PICKS_LOCK_LABEL, arePicksLocked } from '../../lib/picksLock'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (arePicksLocked()) {
    return res.status(403).json({ error: `Las predicciones están cerradas desde el ${PICKS_LOCK_LABEL}.` })
  }

  const { user_name, picks } = req.body
  if (!user_name || !picks || !Array.isArray(picks) || picks.length === 0) {
    return res.status(400).json({ error: 'user_name and picks required' })
  }

  try {
    const existing = await supabase.from('picks').select('id').eq('submitter_name', user_name).limit(1)
    if (existing.error) throw existing.error
    if (existing.data && existing.data.length > 0) {
      return res.status(400).json({ error: 'Ya existe un Top10 enviado con este nombre. Usa otro nombre o elige otro nombre público.' })
    }

    const toInsert = []
    const selectedTeamIds = new Set()

    for (const p of picks) {
      const rank = Number(p.rank)
      if (!rank || rank < 1 || rank > 10) return res.status(400).json({ error: 'Cada pick debe tener una posición entre 1 y 10.' })
      if (!p.team_id || typeof p.team_id !== 'string') return res.status(400).json({ error: 'Cada pick debe incluir un team_id válido.' })
      if (selectedTeamIds.has(p.team_id)) return res.status(400).json({ error: 'No se permiten equipos duplicados en el Top10.' })
      selectedTeamIds.add(p.team_id)

      const multiplier = Math.max(1, 11 - rank)
      toInsert.push({ user_id: null, submitter_name: user_name, team_id: p.team_id, rank, multiplier })
    }

    if (toInsert.length !== 10) return res.status(400).json({ error: 'Se requieren exactamente 10 picks únicos.' })

    const { error } = await supabase.from('picks').insert(toInsert)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, inserted: toInsert.length })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
