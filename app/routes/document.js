const controller = require('../controllers/document')
const validate = require('../controllers/document.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const uploader = require('../middleware/multer/document')
const router = express.Router()
// require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const authRoles = require('../middleware/authRoles')

/*
 * Uploads Document routes
 */
/*
 * Get uploaded Documents route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  controller.getDocuments
)
/*
 * Uploaded single Document route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  uploader.single('documentData'),
  validate.uploadDocument,
  controller.uploadDocument
)
/*
 * Delete single Document by document's id route
 */
router.post(
  '/:documentId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteDocument,
  controller.deleteDocument
)

module.exports = router
