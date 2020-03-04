const { validationResult } = require('../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates Get Items By UserId request
 */
exports.getItemsByUserId = [
  check('userId')
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
 * Validates Get Items By EventId request
 */
exports.getItemsByEventId = [
  check('eventId')
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
 * Validates Get Speaker Stars By SpeakerId request
 */
exports.getSpeakerStarsBySpeakerId = [
  check('speakerId')
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
 * Validates Get Event Stars By EventId request
 */
exports.getEventStarsByEventId = [
  check('eventId')
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
 * Validates create new item request
 */
exports.createItem = [
  check('eventId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('speakerId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('participateReason')
    .optional()
    .trim(),
  check('participantHeardFrom')
    .optional()
    .trim(),
  check('participantExpectation')
    .optional()
    .trim(),
  check('participantID')
    .optional()
    .trim(),
  check('participantIsManager')
    .optional()
    .trim(),
  check('participateLunch')
    .optional()
    .trim(),
  check('lunchType')
    .optional()
    .trim(),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates update item request
 */
exports.updateItem = [
  check('eventId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('eventStars')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('speakerExpressionStars')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('speakerContentStars')
    .exists()
    .withMessage('MISSING')
    .trim(),
  check('eventComments')
    .exists()
    .withMessage('MISSING')
    .trim(),
  (req, res, next) => {
    validationResult(req, res, next)
  }
]

/**
 * Validates Update Checkin Status status item request
 */
exports.updateCheckinStatusItem = [
  check('event')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('applicant')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('updateAction')
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
 * Validates Update registration status item request
 */
exports.updateRegistrationItem = [
  check('event')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('applicant')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim(),
  check('updateAction')
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
 * Validates Cancel item request
 */
exports.cancelItem = [
  check('activityId')
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

// /**
//  * Validates Approve item request
//  */
// exports.approveItem = [
//   check('event')
//     .exists()
//     .withMessage('MISSING')
//     .not()
//     .isEmpty()
//     .withMessage('IS_EMPTY')
//     .trim(),
//   check('applicant')
//     .exists()
//     .withMessage('MISSING')
//     .trim(),
//   (req, res, next) => {
//     validationResult(req, res, next)
//   }
// ]

// /**
//  * Validates Reject item request
//  */
// exports.rejectItem = [
//   check('event')
//     .exists()
//     .withMessage('MISSING')
//     .not()
//     .isEmpty()
//     .withMessage('IS_EMPTY')
//     .trim(),
//   check('applicant')
//     .exists()
//     .withMessage('MISSING')
//     .trim(),
//   (req, res, next) => {
//     validationResult(req, res, next)
//   }
// ]
