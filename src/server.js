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

require('dotenv').config()
const SportsAPI = require('./sports')

const asyncApiCall = async () => {
  const response = await SportsAPI.getSports()
  const filteredResponse =  response.data.filter(sport => !sport.key.includes("winner"))
  console.log(filteredResponse)
}

asyncApiCall()
