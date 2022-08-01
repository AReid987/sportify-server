// const express = require('express');
// const router = express.Router();

// // initialization
// const app = express();
 
// // Routes
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .send('Hello server is running!')
//     .end();
// });
 
// // Start the server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}`);
//   console.log('Press Ctrl+C to quit.');
// });

require('dotenv').config();
const cronJob = require('node-cron');
const SportsAPI = require('./sports');
const EventsAPI = require('./events');
const prisma = require('../prisma.js');


const asyncFetchSports = async () => {
  const response = await SportsAPI.getSports()
  const filteredResponse =  await response.data.filter(sport => !sport.key.includes("winner"))
  
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
cronJob.schedule('0 0 * * *', () => {
  console.log('running a task every day');
  asyncFetchSports()
});

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

const asyncFetchEvents = (sport_key) => {
  const response = EventsAPI.getEvents(sport_key)
}


// asyncFetchEvents()