const axios = require('axios');
const prisma = require('../prisma.js');


const createEvents = async (events, sport_key) => {
  const filteredEvents = await events.filter(event =>  event.bookmakers.length > 0) 
  const sport = await prisma.sport.findUnique({
    where: {
      key: sport_key
    }
  })
  const upsertManyEvents = filteredEvents.map((sportsEvent) => {
    const odds = sportsEvent.bookmakers[0]
    const homeTeam = odds.markets[0].outcomes.find(team => team.name === sportsEvent.home_team)
    const awayTeam = odds.markets[0].outcomes.find(team => team.name === sportsEvent.away_team)
    console.log('event: ', sportsEvent)
    console.log('home: ', homeTeam)
    console.log('away: ', awayTeam)
    const newEvent = prisma.event.upsert({
      where: { eventID: sportsEvent.id },
      update: {
        homePrice: homeTeam.price,
        homePoint: homeTeam.point,
        awayPrice: awayTeam.price,
        awayPoint: awayTeam.point,
      },
      create: {
        eventID: sportsEvent.id,
        sportKey: sportsEvent.sport_key,
        commenceTime: sportsEvent.commence_time,
        homeTeam: sportsEvent.home_team,
        awayTeam: sportsEvent.away_team,
        homePrice: homeTeam.price,
        homePoint: homeTeam.point,
        awayPrice: awayTeam.price,
        awayPoint: awayTeam.point,
        sport: {
          connect: {
            id: sport.id
          },
        },  
      },     
    })
    return newEvent
})
  Promise.all(upsertManyEvents)
}

const getEvents = async (sport_key) => {
  const BASE_URL = `https://odds.p.rapidapi.com/v4/sports/${sport_key}/odds`

  const options = {
    method: 'GET',
    url: BASE_URL,
    params: {
      regions: 'us', 
      oddsFormat: 'american', 
      markets: 'spreads', 
      dateFormat: 'iso'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'odds.p.rapidapi.com'
    },
  };

  await axios.request(options)
    .then( (response) => {
      createEvents(response.data, sport_key)
    }).catch(function (error) {
      console.error(error);
  });
  // try {
  //   const response = await axios({
  //     url: BASE_URL,
  //     method: 'GET',
  //     params: {
  //       regions: 'us', 
  //       oddsFormat: 'american', 
  //       markets: 'spreads', 
  //       dateFormat: 'iso'
  //     },
  //     headers: {
  //       'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  //       'X-RapidAPI-Host': 'odds.p.rapidapi.com',
  //     }
  //   }) 
  //   // console.log(response.data)
  // } catch (error) {
  //   console.log(error)
  // }
}

exports.getEvents = getEvents

// module.exports = {
//   getEvents: () => axios(options),
// }