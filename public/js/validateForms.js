const forms = document.querySelectorAll('.validation-form')
forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
        const ratings = document.querySelectorAll('.rating')
        if (ratings.length) {
            const selected = document.querySelectorAll('.rating.selected')
            if (!selected.length) {
                ratings.forEach((rating) => {
                    rating.classList.add('warning')
                })
            }
        }
        if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
        }
        form.classList.add('was-validated')
    })
})

const all_ratings = document.querySelectorAll('.rating')
all_ratings.forEach((rating) => {
    rating.addEventListener('click', () => {
        all_ratings.forEach((rating) => {
            rating.classList.remove('warning')
        })

        const value = rating.querySelector('input').value
        all_ratings.forEach((rating, index) => {
            if (index < value) {
                rating.classList.add('selected')
            } else {
                rating.classList.remove('selected')
            }
        })
    })
})
