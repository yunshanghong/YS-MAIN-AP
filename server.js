require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
require('./config/passport')(passport)
const app = express()
const i18n = require('i18n')
const initMongo = require('./config/mongo')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')

// Init MongoDB
initMongo(mongoose);

// Setup express server port from ENV, default: 3000
app.set('port', process.env.PORT || 3000)

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// User Uploads
app.use('/uploads', express.static('uploads'))

// Redis cache enabled by env variable
if (process.env.USE_REDIS === 'true') {
  const getExpeditiousCache = require('express-expeditious')
  const cache = getExpeditiousCache({
    namespace: 'expresscache',
    defaultTtl: '1 minute',
    engine: require('expeditious-engine-redis')({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    })
  })
  app.use(cache)
}

// for parsing json
app.use(
  bodyParser.json({
    limit: '20mb'
  })
)
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
)

// i18n
i18n.configure({
  locales: ['zh-TW', 'en', 'es'],
  directory: `${__dirname}/locales`,
  defaultLocale: 'zh-TW',
  objectNotation: true
})
app.use(i18n.init)

// cors settings

const corsOptions = {
  origin: [process.env.NODE_ENV.trim() === "development" ? "http://localhost:8080" : "http://kys.wda.gov.tw"],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// 使用 session middleware
const sessionConfig = session({
  cookie: { 
    secure: process.env.NODE_ENV.trim() === "production",
    httpOnly: true
  },
  secret: 'kysMainWeb',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
})


// Init all other stuff
app.use(cors(corsOptions))
app.use(passport.initialize())
app.use(compression())
app.use(helmet())
app.use(sessionConfig);
app.use(express.static('public'))
app.use(require('./app/routes'))
app.listen(app.get('port'))

module.exports = app // for testing
