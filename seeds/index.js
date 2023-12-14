require('dotenv').config()
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const User = require('../models/user')
const Review = require('../models/review')
const locations = require('./locations')
const { descriptors, places } = require('./seedHelpers')
const { cloudinary } = require('../cloudinary')
const { loremIpsum } = require('lorem-ipsum')

const mongoPort = 27017
const mongoDB = 'yelp-camp'
let dbUrl = `mongodb://localhost:${mongoPort}/${mongoDB}`
if (process.env.NODE_ENV === 'production' && process.env.MONGO_URL) {
    dbUrl = process.env.MONGO_URL
}

const populateDefaultImages = async (stockImages) => {
    const resp = await cloudinary.api.resources(
        {
            type: 'upload',
            prefix: 'YelpCamp/default/'
        })
    const resources = resp.resources
    if (resources) {
        resources.forEach(img => {
            stockImages.push({
                url: img.secure_url,
                filename: img.public_id
            })
        })
    }
    else {
        throw Error('no default images found')
    }
    console.log('done populating images')
}

const connectToMongo = async url => {
    console.log(`mongo url - ${url}`)
    await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000
    })
    console.log('connected to mongo')
}

const deleteExisting = async () => {
    await Review.deleteMany({})
    await User.deleteMany({})
    await Campground.deleteMany({})
    const custom_images_prefix = process.env.NODE_ENV === 'production' ? 'YelpCamp/custom/prod' : 'YelpCamp/custom/nonprod'
    await cloudinary.api.delete_resources_by_prefix(custom_images_prefix)
    console.log('done deleting from mongo, cloudinary')
}

const seedUser = async () => {
    const admin = await User.register(new User({ username: 'admin', email: 'admin@admin' }), process.env.MONGO_ADMIN_PASSWORD)
    console.log('done seeding user')
    return admin._id
}

const randElement = array => array[Math.floor(Math.random() * array.length)]
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
}
const seedCampgrounds = async (id, stock_images) => {
    const campgrounds = []
    for (let descriptor of descriptors) {
        for (let place of places) {
            const title = `${descriptor} ${place}`

            const location = randElement(locations)
            const locationStr = `${location.city}, ${location.state}`
            const coords = { 'lat': location.latitude, 'lng': location.longitude }

            const price = (10 * Math.random() + 10).toFixed(2)

            const shuffled_images = [...stock_images]
            shuffleArray(shuffled_images)
            const images = shuffled_images.slice(0, Math.floor(Math.random() * stock_images.length) + 1)

            const description = loremIpsum({
                count: 5,
                units: 'sentences',
                format: 'plain'
            })

            const c = new Campground({
                author: id,
                title,
                location: locationStr,
                price,
                description,
                images,
                coords
            })
            campgrounds.push(c)
        }
    }
    shuffleArray(campgrounds)
    for (let campground of campgrounds) {
        await campground.save()
    }
    console.log('done seeding campgrounds')
}

const stockImages = []
populateDefaultImages(stockImages)
    .then(() => connectToMongo(dbUrl))
    .then(() => deleteExisting())
    .then(() => seedUser())
    .then((id) => seedCampgrounds(id, stockImages))
    .then(() => mongoose.connection.close())
    .catch(ex => console.log(ex))

