const controller = require('../controllers/user')
const validate = require('../controllers/user.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
// require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const authRoles = require('../middleware/authRoles')

/*
 * Users routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  controller.getItems
)

/*
 * Create new item route
 */
router.post(
  '/csv',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  controller.getExportSCV
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)

// /*
//  * Update item route
//  */
// router.patch(
//   '/:id',
//   requireAuth,
//   AuthController.roleAuthorization(['staff', 'admin']),
//   trimRequest.all,
//   validate.updateItem,
//   controller.updateItem
// )

/*
 * Update self item receiving email status route
 */
router.patch(
  '/receiving-email',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.updateItemReceivingEmailStatus,
  controller.updateItemReceivingEmailStatus
)

/*
 * Update item activation route
 */
router.patch(
  '/activation/:id',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.updateItemActivation,
  controller.updateItemActivation
)

/*
 * Update item permission route (only admin)
 */
router.patch(
  '/permission/:id',
  requireAuth,
  AuthController.roleAuthorization(authRoles.admin),
  trimRequest.all,
  validate.updateItemPermission,
  controller.updateItemPermission
)

/*
 * Delete item (only admin)
 */
router.delete(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(authRoles.manager),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

// /*
//  * Delete item route
//  */
// router.delete(
//   '/:id',
//   requireAuth,
//   AuthController.roleAuthorization(['staff', 'admin']),
//   trimRequest.all,
//   validate.deleteItem,
//   controller.deleteItem
// )

module.exports = router
