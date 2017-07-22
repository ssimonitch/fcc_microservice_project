const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || '3000';

// middleware
app.use(logger('dev'));
app.use(express.static('public'));
app.use(bodyParser.json({ type: '*/*'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
const router = require('./routes/');
router(app);

// listen for requests :)
const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
