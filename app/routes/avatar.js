const controller = require('../controllers/profile')
// const validate = require('../controllers/profile.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const uploader = require('../middleware/multer/avatar')
const router = express.Router()
// require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const authRoles = require('../middleware/authRoles')

/*
 * Uploads routes
 */
/*
 * Update profile PhotoURL route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  uploader.single('avatarData'),
  // validate.updateAvatar,
  controller.updateAvatar
)

module.exports = router
