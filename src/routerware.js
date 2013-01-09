module.exports.RouterWare = (function(toolstack,R,url){

	var ts = toolstack,
	util = ts.Utility,
	url = url,
	r = R;

	return function(notfoundhandler){

		if(!notfoundhandler) notfoundhandler = function(req,res){
			res.writeHead(404,{ 'content-type':'text/plain'});
			res.end('Request not found!');
			req.destroy();
		};

		return ts.Middleware(function(key){
			if(!key){
				var route = /\*/; route.binding = '*';
				return route;
			}
			var open = key[key.length - 1] === '*' ? true : false;
			var procs = r.processMount(key,open);
			var route = procs.mount;
			route.params = procs.params;
			route.setsplit = procs.split;
			route.binding = key;

			return route;

		},function(key,req,res){

			req.originalUrl = req.url;
			req.params = req.params || {};
			req.res = res;
			res.req = req;

			var path = url.parse(req.url),pathname = decodeURIComponent(path.pathname);
			pathname = pathname.replace(/\/+$/,'/'); path.pathname = pathname;
			if('/' === pathname[pathname.length - 1] && pathname.length > 1) pathname = pathname.slice(0,-1);
			if(key.test(pathname) || key.test('*')){
				var clean = pathname.split('/');
				req.params = r.params(key.setsplit,util.makeSplice(clean,1,clean.length));
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


