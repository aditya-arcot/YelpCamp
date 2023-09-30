const Joi = require('joi')

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string()
            .required(),
        location: Joi.string()
            .required(),
        image: Joi.string()
            .required(),
        price: Joi.number()
            .required()
            .precision(2)
            .min(0),
        description: Joi.string()
            .required()
    }).required()
})