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
      'X-RapidAPI-Key': '102c88412fmsh95df86356914b45p11ac83jsn4d4f5d98dd2d',
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
