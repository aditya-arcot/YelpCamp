const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const ExpressError = require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const User = require('./models/user')
const { createErrorFlashAlert } = require('./utils/createFlashAlert')
const { env } = require('process')

// DATABASE
const dbUrl = env.MONGO_URL
const connectToMongo = async (url) => {
    console.log(`mongo url - ${url}`)
    await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
    })
    console.log('connected to mongo')
}

// HTTPS SERVER
const app = express()
const weekTime = 1000 * 60 * 60 * 24 * 7
const secret = env.SESSIONS_SECRET
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: { secret },
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + weekTime,
        secure: env.NODE_ENV === 'production',
        maxAge: weekTime,
        httpOnly: true,
    },
}

const scriptSrcUrls = [
    'https://cdn.jsdelivr.net',
    'https://api.mqcdn.com',
    'https://unpkg.com',
]
const styleSrcUrls = [
    'https://cdn.jsdelivr.net',
    'https://api.mqcdn.com',
    'https://unpkg.com',
]
const connectSrcUrls = [
    'http://www.mapquestapi.com',
    'http://api-s.mqcdn.com',
    'http://attribution.aws.mapquest.com',
]
const imgSrcUrls = [
    'https://images.unsplash.com/',
    'https://assets.mapquestapi.com',
    'https://a.tiles.mapquest.com',
    `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`,
]
const fontSrcUrls = ['https://api.mqcdn.com']

// setup
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
}

// middleware
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    mongoSanitize({
        replaceWith: '_',
    })
)
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())
app.use(
    /* eslint-disable quotes */
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            childSrc: ['blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
            fontSrc: ["'self'", ...fontSrcUrls],
            manifestSrc: ["'self'"],
        },
    })
    /* eslint-enable quotes */
)
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
    // passport login error
    const passportFlashErrors = req.flash('error')
    if (passportFlashErrors && passportFlashErrors.length) {
        createErrorFlashAlert(req, passportFlashErrors[0])
    }
    res.locals.alerts = req.flash('alerts')
    res.locals.currentUser = req.user
    next()
})

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// routes
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.get('/', (req, res) => res.render('home'))
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    res.status(statusCode).render('error', { title: 'Error', err })
})

// HTTP SERVER
const httpApp = express()
httpApp.use((req, res) => {
    const url = `https://${req.headers.host}${req.originalUrl}`
    console.log(`redirecting http request to ${url}`)
    return res.redirect(url)
})

// start
connectToMongo(dbUrl)
    .then(() => {
        const port = 3000
        app.listen(port, () => {
            console.log(`http server started on port ${port}`)
        })
    })
    .catch((ex) => {
        console.log(ex)
        process.exit(1)
    })
