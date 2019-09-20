const controller = require('../controllers/statistics')
// const validate = require('../controllers/statistics.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Admin Dashbiard Statistics chart data routes
 */

/*
 * Get items route
 */
router.post(
  '/newUserNumberPerMonth',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  controller.getNewUserNumberPerMonth
)

module.exports = router
