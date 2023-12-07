const pageSizeSelect = document.querySelector('#pageSizeSelect')
const originalVal = pageSizeSelect.value
const pageSizeBtn = document.querySelector('#pageSizeBtn')

pageSizeSelect.addEventListener('change', () => {
    const val = pageSizeSelect.value
    if (val === originalVal) pageSizeBtn.classList.add('d-none')
    else pageSizeBtn.classList.remove('d-none')
})