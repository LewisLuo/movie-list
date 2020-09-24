const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []
const MOVIES_PER_PAGE = 12
let displayMode = 0 // 0 for displaying by cards; 1 for displaying by bars
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const display = document.querySelector('#display')

function renderMovieList(data) {
  let rawHTML = ''
  if (displayMode === 0) {
    data.forEach((item) => {
      rawHTML += `
        <div class="sm-3">
          <div class="mb-2">
            <div class="card" style="width: 18rem;">
              <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>`
    })
    dataPanel.classList.add('row')
    dataPanel.innerHTML = rawHTML
  } else if (displayMode === 1) {
    data.forEach((item) => {
      rawHTML += `
        <li class="list-group-item">
          <div class="row d-flex justify-content-between">
            <div>${item.title}</div>
            <div class="movie-buttons">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </li>`
    })
    rawHTML = `<ul class="list-group-flush">${rawHTML}</ul>`
    dataPanel.classList.remove('row')
    dataPanel.innerHTML = rawHTML
  }
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-img')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-Poster" class="img-fluid">`
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovie')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('')
  }
  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovie', JSON.stringify(list))
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = MOVIES_PER_PAGE * (page - 1)
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPagination(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  renderPagination(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))

  if (filteredMovies.length === 0) {
    alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的電影`)
  }
})

display.addEventListener('click', function onDisplayClicked() {
  if (event.target.matches('#list-cards')) {
    displayMode = 0
  } else if (event.target.matches('#list-bars')) {
    displayMode = 1
  }
  renderMovieList(getMoviesByPage(1))
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPage))
})

axios.get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPagination(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })