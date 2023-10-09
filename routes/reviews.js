const express = require('express')
const Review = require('../models/review')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { createSuccessFlashAlert } = require('../utils/createFlashAlert')
const ExpressError = require('../utils/ExpressError')
const { reviewSchema } = require('../schemas')

const router = express.Router({ mergeParams: true })

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    createSuccessFlashAlert(req, 'Successfully created a new review!')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    createSuccessFlashAlert(req, 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router