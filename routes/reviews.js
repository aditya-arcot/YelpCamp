const express = require('express')
const reviews = require('../controllers/reviews')
const {
    checkAuthentication,
    checkReviewAuthorization,
    validateReview,
} = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const router = express.Router({ mergeParams: true })

router.post(
    '/',
    checkAuthentication,
    validateReview,
    catchAsync(reviews.createReview)
)

router.delete(
    '/:reviewId',
    checkAuthentication,
    checkReviewAuthorization,
    catchAsync(reviews.deleteReview)
)

module.exports = router
