import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('teams').select('*').order('name')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ teams: data })
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return
    const { name, fifa_code } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })
    const { data, error } = await supabase.from('teams').insert([{ name, fifa_code }]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ team: data })
  }

  return res.status(405).end()
}
