const mongoose = require('mongoose')
const Review = require('./review')
const { Schema } = mongoose

const imageSchema = new Schema({
    url: String,
    filename: String
})
imageSchema.virtual('default').get(function() {
    return this.url.replace('/image/upload', '/image/upload/w_2000,ar_1.5,q_auto,f_auto')
})
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/image/upload', '/image/upload/w_250,ar_1.5,q_auto,f_auto')
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({ _id: { $in: campground.reviews } })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)