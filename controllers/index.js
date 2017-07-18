const moment = require('moment');

module.exports = {
  
  convertUnix(req, res) {
    const date = req.body.date;
    
    if (moment.unix(date).isValid)
    
    res.status(200).send({ message: 'This is a test' });
  }
  
}