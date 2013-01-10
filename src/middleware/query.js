;var Middleware = module.exports.Middleware = module.exports.Middleware || {};
Middleware.Query = function QuerySetup(r){

  var qs = require('querystring'),url = require('url');

	return function QueryOptions(options){
		
	  return function Query(req, res, next){
	    if (!req.query) {
	      req.query = ~req.url.indexOf('?')
	        ? qs.parse(url.parse(req.url).query)
	        : {};
	    }
	    next();
	  };

	};

};