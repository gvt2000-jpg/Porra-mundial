import { PICKS_LOCK_AT, PICKS_LOCK_LABEL, arePicksLocked } from '../../lib/picksLock'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  return res.status(200).json({
    locked: arePicksLocked(),
    lock_at: PICKS_LOCK_AT,
    lock_label: PICKS_LOCK_LABEL
  })
}
