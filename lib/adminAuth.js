export const ADMIN_PASSWORD = 'N0s0l0d4d0s'

export function isAdminRequest(req) {
  const headerPassword = req.headers['x-admin-password']
  const bodyPassword = req.body?.admin_password
  const queryPassword = req.query?.admin_password
  return [headerPassword, bodyPassword, queryPassword].some((value) => value === ADMIN_PASSWORD)
}

export function requireAdmin(req, res) {
  if (isAdminRequest(req)) return true
  res.status(401).json({ error: 'Admin password required' })
  return false
}
