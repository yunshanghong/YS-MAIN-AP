const controller = require('../controllers/statistic')
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
 * Get all review to stars route
 */
router.post(
  '/reviewStars',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getReviewStars
)

/*
 * Get all review to log route
 */
router.post(
  '/reviewLogs',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getReviewLogs
)

/*
 * Get new user member per month route
 */
router.post(
  '/newUserNumberPerMonth',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getNewUserNumberPerMonth
)

/*
 * Get Gender stastic route
 */
router.post(
  '/genderStastic',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getUserGenderStastic
)

/*
 * Get Gender stastic route
 */
router.post(
  '/employmentStatusStastic',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getUserEmploymentStatusStastic
)

/*
 * Get Age Period stastic route
 */
router.post(
  '/agePeriodStastic',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getUserAgePeriodStastic
)

/*
 * Get education stastic route
 */
router.post(
  '/educationStastic',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getUserEducationStastic
)

/*
 * Get heardFrom stastic route
 */
router.post(
  '/heardFromStastic',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getUserheardFromStastic
)

module.exports = router
