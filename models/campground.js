const mongoose = require('mongoose')
const Review = require('./review')
const { Schema } = mongoose

const imageSchema = new Schema({
    url: String,
    filename: String
})
imageSchema.virtual('default').get(function () {
    return this.url.replace('/image/upload', '/image/upload/w_2000,ar_1.5,q_auto,f_auto')
})
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/image/upload', '/image/upload/w_250,ar_1.5,q_auto,f_auto')
})

const campgroundSchema = new Schema({
    title: String,
    location: String,
    price: Number,
    description: String,
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    coords: {
        lat: Number,
        lng: Number
    }
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({ _id: { $in: campground.reviews } })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)