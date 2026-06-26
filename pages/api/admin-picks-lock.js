import { supabase } from '../../lib/supabaseServer'
import { requireAdmin } from '../../lib/adminAuth'
import { PICKS_LOCK_AT, PICKS_LOCK_LABEL, PICKS_UNLOCK_SETTING_KEY, getPicksUnlockStatus } from '../../lib/picksLock'

export const SETUP_SQL = `create table if not exists app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);`

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  if (req.method === 'GET') {
    const status = await getPicksUnlockStatus(supabase)
    return res.status(200).json({ ...status, lock_at: PICKS_LOCK_AT, lock_label: PICKS_LOCK_LABEL, setup_sql: status.settings_available ? '' : SETUP_SQL })
  }

  if (req.method === 'POST') {
    const { action, minutes, unlocked_until } = req.body || {}
    let until = null

    if (action === 'unlock') {
      if (unlocked_until) {
        until = new Date(unlocked_until)
      } else {
        const amount = Math.max(1, Number(minutes) || 60)
        until = new Date(Date.now() + amount * 60 * 1000)
      }
      if (Number.isNaN(until.getTime())) return res.status(400).json({ error: 'Fecha de desbloqueo no valida' })
    } else if (action !== 'lock') {
      return res.status(400).json({ error: 'action must be unlock or lock' })
    }

    const payload = action === 'unlock' ? { until: until.toISOString() } : { until: null }
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: PICKS_UNLOCK_SETTING_KEY, value: payload, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return res.status(500).json({ error: error.message, setup_sql: SETUP_SQL })

    const status = await getPicksUnlockStatus(supabase)
    return res.status(200).json({ ok: true, ...status, lock_at: PICKS_LOCK_AT, lock_label: PICKS_LOCK_LABEL })
  }

  return res.status(405).end()
}
