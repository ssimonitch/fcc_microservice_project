const db = require('../db');
const isUrl = require('is-url');
const moment = require('moment');
const platform = require('platform');
const fetch = require('node-fetch');

const base36 = require('../utils/base36');
const helpers = require('../utils/helpers');

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
      const short_url = base36.encode(id);

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

      // don't cache so it rolls each time
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

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

        // RICK ROLL
        let roll = await Math.floor(Math.random() * 100) + 1;
        if (roll === 69) {
          console.log('Hold on to your butts');
          return res.redirect(301, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        }

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
  },

  // image search controller
  // API REF: https://msdn.microsoft.com/en-us/library/dn760791.aspx
  imageSearch (req, res) {
    // grab stuff
    const query = req.params[0].split(' ').join('+');
    const offset = req.query['offset'] || 1;

    if (!query) {
      return res.status(404).send({ error: 'invalid parameters'});
    }

    // set up query params
    const endpoint = 'https://api.cognitive.microsoft.com/bing/v5.0/images';
    const key = '0a5ac8d039a94cfdbf943c42f561b85d';
    const queryString = `/search?q=${query}&mkt=en-us&count=10&offset=${offset}`;
    const init = {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'multipart/form-data'
      }
    };

    // stop. it's query time.
    fetch(endpoint + queryString, init)
    .then(res => {
      return res.json();
    }).then(data => {
      let payload = [];

      // build array of objects for response
      data.value.forEach(image => {

        const imageUrl = helpers.parseSearchUrl(image.contentUrl);
        const webUrl = helpers.parseSearchUrl(image.contentUrl);

        // build object to send
        const object = {
          url: imageUrl,
          snippet: image.name,
          thumbnail: (image.thumbnailUrl).split('&pid=Api')[0],
          context: webUrl
        };
        payload.push(object);
      });

      res.status(200).send({ payload });
    }).then(() => {
      const date = moment().format();
      // log search in db
      return db.query('INSERT INTO image_queries(created_at, term) VALUES($1, $2)', [date, req.params[0]]);
    }).catch(error => console.log(error));
  },

  fileSize (req, res) {
    let { name, size, type, lastModified } = req.body;

    if (!size) {
      return res.status(404).send({ error: 'Invalid data'});
    }

    // size = helpers.formatBytes(size);
    lastModified = moment(lastModified).format();

    ( async () => {
      const { rows } = await db.query(`
        INSERT INTO file_data(file_name, file_size, file_type, lastModified)
        VALUES($1, $2, $3, $4)
        RETURNING id;
      `, [name, size, type, lastModified]);

      // reset cookie
      res.clearCookie('file_id');
      res.cookie('file_id', rows[0].id);
      return res.status(200).send({ file_size: size });
    })().catch(error => console.log(error));
  },

  fileResult (req, res) {
    const id = req.cookies.file_id;

    if (!id) {
      return req.send({error: 'Could not find file data'});
    }

    ( async () => {
      const result = await db.query('SELECT * FROM file_data WHERE id=$1', [id]);
      if (result.rowCount !== 0) {

        const payload = {
          name: result.rows[0].file_name,
          size: helpers.formatBytes(result.rows[0].file_size),
          type: result.rows[0].file_type,
          lastModified: moment(result.rows[0].lastModified).format()
        };

        return res.send( { file_data: payload });
      } else {
        return res.status(404).send({ error: 'Could not retrieve data' });
      }
    })().catch(error => console.log(error));
  }
};
