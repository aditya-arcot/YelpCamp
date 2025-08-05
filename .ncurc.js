module.exports = {
    target: (name, _) => {
        if (name === 'cloudinary') return 'minor'
        return 'latest'
    },
}
