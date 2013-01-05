module.exports.RouterWare = (function(toolstack,R,url){

	var ts = toolstack,
	util = ts.Utility,
	url = url,
	r = R(util);

	return function(notfoundhandler){

		if(!notfoundhandler) notfoundhandler = function(req,res){
			if(res._header);
			res.writeHead(404,{'Content-Type':'text/plain'});
			res.end('Request not found!');
		};

		return router = ts.Middleware(function(key){
			if(!key) key = "/";
			// if('/' === key[key.length - 1] && key.length > 1) key = key.slice(0,-1);
			var route = r.processMount(key).mount;
			route.binding = key;
			return route;

		},function(key,req,res){
			var path = url.parse(req.url);
			if(key.test(path.pathname) || key.test('/')) return true;
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


