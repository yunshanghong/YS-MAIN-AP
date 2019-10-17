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

/*
 * Users routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getItems
)

/*
 * Create new item route
 */
router.post(
  '/csv',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  controller.getExportSCV
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
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
  AuthController.roleAuthorization(['staff', 'admin']),
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
 * Update item activation route
 */
router.patch(
  '/activation/:id',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
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
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.updateItemPermission,
  controller.updateItemPermission
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
