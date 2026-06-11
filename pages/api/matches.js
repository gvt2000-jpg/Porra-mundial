import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
<<<<<<< HEAD
    const { data, error } = await supabase.from('matches').select('*').order('starts_at')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ matches: data })
  }

  if (req.method === 'POST') {
    const payload = req.body
    const { data, error } = await supabase.from('matches').insert([payload]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ match: data })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const { data, error } = await supabase.from('matches').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ match: data })
  }

  return res.status(405).end()
}
=======
    const { data, error } = await supabase.from('matches').select('*').order('starts_at')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ matches: data })
  }

  if (req.method === 'POST') {
    const payload = req.body
    const { data, error } = await supabase.from('matches').insert([payload]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ match: data })
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const { data, error } = await supabase.from('matches').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ match: data })
  }

  return res.status(405).end()
}
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4
