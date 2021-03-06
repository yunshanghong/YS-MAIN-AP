const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')
const shortid = require('shortid')

const GoogleProvider = new mongoose.Schema({
  id: {
    type: String,
    default: null
  },
  accessToken: {
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
})
const FacebookProvider = new mongoose.Schema({
  id: {
    type: String,
    default: null
  },
  accessToken: {
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
})

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'staff', 'manager', 'admin'],
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
      required: () => {
        return this.google === null
      },
      select: false
    },
    lastPasswordUpdatedAt: {
      type: Date,
      default: Date.now
    },
    usedPassword1:{
      type: String,
      select: false
    },
    usedPassword2:{
      type: String,
      select: false
    },
    verification: {
      type: String,
      select: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    isSystemPassword:{
      type: Boolean,
      default: false
    },
    shortcuts: {
      type: Array,
      default: ['ys-home']
    },
    active: {
      type: Boolean,
      default: true
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: true
    },
    blockExpires: {
      type: Date,
      default: Date.now,
      select: false
    },

    /* Notification */
    receivingEmail: {
      type: Boolean,
      default: true
    },

    /* User Detail */
    fullName: {
      type: String
    },
    gender: {
      type: String,
      enum: ['male', 'diversity', 'female']
    },
    bob: {
      type: Date
    },
    phone: {
      type: String
    },
    education: {
      type: String,
      // origianl => ?????????????????????????????????????????????
      // new      => ??????????????????????????????????????????(?????????????????????)?????????????????????
      // new      => middle???high???Vocational???faculty???bachelor???institute???other
      enum: [
        'middle',
        'high',
        'vocational',
        'faculty',
        'bachelor',
        'institute',
        'other'
      ]
    },
    schoolName: {
      type: String
    },
    departmentName: {
      type: String
    },
    majorName:{
      type: String
    },
    employmentStatus: {
      type: String,
      enum: ['student', 'employed', 'unemployed', 'other']
    },
    city: {
      type: String
    },
    postAddress: {
      type: String
    },
    country: {
      type: String
    },

    /* Career */
    companyName: {
      type: String
    },
    serviceDepartment: {
      type: String
    },
    jobTitle: {
      type: String
    },
    jobDescription: {
      type: String
    },
    firstYearOfCareer: {
      type: Date
    },
    // Second career
    companyName2: {
      type: String
    },
    jobTitle2: {
      type: String
    },
    jobDescription2: {
      type: String
    },
    // Third career
    companyName3: {
      type: String
    },
    jobTitle3: {
      type: String
    },
    jobDescription3: {
      type: String
    },
    isApplyUnlock:{
      type: Boolean
    },

    /* Marketing */
    heardFrom: {
      type: String,
      // ??????????????????????????????YS?????????YS????????????????????????????????????????????????????????????????????????????????????DM?????????E- mail????????????????????????????????????
      enum: [
        '????????????',
        '????????????',
        'YS??????',
        'YS??????',
        '???????????????????????????',
        '?????????????????????',
        '????????????',
        '??????DM',
        '??????Email????????????',
        '????????????',
        '??????'
      ]
    },
    motivation: {
      type: String
    },
    serviceRequirements: {
      type: [String]
      // ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    },
    haveParticipated: {
      type: String,
      enum: ['yes', 'no']
    },

    /* Referral */
    referralCode: {
      type: String,
      default: shortid.generate,
      unique: true
    },
    referralList: [
      {
        id: mongoose.Schema.Types.ObjectId,
        displayName: String
      }
    ],

    /* Third Party Login */
    google: {
      type: GoogleProvider,
      default: null
    },
    facebook: {
      type: FacebookProvider,
      default: null
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

UserSchema.methods.comparePassword1 = function(passwordAttempt, cb) {
  if(!this.usedPassword1){
    cb(null, false);
  }else{
    bcrypt.compare(passwordAttempt, this.usedPassword1, (err, isMatch) =>
      err ? cb(err) : cb(null, isMatch)
    )
  }
}

UserSchema.methods.comparePassword2 = function(passwordAttempt, cb) {
  if(!this.usedPassword2){
    cb(null, false);
  }else{
    bcrypt.compare(passwordAttempt, this.usedPassword2, (err, isMatch) =>
      err ? cb(err) : cb(null, isMatch)
    )
  }
}
UserSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('User', UserSchema)
