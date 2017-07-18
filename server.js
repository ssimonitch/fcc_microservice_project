const morgan = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();

// middleware
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(bodyParser.json({ type: '*/*'}));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/", (request, response) => {
  response.sendStatus(200);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/", (request, response) => {
  response.sendStatus(200).send();
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
