const axios = require('axios')

module.exports = async (location) => {
    const response = await axios.get(
        'https://www.mapquestapi.com/geocoding/v1/address',
        {
            params: {
                key: process.env.MAPQUEST_KEY,
                location,
                maxResults: 1,
            },
        }
    )
    const data = response.data
    if (data.results && data.results[0] && data.results[0].locations) {
        const loc = data.results[0].locations[0]
        return { lat: loc.latLng.lat, lng: loc.latLng.lng }
    }
}
