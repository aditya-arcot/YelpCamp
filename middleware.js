const mongoSanitize = require('express-mongo-sanitize')
const { campgroundSchema, reviewSchema } = require('./schemas')
const { createErrorFlashAlert } = require('./utils/createFlashAlert')
const ExpressError = require('./utils/ExpressError')
const {
    findCampgroundById,
    findReviewById,
} = require('./utils/findMongooseObject')

const reqKeys = ['body', 'params', 'headers']
const _sanitize = (obj) => mongoSanitize.sanitize(obj, { replaceWith: '_' })

module.exports.sanitize = (req, _res, next) => {
    for (const key of reqKeys) {
        if (req[key] && mongoSanitize.has(req[key])) {
            console.warn(`sanitizing req.${key}`)
            console.log('original:')
            console.log(req[key])
            req[key] = _sanitize(req[key])
            console.log('sanitized:')
            console.log(req[key])
        }
    }
    next()
}

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
    return res.redirect(`/campgrounds/${id}`)
}

module.exports.validateCampground = (req, _res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (!error) return next()
    const msg = error.details.map((el) => el.message).join(',')
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
    return res.redirect(`/campgrounds/${id}`)
}

module.exports.validateReview = (req, _res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (!error) return next()
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
}

module.exports.parseRedirectUrl = (req, res, next) => {
    if (req.query.redirect_url) {
        res.locals.redirect_url = req.query.redirect_url
    }
    next()
}
