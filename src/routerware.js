;var routerware = (function(R){

	var ts = require('ts').ToolStack,
	util = ts.Utility,
	url = require('url'),
	getr = /^get$|^head$/,postr = /^post$|^put$|^delete$/,
	r = R, Ware = {};
	

	Ware.Generate = function(notfoundhandler){

		if(!notfoundhandler) notfoundhandler = function(err,req,res){
			var status = (err && err.status) ? err.status : 404;
			var message = (err && err.message) ? err.message  : "Request Not Found!";

			res.writeHead(status,{ 'content-type':'text/plain'});
			res.end(message);
			req.destroy();
		};

		var ware = ts.Middleware(function(key){
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

		return ware;
	};

	Ware.Router = function(server,notfound){
		var routerware = Ware.Generate()(notfound);
		routerware.server = server;

		//helper functions to easier readability and scope
		routerware.get = function(mount,response){
			routerware.use(mount,function(req,res,next){
				if(req.method.toLowerCase().match(getr)){
					return response.call(this,req,res,next);
				}else return next();
			});
		};

		routerware.post = function(mount,response){
			routerware.use(mount,function(req,res,next){
				if(req.method.toLowerCase().match(postr)){
					return response.call(this,req,res,next);
				}else return next();
			});
		};

		// routerware.put = function(mount,response){
		// 	routerware.use(mount,function(req,res,next){
		// 		if(req.method.toLowerCase().match(postr)){
		// 			return response.call(this,req,res,next);
		// 		}else return next();
		// 	});
		// };


		// routerware.delete = function(mount,response){
		// 	routerware.use(mount,function(req,res,next){
		// 		if(req.method.toLowerCase().match(postr)){
		// 			return response.call(this,req,res,next);
		// 		}else return next();
		// 	});
		// };

		//setup links for startup;
		routerware.server.on('request',routerware.start);
		routerware.listen = function(port,ip,onConnect){
			return routerware.server.listen(port,ip,onConnect);
		};

		return routerware;
	};

	return Ware;


	// appware = router();

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


