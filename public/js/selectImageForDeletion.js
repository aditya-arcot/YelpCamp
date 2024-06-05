document.querySelectorAll('.img-thumbnail').forEach((img) => {
    img.addEventListener('click', function () {
        this.classList.toggle('selected-image')
        const checkbox = this.parentElement.querySelector('input')
        checkbox.checked = this.classList.contains('selected-image')
    })
})
