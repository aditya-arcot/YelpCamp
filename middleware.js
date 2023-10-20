const Review = require('./models/review')
const { createErrorFlashAlert } = require('./utils/createFlashAlert')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas')
const { findCampgroundById, findReviewById } = require('./utils/findMongooseObject')

module.exports.checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    createErrorFlashAlert(req, 'You must be signed in!')
    if (req.originalMethod === 'GET') {
        return res.redirect(`/login?redirect_url=${req.originalUrl}`)
    }
    return res.redirect('/login')
}

module.exports.checkCampgroundAuthorization = async (req, res, next) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
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
    const review = await findReviewById(req, res, reviewId)
    if (!review) {
        return
    }
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

module.exports.parseRedirectUrl = (req, res, next) => {
    if (req.query.redirect_url) {
        res.locals.redirect_url = req.query.redirect_url
    }
    next()
}