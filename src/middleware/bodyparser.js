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

