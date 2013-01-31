;var Middleware = module.exports.Middleware = module.exports.Middleware || {};
Middleware.Logger = function LoggerSetup(r){

	var ts = require('ts').ToolStack,
	Console = ts.Console.init('node'),
	url = require('url'),
	util = ts.Utility, r = r;

	return function LoggerOptions(options){

		var format = function(host,port,url,method,message){
			return util.makeString(" ",'Info:'.grey,method.green,'Page'.grey,url.yellow,message.grey,host.magenta+':'+port.magenta,"on".grey,(new Date()).toUTCString().grey);
		};

		return function Logger(req,res,next){
			if(req._logged) return next();

			var host = req.socket.remoteAddress,
			port = req.headers.host.split(':')[1],
			pathname = url.parse(req.url).pathname,
			method = req.method;

			req._logged = true;

			function choice(state){
				if(state === 'get') return format(host,port,pathname,method,'requested from');
				if(state === 'post') return format(host,port,pathname,method,'posted message to');
				if(state === 'head') return format(host,port,pathname,method,'headers requested from');
			};
			

			if(options.immediate){
				Console.log(choice(method.toLowerCase()));
			}else{
				var res_end = res.end;
				res.end = function(chunk,encoding){
					res.end = res_end;
					res.end(chunk,encoding);
					Console.log(choice(method.toLowerCase()));
					return;
				};
			}

			return next();
		};

	};
}