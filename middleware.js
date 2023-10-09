const { createErrorFlashAlert } = require('./utils/createFlashAlert')

module.exports.checkAuthentication = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        createErrorFlashAlert(req, 'You must be signed in!')
        return res.redirect('/login')
    }
    next()
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo
    }
    next()
}