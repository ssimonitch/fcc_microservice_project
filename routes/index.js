const controller = require('../controllers');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.status(200).send({
      message: 'API test'
    });
  });
  
  
}