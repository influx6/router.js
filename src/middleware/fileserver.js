module.exports.FileServer = function(util,r,fs,url,path){

	return function(dir,options){

		var root = dir, settings = options;

		return function FileServer(req,res,next){
			if(req._servedFile) return next();

			if("get" !== req.method.toLowerCase() && 'head' !== req.method.toLowerCase()) return next();

			req._servedFile = true;

			var log = settings.log,uri = url.parse(req.url),
			pathname = decodeURIComponent(uri.pathname),
			loc = path.normalize(path.join(dir,pathname));


			var directory = function(path){
				//will redirect
			};

			fs.stat(loc,function(err,stat){
				if(err) return next(err);

				if(stat.isDirectory()) directory(path);
				else{
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