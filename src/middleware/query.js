;var qs = require('querystring'),
url = require('url');

module.exports.Query = function query(options){
  return function query(req, res, next){
    if (!req.query) {
      req.query = ~req.url.indexOf('?')
        ? qs.parse(url.parse(req.url).query)
        : {};
    }
    next();
  };
};