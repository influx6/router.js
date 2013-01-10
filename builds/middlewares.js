module.exports.BodyParser = function(util,qs){

	var formidable = require('formidable');
	return function BodyParser(options) {
		
		return function(req,res,next){
			if(req._body) return next();

			req.body = req.body || {}; 
			req.files = req.files || {};


			if("get" === req.method.toLowerCase() || 'head' === req.method.toLowerCase()) return next();
			// if(req.headers['content-type'].split(';')[0] !== 'multipart/form-data') return next();

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

module.exports.FileServer = function(util,r,fs,url,path,send){

	return function(dir,options){

		var root = dir, settings = options;

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

};var url = require('url');

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
};var qs = require('querystring'),
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