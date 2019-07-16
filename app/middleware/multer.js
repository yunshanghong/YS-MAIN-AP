const multer = require('multer')
const path = require('path')
const mime = require('mime-types')
const shortUUID = require('short-uuid')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../', '../', 'uploads', 'avatar'))
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user.displayName}-${shortUUID.generate()}.${mime.extension(
        file.mimetype
      )}`
    )
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    // eslint-disable-next-line
    cb(null, true)
  } else {
    // eslint-disable-next-line
    cb(null, false)
  }
}

/**
 * Uploader
 * @param null
 */
module.exports = multer({
  storage,
  fileFilter,
  limits: 1024 * 1024 * 5
})
