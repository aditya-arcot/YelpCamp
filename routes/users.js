const express = require('express')
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const { parseRedirectUrl } = require('../middleware')
const users = require('../controllers/users')
const router = express.Router({ mergeParams: true })

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLoginForm)
    .post(parseRedirectUrl,
        passport.authenticate('local', {
            failureFlash: true,
            failureRedirect: '/login'
        }),
        catchAsync(users.login)
    )

router.get('/logout', users.logout)

module.exports = router