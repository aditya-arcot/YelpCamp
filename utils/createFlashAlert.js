const FlashMessage = require('./FlashMessage')

module.exports.createSuccessFlashAlert = function (req, text) {
    req.flash('alerts', new FlashMessage(text, 'success'))
}
module.exports.createErrorFlashAlert = function (req, text) {
    req.flash('alerts', new FlashMessage(text, 'error'))
}