const moment = require('moment');

module.exports = {
  
  timestamp(req, res) {
    const date = req.body.date;
    
    if (!date) {
      return res.status(422).send({ message: 'Must provide date'});
    }
    
    if (moment.unix(date).isValid()) {
      const unix = moment(date).format('X');
      const natural = moment.unix(date).format('MMM D, YYYY');
      
      return res.status(200).send({ unix, natural});
    } else if (moment(date).isValid()) {
      const unix = moment(date).unix();
      const natural = moment(date).format('MMM D, YYYY');
      
      return res.status(200).send({ unix, natural });
    } else {
      
      return res.status(422).send({ unix: null, natural: null });
    }
  }
}