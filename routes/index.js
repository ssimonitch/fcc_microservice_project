const controller = require('../controllers');

module.exports = (app) => {
  
  app.get('/', (request, response) => {
    response.sendFile('index.html', {root: __dirname + '/../views'});
  });
  
  app.get('/api', (req, res) => {
    res.status(200).send({
      message: 'API test'
    });
  });
  
  app.post('/time', controller.convertUnix);
  
  app.get('*', (req, res) => res.status(404).send({
  message: 'Not found'
}))
}