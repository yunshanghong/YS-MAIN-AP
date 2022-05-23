/**
 * Authorization Roles
 */
const authRoles = {
  admin: ['admin'],
  manager: ['admin', 'manager'],
  staff: ['admin', 'manager', 'staff'],
  user: ['admin', 'manager', 'staff', 'user'],
  onlyGuest: []
}

module.exports = authRoles
