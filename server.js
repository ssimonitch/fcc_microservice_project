const morgan = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const router = require('./routes/');

// middleware
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(bodyParser.json({ type: '*/*'}));

// routes
router(app);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
