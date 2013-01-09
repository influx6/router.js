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