(function () {
    'use strict';
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        Array.from(forms).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                const ratings = document.querySelectorAll('.rating')
                if (ratings.length) {
                    const selected = document.querySelectorAll('.rating.selected')
                    if (!selected.length) {
                        ratings.forEach(rating => {
                            rating.classList.add('warning')
                        })
                    }
                }

                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        })
    });
})();