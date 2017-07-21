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
      // validate link exists
      const { rows: [{exists}] } = await db.query(`
        SELECT EXISTS(SELECT 1 FROM urls WHERE short_url=$1)
      `, [short_url]);

      if (!exists) {
        return res.status(404).send({error: 'Not found'});
      }

      // retrieve long_url, update last_access_at and update count
      try {
        await db.query('BEGIN');

        const { rows: [{long_url}] } = await db.query(`
          SELECT long_url FROM urls WHERE short_url=$1;
        `, [short_url]);

        await db.query(`
          UPDATE urls SET last_access_at = CURRENT_TIMESTAMP WHERE short_url=$1
          `, [short_url]);

        await db.query(`
          UPDATE urls SET access_count = access_count + 1 WHERE short_url=$1
          `, [short_url]);

        await db.query('COMMIT');
        await res.redirect(301, long_url);
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    })().catch(error => console.log(error));
  },

  // git sum stats
  urlRouterStats (req, res, next) {
    if (req.params.encoded_url !== '+') {
      return next();
    }
    // grab the short_url from path
    const [ short_url ] = (/[^/+]+/gi).exec(req.path);

    ( async () => {
      // validate
      const { rows: [{exists}] } = await db.query(`
        SELECT EXISTS(SELECT 1 FROM urls WHERE short_url=$1)
      `, [short_url]);

      if (!exists) {
        return res.status(404).send({error: 'Not found'});
      }

      // create new row with id
      const { rows } = await db.query(`
        SELECT * FROM urls WHERE short_url=$1
      `, [short_url]);

      const payload = {
        created_at: moment(rows[0].createdAt).format('dddd, MMMM Do YYYY, h:mm:ss a'),
        long_url: rows[0].long_url,
        short_url: `${req.protocol}://${req.get('host')}/${rows[0].short_url}`,
        last_accessed_at: moment(rows[0].last_access_at).format('dddd, MMMM Do YYYY, h:mm:ss a'),
        access_count: rows[0].access_count
      };

      return res.status(200).send({ payload });
    })().catch(error => console.log(error));
  }
};
