const express = require('express')
const multer = require('multer')
const { storage } = require('../cloudinary')
const campgrounds = require('../controllers/campgrounds')
const {
    checkAuthentication,
    checkCampgroundAuthorization,
    validateCampground,
} = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const router = express.Router()
const upload = multer({ storage })

router
    .route('/')
    .get(catchAsync(campgrounds.index))
    .post(
        checkAuthentication,
        upload.array('images'),
        validateCampground,
        catchAsync(campgrounds.createCampground)
    )

router.route('/map').get(catchAsync(campgrounds.map))

router.get('/new', checkAuthentication, catchAsync(campgrounds.renderNewForm))

router
    .route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(
        checkAuthentication,
        checkCampgroundAuthorization,
        upload.array('images'),
        validateCampground,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(
        checkAuthentication,
        checkCampgroundAuthorization,
        catchAsync(campgrounds.deleteCampground)
    )

router.get(
    '/:id/edit',
    checkAuthentication,
    checkCampgroundAuthorization,
    catchAsync(campgrounds.renderEditForm)
)

module.exports = router
