import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    const { match_id } = req.query
    let query = supabase.from('match_events').select('*').order('minute', { ascending: true, nullsFirst: false })
    if (match_id) query = query.eq('match_id', match_id)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ events: data || [] })
  }

  if (req.method === 'POST') {
    const payload = req.body
    if (!payload.match_id || !payload.team_id || !payload.event_type) {
      return res.status(400).json({ error: 'match_id, team_id and event_type required' })
    }

    const event = {
      match_id: payload.match_id,
      team_id: payload.team_id,
      event_type: payload.event_type,
      minute: payload.minute === '' || payload.minute == null ? null : Number(payload.minute),
      player_name: payload.player_name || null
    }

    const { data, error } = await supabase.from('match_events').insert([event]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ event: data })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id required' })

    const { error } = await supabase.from('match_events').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
