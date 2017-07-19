const moment = require('moment');
const platform = require('platform');

module.exports = {
  
  timestamp(req, res) {
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
  
  headerParser(req, res) {
    const ipaddress = req.headers["x-forwarded-for"].split(",")[0];
    const language = req.headers["accept-language"].split(",")[0];
    const software = platform.os;
    
    return res.status(200).send({ ipaddress, language, software })
  }
}