const campground = JSON.parse(campgroundString)

L.mapquest.key = mapToken

var map = L.mapquest.map('showPageMap', {
    center: [campground.coords.lat, campground.coords.lng],
    layers: L.mapquest.tileLayer('map'),
    zoom: 12
})

L.mapquest
    .textMarker([campground.coords.lat, campground.coords.lng], {
        type: 'circle',
        icon: {
            primaryColor: '#3C464F',
            secondaryColor: '#1853BA',
            size: 'sm'
        }
    })
    .bindPopup(L.popup()
        .setContent(`<strong><a href=/campgrounds/${campground._id}>` + campground.title + '</a></strong><br>' +
            campground.location
        )
    )
    .addTo(map)

map.addControl(L.mapquest.control())