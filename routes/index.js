const db = require('../db');
const controllers = require('../controllers');

module.exports = (app) => {

  app.get('/', (request, response) => {
    response.sendFile('index.html', {
      root: __dirname + '/../views'
    });
  });

  // API ENDPOINTS
  app.get('/api', (req, res) => {
    res.status(200).send({message: 'Please visit https://fierce-sociology.glitch.me/ for info'});
  });

  // TIMESTAMP MICROSERVICE
  app.get('/api/timestamp/*', controllers.timestamp);
  app.post('/api/timestamp', controllers.timestamp);

  // HEADER PARSER
  app.get('/api/whoami', controllers.headerParser);

  // URL SHORTENER
  app.get('/api/shorten/*', controllers.urlShortener);
  app.post('/api/shorten', controllers.urlShortener);
  app.get('/:encoded_url+', controllers.urlRouterStats);
  app.get('/:encoded_url', controllers.urlRouter);

  // IMAGE SERACH
  app.get('/api/imagesearch/*', controllers.imageSearch);

  // DB CHECK ROUTES
  app.get('/api/latest/shortener', async (req, res) => {
    const result = await db.query('SELECT * FROM urls');
    if (result.rowCount !== 0) {
      res.send(result.rows);
    } else {
      res.status(404).send({ error: 'Could not retrieve data' });
    }
  });

  app.get('/api/latest/imagesearch', async (req, res) => {
    const result = await db.query('SELECT created_at AS when, term FROM image_queries');
    if (result.rowCount !== 0) {
      res.send(result.rows);
    } else {
      res.status(404).send({ error: 'Could not retrieve data' });
    }
  });

  // 404 CATCH-ALL
  app.get('*', (req, res) => res.status(404).send({error: 'Not found'}));
};
