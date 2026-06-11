import { supabase } from '../../lib/supabaseServer'
import { PICKS_LOCK_AT, PICKS_LOCK_LABEL, getPicksUnlockStatus } from '../../lib/picksLock'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const status = await getPicksUnlockStatus(supabase)

  return res.status(200).json({
    locked: status.locked,
    base_locked: status.base_locked,
    unlock_active: status.unlock_active,
    unlocked_until: status.unlocked_until,
    lock_at: PICKS_LOCK_AT,
    lock_label: PICKS_LOCK_LABEL
  })
}
