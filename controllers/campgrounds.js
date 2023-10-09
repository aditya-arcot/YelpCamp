const Campground = require('../models/campground')
const { createSuccessFlashAlert, createErrorFlashAlert } = require('../utils/createFlashAlert')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',
        { title: 'Campgrounds', campgrounds })
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new',
        { title: 'New Campground' })
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    createSuccessFlashAlert(req, 'Successfully created a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author')
    if (!campground) {
        createErrorFlashAlert(req, 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',
        { title: 'Campground Details', campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        createErrorFlashAlert(req, 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit',
        { title: 'Edit Campground', campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    createSuccessFlashAlert(req, 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    createSuccessFlashAlert(req, 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}