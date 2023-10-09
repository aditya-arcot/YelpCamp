const Review = require('../models/review')
const Campground = require('../models/campground')
const { createSuccessFlashAlert } = require('../utils/createFlashAlert')

module.exports.createReview = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    createSuccessFlashAlert(req, 'Successfully created a new review!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    createSuccessFlashAlert(req, 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}