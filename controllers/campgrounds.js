const Campground = require('../models/campground')
const {
    createSuccessFlashAlert,
    createErrorFlashAlert,
    reflashAlerts,
} = require('../utils/createFlashAlert')
const getCoordsFromLocation = require('../utils/getCoordsFromLocation')
const { findCampgroundById } = require('../utils/findMongooseObject')

module.exports.index = async (req, res) => {
    let count
    let search = req.query.search
    if (search) {
        count = await Campground.countDocuments({
            $or: [
                { title: { $regex: new RegExp(search, 'i') } },
                { location: { $regex: new RegExp(search, 'i') } },
                { description: { $regex: new RegExp(search, 'i') } },
            ],
        })
    } else {
        count = await Campground.countDocuments({})
    }

    if (search && count === 0) {
        createErrorFlashAlert(req, 'No results for that query!')
        return res.redirect('/campgrounds')
    }

    const pageSize = res.locals.currentUser?.pageSize || 10
    const maxPage = Math.max(Math.ceil(count / pageSize), 1)

    let page = parseInt(req.query.page)
    if (!page || page < 1) {
        reflashAlerts(req, res)
        if (search) return res.redirect(`/campgrounds?page=1&search=${search}`)
        return res.redirect('/campgrounds?page=1')
    } else if (page > maxPage) {
        reflashAlerts(req, res)
        if (search)
            return res.redirect(`/campgrounds?page=${maxPage}&search=${search}`)
        return res.redirect(`/campgrounds?page=${maxPage}`)
    }

    const skip = (page - 1) * pageSize
    let campgrounds
    if (search) {
        campgrounds = await Campground.find({
            $or: [
                { title: { $regex: new RegExp(search, 'i') } },
                { location: { $regex: new RegExp(search, 'i') } },
                { description: { $regex: new RegExp(search, 'i') } },
            ],
        }).sort({ createdAt: -1 })
    } else {
        campgrounds = await Campground.find()
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
    }

    res.render('campgrounds/index', {
        title: 'Campgrounds',
        campgrounds,
        page,
        maxPage,
        pageSize,
        skip,
        count,
        search,
    })
}

module.exports.map = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/map', { title: 'Cluster Map', campgrounds })
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new', { title: 'New Campground' })
}

module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground)
    const duplicateCampground = await Campground.findOne({
        title: req.body.campground.title,
    })
    if (duplicateCampground) {
        createErrorFlashAlert(
            req,
            'A campground with that title already exists!'
        )
        return res.redirect('/campgrounds/new')
    }
    campground.author = req.user._id
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }))
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
    res.locals.currentPath = '/campgrounds'
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    res.render('campgrounds/show', {
        title: 'Campground Details',
        campground,
        redirect_url: req.originalUrl,
    })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    res.render('campgrounds/edit', { title: 'Edit Campground', campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const campground = await findCampgroundById(req, res, id)
    if (!campground) {
        return
    }
    const updates = { ...req.body.campground }
    if (req.files) {
        const new_images = req.files.map((f) => ({
            url: f.path,
            filename: f.filename,
        }))
        updates.images = campground.images.concat(new_images)
    }
    if (req.body.deleteImages) {
        updates.images = campground.images.filter(
            (image) => !req.body.deleteImages.includes(image.filename)
        )
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
