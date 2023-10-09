const express = require('express')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { createSuccessFlashAlert, createErrorFlashAlert } = require('../utils/createFlashAlert')
const ExpressError = require('../utils/ExpressError')
const { campgroundSchema } = require('../schemas')
const { checkAuthentication } = require('../middleware')

const router = express.Router()

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (!error) return next()
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',
        { title: 'Campgrounds', campgrounds })
}))

router.get('/new', checkAuthentication, catchAsync(async (req, res) => {
    res.render('campgrounds/new',
        { title: 'New Campground' })
}))

router.post('/', checkAuthentication, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    createSuccessFlashAlert(req, 'Successfully created a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    if (!campground) {
        createErrorFlashAlert(req, 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',
        { title: 'Campground Details', campground })
}))

router.get('/:id/edit', checkAuthentication, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        createErrorFlashAlert(req, 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    createSuccessFlashAlert(req, 'Successfully updated campground!')
    res.render('campgrounds/edit',
        { title: 'Edit Campground', campground })
}))

router.put('/:id', checkAuthentication, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id', checkAuthentication, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    createSuccessFlashAlert(req, 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router