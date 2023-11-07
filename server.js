// Import modules
const express = require('express');
const Football = require('./football'); // Import the model
require('./db'); // Import the database connection

// Create the app
const app = express();

// Use JSON middleware
app.use(express.json());

// Define the routes
// Add a new document
app.post('/fooot/footballs', async (req, res) => {
  try {
    // Validate the request body
    const { team, gamesPlayed, win, draw, loss, goalsFor, goalsAgainst, points, year } = req.body;
    if (!team || !gamesPlayed || !win || !draw || !loss || !goalsFor || !goalsAgainst || !points || !year) {
      return res.status(400).send('Missing or invalid data');
    }

    // Create a new document
    const football = new Football({
      team,
      gamesPlayed,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      points,
      year
    });

    // Save the document
    await football.save();

    // Send the response
    res.status(201).send(football);
  } catch (err) {
    // Handle errors
    res.status(500).send(err.message);
  }
});

// Update a document by team name
app.put('/fooot/footballs/:team', async (req, res) => {
  try {
    // Get the team name from the params
    const { team } = req.params;

    // Get the updated data from the body
    const { gamesPlayed, win, draw, loss, goalsFor, goalsAgainst, points, year } = req.body;

    // Find and update the document
    const football = await Football.findOneAndUpdate({ team }, {
      gamesPlayed,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      points,
      year
    }, { new: true });

    // Check if the document exists
    if (!football) {
      return res.status(404).send('Team not found');
    }

    // Send the response
    res.status(200).send(football);
  } catch (err) {
    // Handle errors
    res.status(500).send(err.message);
  }
});

// Delete a document by team name
app.delete('/fooot/footballs/:team', async (req, res) => {
  try {
    // Get the team name from the params
    const { team } = req.params;

    // Find and delete the document
    const football = await Football.findOneAndDelete({ team });

    // Check if the document exists
    if (!football) {
      return res.status(404).send('Team not found');
    }

    // Send the response
    res.status(200).send(football);
  } catch (err) {
    // Handle errors
    res.status(500).send(err.message);
  }
});

// Get the total games played, draw and won for a given year
app.get('/fooot/footballs/year/:year', async (req, res) => {
  try {
    // Get the year from the params
    const { year } = req.params;

    // Convert the year to a number
    const yearNum = Number(year);

    // Check if the year is valid
    if (isNaN(yearNum)) {
      return res.status(400).send('Invalid year');
    }

    // Aggregate the documents by year
    const result = await Football.aggregate([
      { $match: { year: yearNum } }, // Filter by year
      { $group: { // Group by year
        _id: '$year',
        totalGamesPlayed: { $sum: '$gamesPlayed' },
        totalDraw: { $sum: '$draw' },
        totalWin: { $sum: '$win' }
      }}
    ]);

    // Check if the result is empty
    if (result.length === 0) {
      return res.status(404).send('No data for this year');
    }

    // Send the response
    res.status(200).send(result[0]);
  } catch (err) {
    // Handle errors
    res.status(500).send(err.message);
  }
});

// Get the first 10 documents where win is greater than a given value
app.get('/fooot/footballs/win/:value', async (req, res) => {
  try {
    // Get the value from the params
    const { value } = req.params;

    // Convert the value to a number
    const valueNum = Number(value);

    // Check if the value is valid
    if (isNaN(valueNum)) {
      return res.status(400).send('Invalid value');
    }

    // Find the documents
    const result = await Football.find({ win: { $gt: valueNum } }).limit(10);

    // Check if the result is empty
    if (result.length === 0) {
      return res.status(404).send('No data for this value');
    }

    // Send the response
    res.status(200).send(result);
  } catch (err) {
    // Handle errors
    res.status(500).send(err.message);
  }
});

// Get the documents where the average goals for is equal to a given value for a given year
app.get('/fooot/footballs/goalsFor/:value/year/:year', async (req, res) => {
  try {
    // Get the value and year from the params
    const { value, year } = req.params;

    // Convert the value and year to numbers
    const valueNum = Number(value);
    const yearNum = Number(year);

    // Check if the value and year are valid
    if (isNaN(valueNum) || isNaN(yearNum)) {
      return res.status(400).send('Invalid value or year');
    }

    // Aggregate the documents by year and team
    const result = await Football.aggregate([
      { $match: { year: yearNum } }, // Filter by year
      { $group: { // Group by year and team
        _id: { year: '$year', team: '$team' },
        avgGoalsFor: { $avg: '$goalsFor' }
      }},
      { $match: { avgGoalsFor: valueNum } } // Filter by average goals for
    ]);

    // Check if the result is empty
    if (result.length === 0) {
      return res.status(404).send('No data for this value and year');
    }

    // Send the response
    res.status(200).send(result);
  } catch (err) {
    // Handle errors
    res.status(500).send(err.message);
  }
});


app.get('/fooot/footballs', async (req, res) => {
    try {
      const footballs = await Football.find();
      res.status(200).send(footballs);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  


// Run the server
const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`Server running on port ${port}`));
