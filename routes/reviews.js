const express = require('express')
const Review = require('../models/review')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { createSuccessFlashAlert } = require('../utils/createFlashAlert')
const { checkAuthentication, checkReviewAuthorization, validateReview } = require('../middleware')

const router = express.Router({ mergeParams: true })

router.post('/', checkAuthentication, validateReview,
    catchAsync(async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findById(id)
        const review = new Review(req.body.review)
        review.author = req.user._id
        campground.reviews.push(review)
        await review.save()
        await campground.save()
        createSuccessFlashAlert(req, 'Successfully created a new review!')
        res.redirect(`/campgrounds/${id}`)
    }))

router.delete('/:reviewId', checkAuthentication, checkReviewAuthorization,
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
        await Review.findByIdAndDelete(reviewId)
        createSuccessFlashAlert(req, 'Successfully deleted review!')
        res.redirect(`/campgrounds/${id}`)
    }))

module.exports = router