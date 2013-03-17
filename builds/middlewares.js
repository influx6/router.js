;var bodyparser = function BodyParserSetup(r){

	var util = require('ts').ToolStack.Utility, qs = require('querystring'),
	formidable = require('formidable');

	return function BodyParserOptions(options) {
		
		return function BodyParser(req,res,next){
			if(req._body) return next();

			req.body = req.body || {}; 
			req.files = req.files || {};


			if("get" === req.method.toLowerCase() || 'head' === req.method.toLowerCase()) return next();
			if(req.headers['content-type'].split(';')[0] !== 'multipart/form-data') return next();

			var done = false, proceed = next, 
			param = { data: {}, files: {}},
			form = new formidable.IncomingForm;

			function onData (name,val,store){
				if(util.isArray(store[name])){
					store[name].push(val);
				}else if(store[name]){
					store[name] = [store[name],val];
				}else{
					store[name] = val;
				}
			};

			req._body = true;

			form.on('field',function(name,value){
				onData(name,value,param.data);
			});

			form.on('file',function(name,value){
				onData(name,value,param.files);
			});

			form.on('error',function(err){
				if(err){ err.status = 400; return next(err); } 
				done = true;
			});

			form.on('end',function(err){
				if(done) return;
				try{
					req.body = param.data;
					req.files = param.files;
					req.origdata = param;
					next();
				}catch(e){ form.emit('error',e); }
			});

			form.parse(req);

			req.form = form;

			// next();

		};
	};

};

;var fileserver = function FileServerSetup(r){

	var util = require('ts').ToolStack.Utility, r = r,
	url = require('url'),path = require('path'), fs = require('fs');

	return function FileServerOptions(dir,options){

		var root = path.resolve(dir), settings = options;
		
		return function FileServer(req,res,next){
			if(req._servedFile) return next();

			if("get" !== req.method.toLowerCase() && 'head' !== req.method.toLowerCase()) return next();

			req._servedFile = true;

			var log = settings.log,uri = url.parse(req.url),
			pathname = decodeURIComponent(uri.pathname),
			loc = path.normalize(path.join(dir,pathname));


			if(!fs.existsSync(loc)){ 
				// res.writeHead(404); res.end();
				return next(r.error(404));
			} 


			var checkMaliciousnes = function(path){
				//check if it has '..' in it
				if(path.match(/\/\.\w+\W*\w*$/) || ( -1 !== path.indexOf('..'))){
					// res.writeHead(400); res.end();
					return next(r.error(400));
				}
			};

			var directory = function(path){
				return next();
			};

			fs.stat(loc,function(err,stat){
				if(err) return next(err);

				if(stat.isDirectory()) directory(path);
				else{

					checkMaliciousnes(pathname);

					var stream = fs.createReadStream(loc);
					stream.pipe(res);

					req.on('close', stream.destroy.bind(stream));
					
					stream.on('error',function(err){
						if(err){ req.destroy(); return; }
						err.status = 500;
						return next(err);
					});

					stream.on('end',function(){
						res.end();
						return next();
					})
				}
			});
			

			// log.log(util.makeString(" ",JSON.stringify(uri),pathname,loc));
			// return next();
		};
	};

};;var logger = function LoggerSetup(r){

	var ts = require('ts').ToolStack,
	Console = ts.Console.init('node'),
	url = require('url'),
	util = ts.Utility, r = r;

	return function LoggerOptions(options){

		var format = function(host,port,url,method,message,status){
			return util.makeString(" ",'Info:'.grey,('' + (util.isNumber(status) ? status : 304)).magenta,method.green,'Page'.grey,url.yellow,message.grey,host.magenta+':'+port.magenta,"on".grey,(new Date()).toUTCString().grey);
		};

		return function Logger(req,res,next){
			if(req._logged) return next();

			var host = req.socket.remoteAddress,
			port = req.headers.host.split(':')[1],
			pathname = url.parse(req.url).pathname,
			method = req.method;

			req._logged = true;

			function choice(state,status){
				if(state === 'get') return format(host,port,pathname,method,'requested from',status);
				if(state === 'post') return format(host,port,pathname,method,'posted message to',status);
				if(state === 'head') return format(host,port,pathname,method,'headers requested from',status);
			};
			

		
			var res_end = res.end;
			res.end = function(chunk,encoding){
				res.end = res_end;
				res.end(chunk,encoding);
				Console.log(choice(method.toLowerCase(),res.statusCode));
				return;
			};

			return next();
		};

	};
};var query = function QuerySetup(r){

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