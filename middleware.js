const Campground = require('./models/campground')
const Review = require('./models/review')
const { createErrorFlashAlert } = require('./utils/createFlashAlert')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas')

module.exports.checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    req.session.redirectUrl = undefined
    if (req.originalMethod === 'GET') {
        req.session.redirectUrl = req.originalUrl
    }
    createErrorFlashAlert(req, 'You must be signed in!')
    return res.redirect('/login')
}

module.exports.checkCampgroundAuthorization = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (campground.author.equals(req.user._id)) return next()
    createErrorFlashAlert(req, 'You do not have permission do that!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (!error) return next()
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
}

module.exports.checkReviewAuthorization = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (review.author.equals(req.user._id)) return next()
    createErrorFlashAlert(req, 'You do not have permission do that!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (!error) return next()
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
}

module.exports.storeRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}