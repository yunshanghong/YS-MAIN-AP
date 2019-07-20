const { validationResult } = require('../middleware/utils')
// const validator = require('validator')
const { check } = require('express-validator')

/**
 * Validates purchase basic request
 */
exports.purchaseBasicPackage = [
  check('data')
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
 * Validates purchase pro request
 */
exports.purchaseProPackage = [
  check('data')
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
 * Validates purchase ultimate request
 */
exports.purchaseUltimatePackage = [
  check('data')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]
