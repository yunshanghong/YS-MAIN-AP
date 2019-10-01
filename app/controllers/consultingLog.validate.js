const { validationResult } = require('../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates create new item request
 */
exports.createItem = [
  check('consultingDate')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('consultingTimeSlot')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('consultingTopic')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('consultingIntention')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('consultingexpectation')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates update item request
 */
exports.updateItem = [
  check('consultingId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('appointmentStatus').trim(),
  check('checkinStatus').trim(),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates cancel item request
 */
exports.cancelItem = [
  check('consultingId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]
