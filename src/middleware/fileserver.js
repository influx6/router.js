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

};