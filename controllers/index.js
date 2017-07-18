const moment = require('moment');

module.exports = {
  
  timestamp(req, res) {
    // grab date from body if POST
    // decode URI and extract path 
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
  }
}