const controller = require('../controllers/milestone')
const validate = require('../controllers/milestone.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', { session: false })
const trimRequest = require('trim-request')
const authRoles = require('../middleware/authRoles')

/*
 * Get milestone route
 */

router.get(
  '/',
  trimRequest.all,
  controller.getItems,
)

/*
 * Add new milestone route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.createItem,
  controller.createItem,
)

/*
 * Update milestone route
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem,
)

/*
 * Delete event route
 */
router.delete(
  '/:milestoneId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem,
)

module.exports = router
