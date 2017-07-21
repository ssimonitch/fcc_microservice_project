const db = require('../db');
const isUrl = require('is-url');
const moment = require('moment');
const platform = require('platform');

const utils = require('../utils/base36');

module.exports = {

  // TIMESTAMP CONTROLLER
  timestamp (req, res) {
    // grab date from body for POST
    // decode URI and extract path string for GET
    const date = req.body.date || decodeURI(req.url).split('/')[3];

    if (!date) {
      return res.status(422).send({ message: 'Must provide date'});
    }

    if (moment.unix(date).isValid()) {
      const unix = moment.unix(date).format('X');
      const natural = moment.unix(date).format('MMM D, YYYY');

      return res.status(200).send({ unix, natural});
    } else if (moment(date).isValid()) {
      const unix = moment(date).unix();
      const natural = moment(date).format('MMM D, YYYY');

      return res.status(200).send({ unix, natural });
    } else {

      return res.status(422).send({ unix: null, natural: null });
    }
  },

  // HEADER PARSER CONTROLLER
  headerParser (req, res) {
    const ipaddress = req.headers['x-forwarded-for'].split(',')[0];
    const language = req.headers['accept-language'].split(',')[0];
    const software = platform.parse(req.headers['user-agent']).description;

    return res.status(200).send({ ipaddress, language, software });
  },

  // URL SHORTENER CONTROLLER
  urlShortener (req, res) {
    // grab long url from request body or URI
    const long_url = req.body.url || decodeURI(req.url).split('/api/shorten/')[1];

    // validate
    if (!isUrl(long_url)) {
      return res.status(422).send({ error: 'Must provide valid url'});
    }

    const date = moment().format();

    ( async () => {
      // create new row with id
      const { rows: [{id}] } = await db.query(`
        INSERT INTO urls(created_at, last_access_at, long_url)
        VALUES($1, $2, $3)
        RETURNING id
      `, [date, date, long_url]);

      // generate short_url from id
      const short_url = utils.encode(id);

      // insert short_url into row
      await db.query('UPDATE urls SET short_url=$1 WHERE id=$2', [short_url, id]);

      // return short_url
      return res.status(200).send({ 'original_url': long_url, short_url });
    })().catch(error => console.log(error));
  },

  // redirects the visitor to their original URL given the sort URL
  urlRouter (req, res) {
    const short_url = req.params.encoded_url;

    ( async () => {
      // validate
      const { rows: [{exists}] } = await db.query(`
        SELECT EXISTS(SELECT 1 FROM urls WHERE short_url=$1)
      `, [short_url]);

      if (!exists) {
        return res.status(404).send({error: 'Not found'});
      }

      // retrieve long_url
      const { rows: [{long_url}] } = await db.query(`
        SELECT long_url FROM urls WHERE short_url=$1
      `, [short_url]);

      res.redirect(301, long_url);
    })().catch(error => console.log(error));
  }
};
