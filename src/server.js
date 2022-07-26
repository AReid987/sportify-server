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

require('dotenv').config()
const SportsAPI = require('./sports')
const prisma = require('../prisma.js')

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
asyncFetchSports()
