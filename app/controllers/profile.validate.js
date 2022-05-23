const { validationResult } = require('../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates update profile request
 */
exports.updateProfile = [
  check('fullName')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('bob')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('gender')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('education')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('schoolName')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('departmentName')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('majorName')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('employmentStatus')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('phone')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('city')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('postAddress')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('companyName')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('serviceDepartment')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('jobTitle')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('jobDescription')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('firstYearOfCareer')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('companyName2')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('jobTitle2')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('jobDescription2')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('companyName3')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('jobTitle3')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('jobDescription3')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('heardFrom')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('motivation')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('serviceRequirements')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('haveParticipated')
    .exists()
    .withMessage('MISSING')
    .trim(),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates update profile shortcuts request
 */
exports.updateProfileShortcuts = [
  check('shortcuts')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates change password request
 */
exports.changePassword = [
  check('oldPassword')
    .optional()
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isLength({
      min: 5
    })
    .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
  check('newPassword')
    .optional()
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isLength({
      min: 5
    })
    .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]
