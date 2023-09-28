const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground')

// db connection
const mongoPort = 27017
const mongoDB = 'yelp-camp'

mongoose.connect(`mongodb://localhost:${mongoPort}/${mongoDB}`)
    .then(() => console.log('connected to mongo'))
    .catch((err) => {
        console.log('connection to mongo failed')
        console.log(err)
    })


// web app
const app = express()
const webPort = 3000
const baseUrl = '/campgrounds'
const campgroundViewsPath = 'campgrounds'

app.engine('ejs', ejsMate) // override default ejs engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home', { title: 'Home', baseUrl })
})

app.get(baseUrl, async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render(path.join(campgroundViewsPath, 'index'),
        { title: 'Campgrounds', baseUrl, campgrounds })
})

app.get(path.join(baseUrl, 'new'), async (req, res) => {
    res.render(path.join(campgroundViewsPath, 'new'),
        { title: 'New Campground', baseUrl })
})

app.post(baseUrl, async (req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(path.join(baseUrl, campground._id.toString()))
})

app.get(path.join(baseUrl, ':id'), async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render(path.join(campgroundViewsPath, 'show'),
        { title: 'Campground Details', baseUrl, campground })
})

app.get(path.join(baseUrl, ':id', 'edit'), async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render(path.join(campgroundViewsPath, 'edit'),
        { title: 'Edit Campground', baseUrl, campground })
})

app.put(path.join(baseUrl, ':id'), async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(path.join(baseUrl, id.toString()))
})

app.delete(path.join(baseUrl, ':id'), async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect(baseUrl)
})

app.listen(webPort, () => {
    console.log(`server started on port ${webPort}`)
})