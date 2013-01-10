var url = require('url');

module.exports.Logger = function(ts,R){
	var Console = ts.Console.init('node'),
	util = ts.Utility, r = R;

	return function LoggerSetUp(options){

		var format = function(host,port,url,method,message){
			return util.makeString(" ",'Info'.grey, method.green,'Page',url.yellow,message,host.red,':'+port.red);
		};

		return function Logger(req,res,next){
			if(req._logged) return next();

			var host = req.socket.remoteAddress,
			port = req.socket.port,
			url = url.parse(req.url),
			method = req.method;

			var get = format(host,port,url.pathname,method,'request page from');
			var post = format(host,port,url.pathname,method,'posted message to');

			if(options.immediate){

			}else{

				var res_end = res.end;
				res.end = function(chunk,encoding){
					res.end = res_end;
					res.end(chunk,encoding);
					Console.log();

				}
			}
		};

	};
}