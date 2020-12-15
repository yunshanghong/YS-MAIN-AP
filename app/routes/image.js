const controller = require('../controllers/image')
const validate = require('../controllers/image.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const uploader = require('../middleware/multer/image')
const router = express.Router()
// require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const authRoles = require('../middleware/authRoles')

/*
 * Uploads Image routes
 */
/*
 * Get uploaded Images route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  controller.getImages
)
/*
 * Get uploaded Images for post route
 */
router.get(
  '/manager',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  controller.getImagesForManager
)
/*
 * Uploaded single Image route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  uploader.single('imageData'),
  validate.uploadImage,
  controller.uploadImage
)
/*
 * Update single Image route
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.updateImage,
  controller.updateImage
)
/*
 * Delete single Image by image's id route
 */
router.post(
  '/:imageId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteImage,
  controller.deleteImage
)

module.exports = router
