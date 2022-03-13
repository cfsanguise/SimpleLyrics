const request = require('request-promise')

const search = query => {
    const options = {
        url: `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
        headers: {
            'User-Agent': 'request',
            'Authorization': 'Bearer eFh90zLu-TvE3DFh4rjNWGsLYDszasanfeMFDLb1LnRfmnwL72qsY8pxGfF1zjRc'
        }
    }
    
    return request(options)
}

module.exports = search