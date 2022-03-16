const fs = require('fs')
const express = require('express')
const getLyrics = require('./getLyrics')
const getSongInfo = require('./getSongInfo')
const path = require('path')
const search = require('./search')
const public = path.join(__dirname, '../public')
const html = path.join(public, '/index.html')
const pageDoesntExist = path.join(public, './404.html')

const server = express()
const port = process.env.PORT || 3000
server.use(express.static(public))

server.get('/', (req, res) => {
    res.sendFile(html)
})

server.get('/search', (req, res) => {
    const query = req.query.q
    const options = {
        url: `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
        headers: {
            'User-Agent': 'request',
            'Authorization': 'Bearer eFh90zLu-TvE3DFh4rjNWGsLYDszasanfeMFDLb1LnRfmnwL72qsY8pxGfF1zjRc'
        }
    }
    search(query).then(result => JSON.parse(result)).then(result => res.json(result.response.hits)).catch(error => res.status(500).send())
})

server.get('/lyrics', (req, res) => {
    const query = req.query.path
    const id = req.query.id
    getLyrics(query).then(result => getSongInfo(id).then(secondResult => res.send({html: result, info:secondResult}))).catch(error => res.status(500).send())
})

server.use((req, res, next) => {
    res.status(404).sendFile(pageDoesntExist)
})

server.listen(port, () => console.log('Server is running'))






