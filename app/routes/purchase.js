const controller = require('../controllers/purchase')
const validate = require('../controllers/purchase.validate')
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
 * Purchase routes
 */
/*
 * Get Purchase History route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.getPurchaseHistory
)
/*
 * Purchase Basic Package route
 */
router.post(
  '/basic-package',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  validate.purchaseBasicPackage,
  controller.purchaseBasicPackage
)
/*
 * Purchase Pro Package route
 */
router.post(
  '/pro-package',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  validate.purchaseProPackage,
  controller.purchaseProPackage
)
/*
 * Purchase Ultimate Package route
 */
router.post(
  '/ultimate-package',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  validate.purchaseUltimatePackage,
  controller.purchaseUltimatePackage
)

module.exports = router
