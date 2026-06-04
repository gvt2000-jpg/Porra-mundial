export const PICKS_LOCK_AT = '2026-06-11T00:00:00+02:00'
export const PICKS_LOCK_LABEL = '11 de junio de 2026'

export function arePicksLocked(now = new Date()) {
  return now.getTime() >= new Date(PICKS_LOCK_AT).getTime()
}
