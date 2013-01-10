var r = require('../builds/router');
midwares = r.Middleware,
rware = r.RouterWare(r.R)(),

ware = rware();


ware.use(function(req,res,next){
	if(req.rawbody) return next();
	req.setEncoding('utf8');
	req.rawbody = true;
	var raw = [''];
	req.on('error',function(err){	return next(err); });
	req.on('data',function(chunk){	raw.push(chunk); });
	req.on('end',function(){ req.rawbody = raw; console.log(req.rawbody); return next(); });

});

ware.use(logger({ immediate: false}));
ware.use(bparser());
ware.use('/public/*',fserver(__dirname,{ redirect: true, log: ts.Console.init('web') }));
ware.use(midwares.Query())
ware.use(function(err,req,res,next){
	if(err){
		var stack = (err && err.stack) ? err.stack : '';
		res.setStatus(404).pushHead();
		res.write('Not Found Buddy!\n');
		res.end(stack);
		req.destroy();
	}
});

ware.use("/",function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end("welcome to root");
	return next();
});

ware.use('/admins',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end("welcome to central admin");
	return next();
});

ware.use('/admins/create',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end('welcome ,lets create your admin');
	return next();
});

ware.use('/admin/:id',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end('welcome admin with id:'+ req.params.id);
	return next();
});

ware.use('/admin/:id/:country',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end('welcome admin with id:'+req.params.id+' and country:'+req.params.country);
	return next();
});

ware.use('/a/:id',function(req,res,next){
	res.setStatus(200).setContent('text/plain')
	.addHeader('location','http://127.0.0.1:3000/admin/'+ req.params.id).pushHead();
	res.end('you are being redirect');
	return next();
});

server = require('http').createServer(ware.start);
server.listen(3000);