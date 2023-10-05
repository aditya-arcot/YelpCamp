class FlashMessage {
    constructor(text, type) {
        this.text = text
        this.type = type
    }
}

module.exports = function (req, text, type = 'success' ) {
    req.flash('alerts', new FlashMessage(text, type))
}