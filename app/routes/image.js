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

/*
 * Uploads Image routes
 */
/*
 * Get uploaded Images route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.getImages
)
/*
 * Uploaded single Image route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  uploader.single('imageData'),
  validate.uploadImage,
  controller.uploadImage
)
/*
 * Delete single Image by image's id route
 */
// router.delete(
//   '/:id',
//   requireAuth,
//   AuthController.roleAuthorization(['user', 'staff', 'admin']),
//   trimRequest.all,
//   validate.deleteImage,
//   controller.deleteImage
// )

module.exports = router
