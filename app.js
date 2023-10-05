const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

// DATABASE
const mongoPort = 27017
const mongoDB = 'yelp-camp'

mongoose.connect(`mongodb://localhost:${mongoPort}/${mongoDB}`)
    .then(() => console.log('connected to mongo'))
    .catch((err) => {
        console.log('connection to mongo failed')
        console.log(err)
    })

// WEB APP
const app = express()
const webPort = 3000
const weekTime = 1000 * 60 * 60 * 24 * 7

// setup
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// middleware
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'secretplaceholder',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + weekTime,
        maxAge: weekTime,
        httpOnly: true
    }
}))
app.use(flash())
app.use((req, res, next) => {
    res.locals.alerts = req.flash('alerts')
    next()
})

// routes
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' })
})
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// error handler
app.use((err, req, res, next) => {
    const { status = 500 } = err
    res.status(status).render('error', { title: 'Error', err })
})

// start
app.listen(webPort, () => {
    console.log(`server started on port ${webPort}`)
})