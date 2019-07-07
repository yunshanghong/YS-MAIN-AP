const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user'
    },
    displayName: {
      type: String,
      required: true
    },
    photoURL: {
      type: String,
      required: false,
      default: 'assets/images/avatars/penguin.png'
    },
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID'
      },
      lowercase: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    verification: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    shortcuts: {
      type: Array,
      default: ['crypto-dashboard-markets']
    },
    phone: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      type: String
    },
    urlTwitter: {
      type: String,
      validate: {
        validator(v) {
          return v === '' ? true : validator.isURL(v)
        },
        message: 'NOT_A_VALID_URL'
      },
      lowercase: true
    },
    urlGitHub: {
      type: String,
      validate: {
        validator(v) {
          return v === '' ? true : validator.isURL(v)
        },
        message: 'NOT_A_VALID_URL'
      },
      lowercase: true
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    blockExpires: {
      type: Date,
      default: Date.now,
      select: false
    },

    /* Third Party Login */
    google: {
      id: {
        type: String,
        default: null
      },
      accessToken: {
        type: String,
        default: null
      },
      refreshToken: {
        type: String,
        default: null
      },
      displayName: {
        type: String,
        default: null
      },
      email: {
        type: String,
        default: null
      },
      photoURL: {
        type: String,
        default: null
      }
    },
    facebook: {
      id: {
        type: String,
        default: null
      },
      accessToken: {
        type: String,
        default: null
      },
      refreshToken: {
        type: String,
        default: null
      },
      displayName: {
        type: String,
        default: null
      },
      email: {
        type: String,
        default: null
      },
      photoURL: {
        type: String,
        default: null
      }
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

const hash = (user, salt, next) => {
  bcrypt.hash(user.password, salt, null, (error, newHash) => {
    if (error) {
      return next(error)
    }
    user.password = newHash
    return next()
  })
}

const genSalt = (user, SALT_FACTOR, next) => {
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err)
    }
    return hash(user, salt, next)
  })
}

UserSchema.pre('save', function(next) {
  const that = this
  const SALT_FACTOR = 5
  if (!that.isModified('password')) {
    return next()
  }
  return genSalt(that, SALT_FACTOR, next)
})

UserSchema.methods.comparePassword = function(passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  )
}
UserSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('User', UserSchema)
