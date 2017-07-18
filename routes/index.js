const controllers = require('../controllers');

module.exports = (app) => {
  
  app.get('/', (request, response) => {
    response.sendFile('index.html', {root: __dirname + '/../views'});
  });
  
  app.get('/api', (req, res) => {
    res.status(200).send({ message: 'Please visit https://fierce-sociology.glitch.me/ for info' });
  });
  
  app.post('/api/timestamp', controllers.timestamp);
  
  app.get('*', (req, res) => res.status(404).send({
  message: 'Not found'
}))
}