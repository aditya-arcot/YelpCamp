const express = require('express')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { createSuccessFlashAlert, createErrorFlashAlert } = require('../utils/createFlashAlert')
const { checkAuthentication, checkCampgroundAuthorization, validateCampground } = require('../middleware')

const router = express.Router()

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',
        { title: 'Campgrounds', campgrounds })
}))

router.get('/new', checkAuthentication, catchAsync(async (req, res) => {
    res.render('campgrounds/new',
        { title: 'New Campground' })
}))

router.post('/', checkAuthentication, validateCampground,
    catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground)
        campground.author = req.user._id
        await campground.save()
        createSuccessFlashAlert(req, 'Successfully created a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
    }))

router.get('/:id', catchAsync(async (req, res) => {
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
}))

router.get('/:id/edit', checkAuthentication, checkCampgroundAuthorization,
    catchAsync(async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findById(id)
        if (!campground) {
            createErrorFlashAlert(req, 'Cannot find that campground!')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/edit',
            { title: 'Edit Campground', campground })
    }))

router.put('/:id', checkAuthentication, checkCampgroundAuthorization, validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params
        await Campground.findByIdAndUpdate(id, { ...req.body.campground })
        createSuccessFlashAlert(req, 'Successfully updated campground!')
        res.redirect(`/campgrounds/${id}`)
    }))

router.delete('/:id', checkAuthentication, checkCampgroundAuthorization,
    catchAsync(async (req, res) => {
        const { id } = req.params
        await Campground.findByIdAndDelete(id)
        createSuccessFlashAlert(req, 'Successfully deleted campground!')
        res.redirect('/campgrounds')
    }))

module.exports = router