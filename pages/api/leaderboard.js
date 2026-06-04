import { supabase } from '../../lib/supabaseServer'
import { getTeamFlag } from '../../lib/teamMeta'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { data: tpoints } = await supabase.from('team_points').select('*')
    const { data: picks } = await supabase.from('picks').select('*')
    const { data: teams } = await supabase.from('teams').select('id,name')

    const teamPoints = {}
    for (const t of tpoints || []) teamPoints[t.team_id] = Number(t.points || 0)
    const teamNames = Object.fromEntries((teams || []).map((t) => [t.id, t.name]))

    const scores = {}
    for (const p of picks || []) {
      const submitter = p.submitter_name || String(p.user_id)
      const mult = Number(p.multiplier || 1)
      const teamPts = Number(teamPoints[p.team_id] || 0)
      if (!scores[submitter]) scores[submitter] = { submitter, total: 0, breakdown: [] }
      const add = teamPts * mult
      scores[submitter].total += add
      scores[submitter].breakdown.push({
        team_id: p.team_id,
        team_name: teamNames[p.team_id] || 'Equipo desconocido',
        rank: p.rank,
        multiplier: mult,
        team_points: teamPts,
        contributed: add
      })
    }

    const list = Object.values(scores).sort((a, b) => b.total - a.total)
    list.forEach((row, index) => {
      row.rank = index + 1
      row.breakdown.sort((a, b) => Number(a.rank) - Number(b.rank))
      row.breakdown = row.breakdown.map((item) => ({
        ...item,
        flag: getTeamFlag(item.team_name)
      }))
    })
    return res.status(200).json({ leaderboard: list })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
