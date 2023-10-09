class FlashMessage {
    constructor(text, type) {
        this.text = text
        this.type = type
    }
}

module.exports.createSuccessFlashAlert = function (req, text) {
    req.flash('alerts', new FlashMessage(text, 'success'))
}
module.exports.createErrorFlashAlert = function (req, text) {
    req.flash('alerts', new FlashMessage(text, 'error'))
}