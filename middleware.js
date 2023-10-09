const { createErrorFlashAlert } = require('./utils/createFlashAlert')

module.exports.checkAuthentication = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.originalMethod === 'GET') {
            req.session.redirectUrl = req.originalUrl
        }
        else {
            req.session.redirectUrl = undefined
        }
        createErrorFlashAlert(req, 'You must be signed in!')
        return res.redirect('/login')
    }
    next()
}


module.exports.storeRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}