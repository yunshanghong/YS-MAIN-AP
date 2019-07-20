const controller = require('../controllers/runners')
// const validate = require('../controllers/runners.validate')
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
 * Runners routes
 */

/*
 * Get all process runners route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  controller.getProcessRunners
)
/*
 * Add a process runner route
 */
router.post(
  '/add',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  controller.addProcessRunner
)

module.exports = router
