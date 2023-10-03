const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const { campgroundSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')

// db connection
const mongoPort = 27017
const mongoDB = 'yelp-camp'

mongoose.connect(`mongodb://localhost:${mongoPort}/${mongoDB}`)
    .then(() => console.log('connected to mongo'))
    .catch((err) => {
        console.log('connection to mongo failed')
        console.log(err)
    })


// web app
const app = express()
const webPort = 3000
const baseUrl = '/campgrounds'
const campgroundViewsPath = 'campgrounds'

app.engine('ejs', ejsMate) // override default ejs engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const validateBody = (body, next, schema) => {
    console.log(body)
    const { error } = schema.validate(body)
    if (error) {
        // handle multiple errors
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

const validateCampground = (req, res, next) => {
    validateBody(req.body, next, campgroundSchema)
}

const validateReview = (req, res, next) => {
    validateBody(req.body, next, reviewSchema)
}

app.get('/', (req, res) => {
    res.render('home', { title: 'Home', baseUrl })
})

app.get(baseUrl, catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render(path.join(campgroundViewsPath, 'index'),
        { title: 'Campgrounds', baseUrl, campgrounds })
}))

app.get(path.join(baseUrl, 'new'), catchAsync(async (req, res) => {
    res.render(path.join(campgroundViewsPath, 'new'),
        { title: 'New Campground', baseUrl })
}))

app.post(baseUrl, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(path.join(baseUrl, campground._id.toString()))
}))

app.get(path.join(baseUrl, ':id'), catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    res.render(path.join(campgroundViewsPath, 'show'),
        { title: 'Campground Details', baseUrl, campground })
}))

app.get(path.join(baseUrl, ':id', 'edit'), catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render(path.join(campgroundViewsPath, 'edit'),
        { title: 'Edit Campground', baseUrl, campground })
}))

app.put(path.join(baseUrl, ':id'), validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(path.join(baseUrl, id.toString()))
}))

app.delete(path.join(baseUrl, ':id'), catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect(baseUrl)
}))

app.post(path.join(baseUrl, ':id', 'reviews'), validateReview, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(path.join(baseUrl, id.toString()))
}))

app.delete(path.join(baseUrl, ':id', 'reviews', ':reviewId'), catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(path.join(baseUrl, id.toString()))
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    res.status(status).render('error', { title: 'Error', baseUrl, err })
})

app.listen(webPort, () => {
    console.log(`server started on port ${webPort}`)
})