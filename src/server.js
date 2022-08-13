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
const prisma = require('../prisma.js');
const http = require("http");

// keep alive on heroku
setInterval(function() {
    http.get("https://fast-fjord-85839.herokuapp.com/");
}, 300000); // every 5 minutes (300000)

const asyncFetchSports = async () => {
  // find sports in supabase db
  const findManySports = await prisma.sport.findMany()
  // get sports from the odds API
  const response = await SportsAPI.getSports()
  // remove sports that are not in season
  // const result = findManySports.filter(sport1 => !response.data.some(sport2 => sport1.key === sport2.key))
  // const deleteManySports = result.map((sport) => 
  //   prisma.sport.delete({
  //     where: {
  //       key: sport.key,
  //     },
  //   })
  // )
  // Promise.all(deleteManySports)
  
  // remove futures from response data
  const filteredResponse =  await response.data.filter(sport => !sport.key.includes("winner"))
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
// Schedule tasks to be run on the server.
// runs once per day at midnight
cronJob.schedule('0 0 * * *', () => {
  console.log('running a task every day');
  asyncFetchSports()
});

const asyncFetchEvents = (sport_key) => {
  const response = EventsAPI.getEvents(sport_key)
}

const fetchEventsDB = async () => {
  const sports = await prisma.sport.findMany()
  // const firstSport = sports[0]
  // const events = asyncFetchEvents(firstSport.key)

  const fetchSportEvents = sports.map((sport, i) => {
    setTimeout(() => {
      const events = asyncFetchEvents(sport.key)
    }, i * 1000)
  })
  Promise.all(fetchSportEvents)
}

cronJob.schedule('0 0 * * *', () => {
  console.log('running a task every day');
  // asyncFetchSports()
  fetchEventsDB()
});



// asyncFetchEvents()