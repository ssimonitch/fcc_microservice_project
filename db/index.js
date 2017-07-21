const { Pool } = require('pg');

const conString = 'postgres://cxanwcal:Nkz_Nw_9BSMhtMjrFIU9W3737CWl05ui@pellefant.db.elephantsql.com:5432/cxanwcal';

const pool = new Pool({
  connectionString: conString
});

// provide pool query globally
module.exports = {
  query: (text, params) => pool.query(text, params)
};
