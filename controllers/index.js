const moment = require('moment');

module.exports = {
  
  convertUnix(req, res) {
    const date = req.body.date;
    
    if (!date) {
      return res.status(422).send({ message: 'Must provide date'});
    }
    
    const unix = moment.unix(date);
    const natural = moment(date).format('MMM Do, ')
    
    if (moment.unix(date).isValid()) {
      return res.status(200).send({ message: 'Valid timestamp' });
    } else if (moment(date).isValid()) {
      return res.status(200).send({ message: 'Valid date' });
    } else {
      return res.status(422).send({ message: 'Not a valid date format'});
    }
  }
}