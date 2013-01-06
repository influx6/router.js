module.exports.RouterWare = (function(toolstack,R,url){

	var ts = toolstack,
	util = ts.Utility,
	url = url,
	r = R(util);

	return function(notfoundhandler){

		if(!notfoundhandler) notfoundhandler = function(req,res){
			res.writeHead(404,{ 'content-type':'text/plain'});
			res.end('Request not found!');
		};

		return ts.Middleware(function(key){
			if(!key){
				var route = /\*/; route.binding = '*';
				return route;
			}
			var procs = r.processMount(key);
			var route = procs.mount;
			route.params = procs.params;
			route.setsplit = procs.split;
			route.binding = key;

			return route;

		},function(key,req,res){
			req.urlParams = req.urlParams || {};
			var path = url.parse(req.url),pathname = path.pathname;
			if('/' === pathname[pathname.length - 1] && pathname.length > 1) pathname = pathname.slice(0,-1);
			if(key.test(pathname) || key.test('*')){
				var clean = pathname.split('/');
				req.urlParams = r.params(key.setsplit,util.makeSplice(clean,1,clean.length));
				return true;
			}
			else return false;
		},notfoundhandler);

	};


	// appware = router();
	//appware.use(function(req,res,next){

	// });

	// appware.use('/admins',function(req,res,next){
	// 	console.log(req,res,next);
	// 	next();
	// });

	// appware.use('/admins/:id',function(req,res,next){
	// 	console.log("working:",req,res,next);
	// 	next('err');
	// });

	// appware.use('/admins/:id/country',function(req,res,next){
	// 	console.log(req,res,next);
	// 	next();
	// });

	// appware.use('/admins/:id/country/:state',function(req,res,next){
	// 	console.log(req,res,next);
	// 	next();
	// });

	// server.on('request',function(req,res){
	// 	var data = [''];
	// 	req.on('data',function(chunk){	data.push(chunk); });
	// 	req.on('end',function(){  req.body = data; appware.start(req,res); })
	// });

	// // console.log(appware.stack);
});


