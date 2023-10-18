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
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
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
        { title: 'Campground Details', campground, redirect_url: req.originalUrl })
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
    const campground = await Campground.findById(id)
    const updates = { ...req.body.campground };
    if (req.files) {
        const new_images = req.files.map(f => ({ url: f.path, filename: f.filename }))
        updates.images = campground.images.concat(new_images);
    }
    if (req.body.deleteImages) {
        updates.images = campground.images.filter(image => !req.body.deleteImages.includes(image.filename));
    }
    await Campground.findByIdAndUpdate(id, { $set: updates });
    createSuccessFlashAlert(req, 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    createSuccessFlashAlert(req, 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}