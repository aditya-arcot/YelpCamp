/* global campgroundsString, mapToken, L*/

const campgrounds = JSON.parse(campgroundsString)
L.mapquest.key = mapToken
var baseLayer = L.mapquest.tileLayer('map')

var map = L.mapquest.map('clusterMap', {
    center: L.latLng([39.8283, -98.5795]),
    layers: baseLayer,
    zoom: 4,
})

var markers = L.markerClusterGroup()

for (let campground of campgrounds) {
    const marker = L.marker(
        new L.LatLng(campground.coords.lat, campground.coords.lng),
        {
            title: campground.title,
            icon: L.mapquest.icons.marker(),
        }
    )
    marker.bindPopup(
        L.popup().setContent(
            `<strong><a href=/campgrounds/${campground._id}>` +
                campground.title +
                '</a></strong><br>' +
                campground.location
        )
    )
    markers.addLayer(marker)
}

map.addLayer(markers)
map.addControl(L.mapquest.control())
