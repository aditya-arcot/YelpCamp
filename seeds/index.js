const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

const mongoPort = 27017
const mongoDB = 'yelp-camp'

// connect to database
mongoose.connect(`mongodb://localhost:${mongoPort}/${mongoDB}`)
    .then(() => console.log('connected to mongo'))
    .catch((err) => {
        console.log('connection to mongo failed')
        console.log(err)
    })

// delete all from db
// insert seed data
const randElement = array => array[Math.floor(Math.random() * array.length)]
const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const c = new Campground({
            title: `${randElement(descriptors)} ${randElement(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await c.save()
    }
    console.log('done seeding')
}
seedDB()
    .then(() => mongoose.connection.close())
    .catch(ex => console.log(ex))