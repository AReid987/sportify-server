const axios = require('axios');
const { sport } = require('../prisma.js');
const prisma = require('../prisma.js');
const { DateTime } = require("luxon");

const findAllBets = async (scores) => {
  console.log('scores: ', scores)
}

const getScores = async (sport_key) => {
  const BASE_URL = `https://odds.p.rapidapi.com/v4/sports/${sport_key}/scores`
  
  const options = {
    method: 'GET',
    url: BASE_URL,
    params: {daysFrom: '3'},
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'odds.p.rapidapi.com'
    }
  };
  await axios.request(options)
    .then( (response) => {
      findAllBets(response.data)
    }).catch(function (error) {
      console.error(error);
  });
 

}

exports.getScores = getScores
