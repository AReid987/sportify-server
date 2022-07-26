const axios = require('axios');

const BASE_URL = `https://odds.p.rapidapi.com/v4/sports`

const options = {
  method: 'GET',
  url: BASE_URL,
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'odds.p.rapidapi.com'
  },
}

module.exports = {
  getSports: () => axios(options),
}