if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoose = require('mongoose')
const Campground = require('../models/campground')
const User = require('../models/user')
const Review = require('../models/review')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const { cloudinary } = require('../cloudinary')

const mongoPort = 27017
const mongoDB = 'yelp-camp'

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

const connectToMongoose = async () => {
    await mongoose.connect(`mongodb://localhost:${mongoPort}/${mongoDB}`)
    console.log('done connecting to mongo')
}

const deleteExisting = async () => {
    await Review.deleteMany({})
    await User.deleteMany({})
    await Campground.deleteMany({})
    await cloudinary.api.delete_resources_by_prefix('YelpCamp/custom/')
    console.log('done deleting from mongo, cloudinary')
}

const seedUsers = async () => {
    await User.register(new User({ username: 'nonroot', email: 'nonroot@nonroot' }), 'nonroot')
    const rootUser = await User.register(new User({ username: 'root', email: 'root@root' }), 'root')
    const rootUser2 = await User.register(new User({ username: 'root2', email: 'root2@root' }), 'root2')
    console.log('done seeding users')
    return [rootUser._id, rootUser2._id]
}

const randElement = array => array[Math.floor(Math.random() * array.length)]
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
const seedCampgrounds = async (ids, stock_images, n = 10) => {
    for (let i = 0; i < n; i++) {
        const _id = i % 2 === 0 ? ids[0] : ids[1]
        const descriptor = randElement(descriptors)
        const place = randElement(places)
        const location = randElement(cities)
        const price = (10 * Math.random() + 10).toFixed(2)

        const shuffled_images = [...stock_images]
        shuffleArray(shuffled_images)
        const images = shuffled_images.slice(0, Math.floor(Math.random() * stock_images.length) + 1)

        const c = new Campground({
            author: _id,
            title: `${descriptor} ${place}`,
            location: `${location.city}, ${location.state}`,
            price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic nobis repellendus doloremque perspiciatis, commodi aspernatur culpa, dignissimos aperiam officia accusantium autem dolorem, iure provident iusto odit quidem dolore consequatur. Accusamus.',
            images
        })
        await c.save()
    }
    console.log('done seeding campgrounds')
}

const stockImages = []
populateDefaultImages(stockImages)
    .then(() => connectToMongoose())
    .then(() => deleteExisting())
    .then(() => seedUsers())
    .then((ids) => seedCampgrounds(ids, stockImages))
    .then(() => mongoose.connection.close())
    .catch(ex => console.log(ex))

