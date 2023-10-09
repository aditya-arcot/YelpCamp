const express = require('express')
const passport = require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const { createSuccessFlashAlert, createErrorFlashAlert } = require('../utils/createFlashAlert')
const { storeRedirectUrl } = require('../middleware')

const router = express.Router({ mergeParams: true })

router.get('/register', (req, res) => {
    res.render('users/register', { title: 'Register' })
})
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            createSuccessFlashAlert(req, 'Welcome to Yelp Camp!')
            return res.redirect('/campgrounds')
        })
    } catch (e) {
        createErrorFlashAlert(req, e.message)
        return res.redirect('/register')
    }
}))
router.get('/login', (req, res) => {
    res.render('users/login', { title: 'Login' })
})
router.post('/login',
    storeRedirectUrl,
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),
    catchAsync(async (req, res) => {
        createSuccessFlashAlert(req, 'Welcome Back!')
        const redirectUrl = res.locals.redirectUrl || '/campgrounds'
        res.redirect(redirectUrl)
    })
)
router.get('/logout', (req, res) => {
    req.logout(function (e) {
        if (e) return next(e)
        createSuccessFlashAlert(req, 'Goodbye!')
        res.redirect('/campgrounds')
    })
})


module.exports = router