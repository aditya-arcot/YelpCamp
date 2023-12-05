const Campground = require('../models/campground')
const { createSuccessFlashAlert, reflashAlerts } = require('../utils/createFlashAlert')
const getCoordsFromLocation = require('../utils/getCoordsFromLocation')
const { findCampgroundById } = require('../utils/findMongooseObject')
const pageSize = 50

module.exports.index = async (req, res) => {
    const count = await Campground.countDocuments({})
    const maxPage = Math.max(Math.ceil(count / pageSize), 1)

    let page = parseInt(req.query.page)
    if (!page || page < 1) {
        reflashAlerts(req, res)
        return res.redirect('/campgrounds?page=1')
    }
    if (page > maxPage) {
        reflashAlerts(req, res)
        return res.redirect(`/campgrounds?page=${maxPage}`)
    }

    const skip = (page - 1) * pageSize
    const campgrounds = await Campground.find({})
        .skip(skip)
        .limit(pageSize)

    res.render('campgrounds/index',
        { title: 'Campgrounds', campgrounds, page, maxPage })
}

module.exports.map = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/map',
        { title: 'Cluster Map', campgrounds })
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new',
        { title: 'New Campground' })
}

module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    const coords = await getCoordsFromLocation(req.body.campground.location)
    if (coords) {
        campground.coords = coords
    }
    await campground.save()
    createSuccessFlashAlert(req, 'Successfully created a new campground!')
    return res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    res.render('campgrounds/show',
        { title: 'Campground Details', campground, redirect_url: req.originalUrl })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    res.render('campgrounds/edit',
        { title: 'Edit Campground', campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    const updates = { ...req.body.campground }
    if (req.files) {
        const new_images = req.files.map(f => ({ url: f.path, filename: f.filename }))
        updates.images = campground.images.concat(new_images)
    }
    if (req.body.deleteImages) {
        updates.images = campground.images.filter(image => !req.body.deleteImages.includes(image.filename))
    }
    const coords = await getCoordsFromLocation(req.body.campground.location)
    updates.coords = coords ? coords : {}
    await campground.updateOne({ $set: updates })
    createSuccessFlashAlert(req, 'Successfully updated campground!')
    return res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    await campground.deleteOne()
    createSuccessFlashAlert(req, 'Successfully deleted campground!')
    return res.redirect('/campgrounds')
}