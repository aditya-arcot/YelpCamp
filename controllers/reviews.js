const Review = require('../models/review')
const { createSuccessFlashAlert } = require('../utils/createFlashAlert')
const {
    findCampgroundById,
    findReviewById,
} = require('../utils/findMongooseObject')

module.exports.createReview = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    createSuccessFlashAlert(req, 'Successfully created a new review!')
    return res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    await campground.updateOne({ $pull: { reviews: reviewId } })
    const review = await findReviewById(req, res, reviewId)
    if (!review) {
        return
    }
    await review.deleteOne()
    createSuccessFlashAlert(req, 'Successfully deleted review!')
    return res.redirect(`/campgrounds/${id}`)
}
