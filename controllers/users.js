const User = require('../models/user')
const { createSuccessFlashAlert, createErrorFlashAlert } = require('../utils/createFlashAlert')

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register', { title: 'Register' })
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login', { title: 'Login' })
}

module.exports.login = async (req, res) => {
    createSuccessFlashAlert(req, 'Welcome Back!')
    const redirectUrl = res.locals.redirectUrl || '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout(function (e) {
        if (e) return next(e)
        createSuccessFlashAlert(req, 'Goodbye!')
        res.redirect('/campgrounds')
    })
}