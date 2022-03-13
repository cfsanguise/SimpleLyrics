const request = require('request-promise')

const getSongInfo = id => {
    const options = {
        url: `https://api.genius.com/songs/${id}`,
        headers: {
            'User-Agent': 'request',
            'Authorization': 'Bearer eFh90zLu-TvE3DFh4rjNWGsLYDszasanfeMFDLb1LnRfmnwL72qsY8pxGfF1zjRc'
        }
    }

    return request(options, (req, res, body) => {
        return body
    }).catch(err => console.log(err, 'kaboom kovalski'))
}

module.exports = getSongInfo