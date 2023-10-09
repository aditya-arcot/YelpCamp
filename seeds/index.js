const mongoose = require('mongoose')
const Campground = require('../models/campground')
const User = require('../models/user')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

const mongoPort = 27017
const mongoDB = 'yelp-camp'

mongoose.connect(`mongodb://localhost:${mongoPort}/${mongoDB}`)
    .then(() => console.log('connected to mongo'))
    .catch((err) => {
        console.log('connection to mongo failed')
        console.log(err)
    })

const seedUser = async () => {
    await User.deleteMany({})
    const user = new User({
        email: 'root@root',
        username: 'root'
    })
    const rootUser = await User.register(new User({ username: 'root', email: 'root@root' }), 'root')
    const rootUser2 = await User.register(new User({ username: 'root2', email: 'root2@root' }), 'root2')
    const dummyUser = await User.register(new User({ username: 'dummy', email: 'dummy@dummy' }), 'dummy')
    console.log('done seeding root users')
    return [rootUser._id, rootUser2._id]
}

const randElement = array => array[Math.floor(Math.random() * array.length)]
const seedCampgrounds = async (ids) => {
    await Campground.deleteMany({})
    for (let i = 0; i < 10; i++) {
        const _id = i % 2 === 0 ? ids[0] : ids[1]
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const c = new Campground({
            author: _id,
            title: `${randElement(descriptors)} ${randElement(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic nobis repellendus doloremque perspiciatis, commodi aspernatur culpa, dignissimos aperiam officia accusantium autem dolorem, iure provident iusto odit quidem dolore consequatur. Accusamus.',
            price
        })
        await c.save()
    }
    console.log('done seeding campgrounds')
}

seedUser()
    .then((ids) => seedCampgrounds(ids))
    .then(() => mongoose.connection.close())
    .catch(ex => console.log(ex))
