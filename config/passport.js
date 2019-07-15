const passport = require('passport')
const User = require('../app/models/user')
// const auth = require('../app/middleware/auth')
const JwtStrategy = require('passport-jwt').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

/**
 * Extracts token from: header, body or query
 * @param {Object} req - request object
 * @returns {string} token - decrypted token
 */
const jwtExtractor = req => {
  let token = null
  if (req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '').trim()
  } else if (req.body.token) {
    token = req.body.token.trim()
  } else if (req.query.token) {
    token = req.query.token.trim()
  }
  // if (token) {
  //   // Decrypts token
  //   token = auth.decrypt(token)
  // }
  return token
}

/**
 * Options object for jwt middlware
 */
const jwtOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: process.env.JWT_SECRET
}

/**
 * Login with JWT middleware
 */
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload.data._id, (err, user) => {
    if (err) {
      return done(err, false)
    }
    return !user ? done(null, false) : done(null, user)
  })
})

const googleLogin = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.AUTH_API_END_POINT}/auth/link/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      // User.findOrCreate(
      //   { google: { id: profile.id } },
      //   { google: { name: profile.displayName, userid: profile.id } },
      //   (err, user) => {
      //     return done(err, user)
      //   }
      // )

      // const { sub, name, picture, email } = profile._json

      // console.log('accessToken, ', accessToken)
      // console.log('refreshToken, ', refreshToken)
      // console.log('profile, ', profile)
      // console.log('profile._json, ', profile._json)

      // model.findOneAndUpdate(
      //   { google: { id: sub } },
      //   {
      //     google: {
      //       id: sub,
      //       displayName: name,
      //       photoURL: picture,
      //       email
      //     }
      //   },
      //   (err, user) => {
      //     return done(err, user)
      //   }
      // )

      // const userGoogleData = {
      //   accessToken,
      //   profile: profile._json
      // }
      console.log('req.session in google callback ', req.session)

      return done(null, {})
    })
  }
)

passport.use(jwtLogin)
passport.use(googleLogin)
