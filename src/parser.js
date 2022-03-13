const { parse } = require('node-html-parser')


const parseLyrics = songHtml => {
    if (songHtml) {
        const root = parse(songHtml)
        const lyrics = root.querySelectorAll('[data-lyrics-container]').toString()
        return lyrics
    } else {
        console.log('Parse error occured')
        return
    }
}

module.exports = parseLyrics



