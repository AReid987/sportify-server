const express = require('express');
const router = express.Router();

// initialization
const app = express();
 
// Routes
app.get('/', (req, res) => {
  res
    .status(200)
    .send('Hello server is running!')
    .end();
});
 
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

require('dotenv').config();
const cronJob = require('node-cron');
const SportsAPI = require('./sports');
const EventsAPI = require('./events');
const ScoresAPI = require('./scores');
const prisma = require('../prisma.js');
const https = require("https");
const { DateTime } = require("luxon");

// keep alive on heroku
setInterval(function() {
    https.get("https://fast-fjord-85839.herokuapp.com/");
}, 300000); // every 5 minutes (300000)

const sportKeysWithScores = ['americanfootball_ncaaf', 'americanfootball_nfl', 'aussierules_afl', 'baseball_mlb', 'basketball_nba', 'basketball_wnba', 'basketball_ncaab', 'icehockey_nhl', 'rugbyleague_nrl', 'soccer_epl', 'soccer_france_ligue_one', 'soccer_germany_bundesliga', 'soccer_italy_serie_a', 'soccer_spain_la_liga' ]

const asyncFetchSports = async () => {
  // find sports in supabase db
  const findManySports = await prisma.sport.findMany()
  // get sports from the odds API
  const response = await SportsAPI.getSports()
  
  // // remove futures from response data
  // const filteredResponse =  await response.data.filter(sport => !sport.key.includes("winner"))
  // remove sports without scores
  const filteredResponse = await response.data.filter(sport => sportKeysWithScores.includes(sport.key))

  // find or create sports in supabase
  const upsertManySports = filteredResponse.map((sport) =>
  prisma.sport.upsert({
    where: { key: sport.key },
    update: {},
    create: {
      key: sport.key,
      title: sport.title
    },
  }),
  );
  
  Promise.all(upsertManySports) 
} 
// asyncFetchSports()

const asyncFetchEvents = (sport_key) => {
  const response = EventsAPI.getEvents(sport_key)
}

const asyncCalculateWinners = (sport_key) => {
  const response = ScoresAPI.getScores(sport_key)
  
}

const fetchEventsWithBets = async () => {
  const nowTime = DateTime.utc()
  const oneDayAgo = DateTime.utc().minus({ days: 1 })

  const events = await prisma.event.findMany({
    where: {
      AND: [
        { 
          commenceTime: {
            lte: nowTime.toISO(),
          },
        },
        {
          commenceTime: {
            gte: oneDayAgo.toISO(),
          },
        },
      ],
      // bets: {
      //   some: {}
      // }
    },
    include: {
      bets: true,
      sport: true
    }
  })
  console.log(events)
  const sportKeys = events.map((event) => {
    return event.sport.key
  })
  console.log(sportKeys)
  // sportKeys.forEach((sportKey) => {
  //   ScoresAPI.getScores(sportKey)
  // })
}
// fetchEventsWithBets()

const fetchEventsDB = async () => {
  const sports = await prisma.sport.findMany()
  // const firstSport = sports[0]
  // const events = asyncFetchEvents(firstSport.key)

  // const eventWinners = asyncCalculateWinners(firstSport.key) 
  const fetchSportEvents = sports.map((sport, i) => {
    setTimeout(() => {
      const events = asyncFetchEvents(sport.key)
    }, i * 1000)
  })
  
  // console.log(fetchSportEvents)
  Promise.all(fetchSportEvents)
}
// fetchEventsDB()

const asyncFetchScores = async () => {
  ScoresAPI.getScores()
}
// asyncFetchScores()

// Schedule tasks to be run on the server.
// runs once per day at midnight
cronJob.schedule('0 0 * * *', () => {
  console.log('running a task every day');
  asyncFetchSports()
});
cronJob.schedule('0 0 * * *', () => {
  console.log('running a task every day');
  // asyncFetchSports()
  fetchEventsDB()
});
