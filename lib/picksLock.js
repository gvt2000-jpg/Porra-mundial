export const PICKS_LOCK_AT = '2026-06-11T00:00:00+02:00'
export const PICKS_LOCK_LABEL = '11 de junio de 2026'
<<<<<<< HEAD
export const PICKS_UNLOCK_SETTING_KEY = 'picks_unlocked_until'
=======
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4

export function arePicksLocked(now = new Date()) {
  return now.getTime() >= new Date(PICKS_LOCK_AT).getTime()
}
<<<<<<< HEAD

export function isUnlockActive(unlockedUntil, now = new Date()) {
  if (!unlockedUntil) return false
  const unlockTime = new Date(unlockedUntil).getTime()
  return Number.isFinite(unlockTime) && unlockTime > now.getTime()
}

export async function getPicksUnlockStatus(supabase, now = new Date()) {
  const baseLocked = arePicksLocked(now)
  const status = {
    locked: baseLocked,
    base_locked: baseLocked,
    unlocked_until: null,
    unlock_active: false,
    settings_available: true
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', PICKS_UNLOCK_SETTING_KEY)
    .maybeSingle()

  if (error) {
    status.settings_available = false
    status.settings_error = error.message
    return status
  }

  const unlockedUntil = data?.value?.until || null
  status.unlocked_until = unlockedUntil
  status.unlock_active = isUnlockActive(unlockedUntil, now)
  status.locked = baseLocked && !status.unlock_active
  return status
}
=======
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4
