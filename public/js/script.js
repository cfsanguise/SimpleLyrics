'use strict'

document.addEventListener('DOMContentLoaded', () => {
    // Header
    const header = document.querySelector('.header')
    const searchForm = header.querySelector('#search-form')
    const searchSubmitBtn = searchForm.querySelector('.search__button img')
    const searchInput = searchForm.querySelector('.search')
    const searchResults = document.querySelector('.results')
    const content = document.querySelector('.content')
    const copyBtn = document.querySelector('#copy')
    const footer = document.querySelector('footer')
    const modal = document.querySelector('.modal')

    // Utilities

    const printError = (error, destination) => {
        const e = document.createElement('p')
        e.textContent = error
        e.classList.add('error')
        destination.innerHTML = ``
        destination.appendChild(e)
    }

    const loading = (destination, state) => {
        if (state == 'loading') {
            destination.innerHTML = ''
            const elem = document.createElement('img')
            elem.setAttribute('src', '/img/loading.gif')
            elem.classList.add('loading')
            destination.appendChild(elem)
        } else if (state == 'loaded') {
            destination.querySelector('.loading').remove()
        }
    }

    const clearSearch = () => {
        searchResults.querySelectorAll('a').forEach(item => {
            item.removeEventListener('click', linkEvent)
        })
        searchResults.innerHTML = ``
    }

    const linkEvent = e => {
        e.preventDefault()
        clearSearch()
        const elem = e.target.closest('.result')
        findLyrics(elem.getAttribute('href'), elem.getAttribute('data-songid'))
        footer.classList.add('open')
    }

    const copyLyricsToClipboard = (node) => {
        const clearSelection = () => {
            let sel;
            if ( (sel = document.selection) && sel.empty ) {
                sel.empty();
            } else {
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                var activeEl = document.activeElement;
                if (activeEl) {
                    var tagName = activeEl.nodeName.toLowerCase();
                    if ( tagName == "textarea" ||
                            (tagName == "input" && activeEl.type == "text") ) {
                        activeEl.selectionStart = activeEl.selectionEnd;
                    }
                }
            }
        }
        node = document.getElementById(node);
    
        if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
            document.execCommand('Copy')
            clearSelection()
            toggleModal('Text is copied to the clipboard')
        } else if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('Copy')
            clearSelection()
            toggleModal('Text is copied to the clipboard')
        } else {
            console.warn("Could not select text in node: Unsupported browser.");
        }
    }

    const toggleModal = text => {
        if (!modal.classList.contains('open')) {
            modal.classList.toggle('open')
            modal.textContent = text
            const close =  setTimeout(() => {
                modal.classList.toggle('open')
            }, 3000)
        }
    }

    const getYoutubeEmbed = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
    
        return (match && match[2].length === 11)
          ? match[2]
          : null;
    }

    const startRotateAnimation = () => {
        searchSubmitBtn.setAttribute('src', '/img/search_active.svg')
        searchSubmitBtn.classList.add('animation')
    }

    const stopRotateAnimation = () => {
        searchSubmitBtn.setAttribute('src', '/img/search.svg')
        searchSubmitBtn.classList.remove('animation')
    }
    
    // Hard functions

    const render = (target, destination, type) => {
        if (type == 'search results') {
            target.forEach(item => {
                const resultElement = document.createElement('a')
                resultElement.setAttribute('href', item.result.url)
                resultElement.setAttribute('data-songid', item.result.id)
                resultElement.classList.add('result')
                resultElement.innerHTML = `
                    <div class="result__image">
                        <img src="${item.result.song_art_image_thumbnail_url}" alt="${item.result.title_with_featured}">
                    </div>
                    <h3 class="result__name">
                        ${item.result.title_with_featured}
                    </h3>
                    <h4 class="result__author">
                        ${item.result.artist_names}
                    </h4>
                    <div class="result__buttons">
                        <a class="result__button hexagon"  title="View on simplelyrics">
                            <img src="./img/view.png" alt="View on simplelyrics">
                        </a>
                        <a href="${item.result.url}" class="result__button hexagon"  title="View on genius">
                            <img src="./img/genius.png" alt="View on genius">
                        </a>
                    </div>
    
                `
                resultElement.addEventListener('click', linkEvent)
                destination.appendChild(resultElement) 
            })
        } else if (type == 'song') {
            const data = target.root.response.song
            const youtubeVideo = data.media.length !== 0 ? data.media.filter(items => items.provider == 'youtube')[0].url : '#'
            const lyrics = target.html
            destination.innerHTML = `
            <section class="song">
                <h2 class="title">
                    <span>Song</span>
                    <div class="title__line"></div>
                </h2>
            <div class="info">
                <div class="info__image">
                    <img src="${data.song_art_image_url}" alt="${data.artist__names}">
                </div>
                <h3 class="info__heading">
                ${data.title_with_featured}
                </h3>
                <h4 class="info__subheading">
                    ${data.artist_names}
                </h4>
                <h5 class="info__date">
                    ${data.release_date_for_display}
                </h5>
                <a href="${data.url !== null ? data.url: '#'}" class="info__button genius">
                    View on genius>> 
                    <img src="./img/genius.png" alt="View on genius">
                </a>
            </div>
        </section>
        <section class="lyrics">
            <h2 class="title">
                <span>Lyrics</span>
                <div class="title__line"></div>
            </h2>
            <article id="lyrics">
                ${lyrics}
                <div class="lyrics__buttons">
                <button class="lyrics__button hexagon" id="copy">
                    <img src="./img/copy.svg" alt="Copy to clipboard">
                </button>
                <span class="lyrics__tip">
                    - Click to copy
                </span>
            </div> 
            </article>
        </section>
        <section class="album">
            <h2 class="title">
                <span>Album</span>
                <div class="title__line"></div>
            </h2>
            <div class="info">
                <div class="info__image">
                    <img src="${data.album !== null ? data.album.cover_art_url: data.song_art_image_url}" alt="${data.album !== null ? data.album.name: data.title_with_featured}">
                </div>
                <h3 class="info__heading">
                    ${data.album !== null ? data.album.name: data.title_with_featured}
                </h3>
                <a href="${data.album !== null ? data.album.url: data.url}" class="info__button genius"}">
                    View on genius>> 
                    <img src="./img/genius.png" alt="View on genius">
                </a>
            </div>
        </section>
        <section class="author">
            <h2 class="title">
                <span>Author</span>
                <div class="title__line"></div>
            </h2>
            <div class="info">
                <div class="info__image">
                    <img src="${data.primary_artist.image_url}" alt="${data.primary_artist.name}">
                </div>
                <h3 class="info__heading">
                    ${data.primary_artist.name}
                </h3>
                <a href="${data.primary_artist.url}" class="info__button genius">
                    View on genius>> 
                    <img src="./img/genius.png" alt="View on genius">
                </a>
            </div>
        </section>
        <section class="video">
            <h2 class="title">
                <span>Video</span>
                <div class="title__line"></div>
            </h2>
            <div class="info">
                ${youtubeVideo == '#' ? 'Sorry, no video avalible for this song': `<iframe width="100%" height="auto" allowfullscreen="true"src="https://www.youtube.com/embed/${getYoutubeEmbed(youtubeVideo)}"></iframe>`}
            </div>
        </section>
            `
            document.querySelector('#copy').addEventListener('click', () => {
                copyLyricsToClipboard('lyrics')
            })
        }
    }

    const findLyrics = async (query, songid) => {
        loading(content, 'loading')
        fetch(`/lyrics?path=${query}&id=${songid}`, {method: 'GET'})
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw Error('Server did not respond')
            }
        })
        .then(async data => {
            const root = await JSON.parse(data.info)
            const html = data.html
            const result = {root, html}
            render(result, content, 'song')
        })
        .catch(error => printError(error, content))

    }

    const search = query => {
        clearSearch()
        startRotateAnimation()
        fetch(`/search?q=${query}`, {method: 'GET'}).then(res => {
        if (res.ok) {
            return res.json()
        } else {
            throw Error('Server did not respond')
        }
    }).then(res => render(res, searchResults, 'search results')).catch(error => printError(error, searchResults)).finally(() => stopRotateAnimation())
    }

    // Event listeners

    const listen = searchForm.addEventListener('submit', e => {
        e.preventDefault()
        header.classList.add('up')
        search(searchInput.value)
    })

})
