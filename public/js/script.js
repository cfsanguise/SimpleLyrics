'use strict'

document.addEventListener('DOMContentLoaded', () => {
    const searchModal = document.querySelector('.search-modal')
    const searchButton = document.querySelector('.header__searchbtn')
    const searchInput = document.querySelectorAll('.header__search')
    const searchResults = document.querySelector('.header__results')       
    const submitBtn = document.querySelector('.header__submit')
    const container = document.querySelector('.content')

    const loading = node => {
        const elem = document.createElement('img')
        elem.setAttribute('src', './img/loading.gif')
        elem.classList.add('loading')
        node.appendChild(elem)
    }

    const loaded = node => {
        node.querySelector('.loading').remove()
    }

    const clearSearch = () => {
        searchResults.querySelectorAll('a').forEach(item => {
            item.removeEventListener('click', linkEvent)
        })
        searchResults.innerHTML = ``
    }

    const closeSearchModal = () => {
        searchModal.classList.remove('open')
        submitBtn.classList.remove('open')
    }

    const printError =  (error, destination) => {
        const e = document.createElement('p')
        e.textContent = error
        e.classList.add('error')
        destination.innerHTML = ``
        destination.appendChild(e)
    }

    const upgradeLyrics = () => {
        const lyricsLinks = document.querySelectorAll('.song__lyrics div a')
        lyricsLinks.forEach(link => {
        link.classList = ''
        link.classList.add('song__lyrics-link')
        const href = link.getAttribute('href')
        link.setAttribute('href', 'https://genius.com' + href)
        link.setAttribute('title', 'View annotation at genius.com')
    })
    }
    
    const findLyrics = async (query, songid) => {
        container.innerHTML = ``
        loading(container)
        fetch(`http://localhost:3000/lyrics?path=${query}&id=${songid}`, {method: 'GET'})
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw Error('Server did not respond')
            }
        })
        .then(({html, info}) => {
            const root = JSON.parse(info).response.song
            const youtubeVideo = root.media.filter(items => items.provider == 'youtube')
            container.innerHTML = `
            <section class="song">
                <div class="song__info">
                <div class="song__image">
                    <img src="${root.song_art_image_url}" alt="${root.artist_names}">
                </div>
                <h2 class="song__name" data-readable>${root.title_with_featured}</h2>
                <div class="song__additional">
                    <h3 data-readable class="song__author">${root.artist_names}</h3>
                    <h6 data-readable class="song__date">${root.release_date == null ? 'not known': root.release_date_for_display}</h6>
                </div>
                </div>
                <article class="song__lyrics">
                    ${html}
                </article>
            </section>
            <aside class="sidebar">
            <a href="${root.album == null ? '#': root.album.url}" class="sidebar__album info-item">
                <div class="info-item__image">
                    <img src="${root.album == null ? root.header_image_thumbnail_url: root.album.cover_art_url}" alt="${root.album == null ? root.title_with_featured: root.album.full_title}">
                </div>
                <h3 data-readable class="info-item__heading">${root.album == null ? root.title_with_featured: root.album.full_title}</h3>
                <button data-readable href="#" class="info-item__button">
                    View on Genius >
                </button>
            </a>
            <a href="${root.primary_artist.url}}" class="sidebar__album info-item">
                <div class="info-item__image">
                    <img src="${root.primary_artist.image_url}" alt="${root.primary_artist.name}">
                </div>
                <h3 data-readable class="info-item__heading">${root.primary_artist.name}</h3>
                <button data-readable href="#" class="info-item__button">
                    View on Genius >
                </button>
            </a>
            <a href="${youtubeVideo[0].url}" class="sidebar__album info-item">
                <div class="info-item__image">
                    <img src="${root.song_art_image_url}">
                </div>
                <h3 data-readable class="info-item__heading">Music video</h3>
                <button data-readable href="#" class="info-item__button info-item__button_youtube">
                    <img src="./img/youtube.svg" alt="Watch on youtube">
                </button>
            </a>
            <div class="credentials">
                <p class="credentials__paragraph">Website and all its content are based on <a href="#">Genius API</a>
                </p>
                <p class="credentials__paragraph">Thanks <a href="#">genius.com!!!</a></p>
                <span class="credentials__paragraph">© Copyright SimpleLyrics.io 2022</p>
            </div>
            </aside>
            `
            upgradeLyrics()
            closeSearchModal()
        }).catch(err => printError(err, container))

    }

    const linkEvent = e => {
        e.preventDefault()
        const elem = e.target.closest('.result')
        findLyrics(elem.getAttribute('href'), elem.getAttribute('data-songid'))
    }


    const search = async query => {
        loading(searchResults)
        const s = fetch(`http://localhost:3000/search?q=${query}`, {method: 'GET'}).then(res => {
        if (res.ok) {
            return res.json()
        } else {
            throw Error('Server did not respond')
        }
    })  
    .then(res => {
        res.forEach(item => {
            const resultElement = document.createElement('a')
            resultElement.setAttribute('href', item.result.url)
            resultElement.setAttribute('data-songid', item.result.id)
            resultElement.classList.add('header__result', 'result')
            resultElement.innerHTML = `
                    <div class="result__image"><img src="${item.result.song_art_image_thumbnail_url}" alt="kizaru"></div>
                    <div class="result__info">
                        <h6 class="result__name">
                            ${item.result.title_with_featured}
                        </h6>
                        <h6 class="result__author">
                            ${item.result.artist_names}
                        </h6>
                        <h6 class="result__album">
                            ${item.result.pyongs_count}
                        </h6>
                    </div>

            `
            resultElement.addEventListener('click', linkEvent)
            searchResults.appendChild(resultElement) 
        })
    }).then(res => loaded(searchResults)).catch(error => printError(error, searchResults))
}


    searchInput.forEach(input => {
        input.addEventListener('click', e => {
            searchResults.classList.add('open')
        })
        input.addEventListener('keyup', e => {
            if (e.keyCode == 13) {
                searchResults.classList.add('open')
            }
        })
    })

    submitBtn.addEventListener('click', e => {
        e.preventDefault()
        clearSearch()
        if (getComputedStyle(searchInput[0]).display !== 'none') {
            if (searchInput[0].value !== '') {
                if (!searchResults.classList.contains('open')) {
                    searchResults.classList.toggle('open')
                }
                search(searchInput[0].value)
            } else {
                confirm('You have not typed anything to search')
            }
        } else {
            if (searchInput[1].value !== '') {
                if (!searchResults.classList.contains('open')) {
                    searchResults.classList.toggle('open')
                }
                search(searchInput[1].value)
            } else {
                confirm('You have not typed anything to search')
            }
        }
    })

    searchButton.addEventListener('click', () => {
        searchModal.classList.toggle('open')
        submitBtn.classList.toggle('open')
    })

    document.addEventListener('click', e => {
        if (e.target.getAttribute('data-notclose') == null) {
            searchResults.classList.remove('open')
        }
    })
})
