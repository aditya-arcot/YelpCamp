const FlashMessage = require('./FlashMessage')

module.exports.createSuccessFlashAlert = function (req, text) {
    req.flash('alerts', new FlashMessage(text, 'success'))
}
module.exports.createErrorFlashAlert = function (req, text) {
    req.flash('alerts', new FlashMessage(text, 'error'))
}

module.exports.reflashAlerts = function (req, res) {
    for (let alert of res.locals.alerts)
    {
        req.flash('alerts', alert)
    }
}