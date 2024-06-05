const Campground = require('../models/campground')
const Review = require('../models/review')
const { createErrorFlashAlert } = require('../utils/createFlashAlert')

module.exports.findCampgroundById = async (req, res, id) => {
    let campground
    try {
        campground = await Campground.findById(id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author',
                },
            })
            .populate('author')
    } catch (err) {
        createErrorFlashAlert(req, 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    if (!campground) {
        createErrorFlashAlert(req, 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    return campground
}

module.exports.findReviewById = async (req, res, id) => {
    let review
    try {
        review = await Review.findById(id)
    } catch (err) {
        createErrorFlashAlert(req, 'Cannot find that review!')
        return res.redirect('/campgrounds')
    }
    if (!review) {
        createErrorFlashAlert(req, 'Cannot find that review!')
        return res.redirect('/campgrounds')
    }
    return review
}
