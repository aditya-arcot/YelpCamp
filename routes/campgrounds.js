const express = require('express')
const catchAsync = require('../utils/catchAsync')
const { checkAuthentication, checkCampgroundAuthorization, validateCampground } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const router = express.Router()

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(checkAuthentication,
        validateCampground,
        catchAsync(campgrounds.createCampground))

router.get('/new',
    checkAuthentication,
    catchAsync(campgrounds.renderNewForm))

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(checkAuthentication,
        checkCampgroundAuthorization,
        validateCampground,
        catchAsync(campgrounds.updateCampground))
    .delete(checkAuthentication,
        checkCampgroundAuthorization,
        catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',
    checkAuthentication,
    checkCampgroundAuthorization,
    catchAsync(campgrounds.renderEditForm))

module.exports = router