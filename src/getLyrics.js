const res = require('express/lib/response')
const request = require('request-promise')
const parser = require('./parser')

const getLyrics = url => {
    return request(url).then(res => parser(res))
}

module.exports = getLyrics