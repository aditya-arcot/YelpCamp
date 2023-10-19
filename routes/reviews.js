const express = require('express')
const catchAsync = require('../utils/catchAsync')
const { checkAuthentication, checkReviewAuthorization, validateReview } = require('../middleware')
const reviews = require('../controllers/reviews')
const router = express.Router({ mergeParams: true })

router.post('/',
    checkAuthentication,
    validateReview,
    catchAsync(reviews.createReview))

router.delete('/:reviewId',
    checkAuthentication,
    checkReviewAuthorization,
    catchAsync(reviews.deleteReview))

module.exports = router