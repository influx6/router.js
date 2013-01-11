var r = require('../builds/router');
midwares = r.Middleware,
router = r.RouterWare(r.R),
server = require('http').createServer(),
app = router.Router(server);


r.InitWare();

app.use(function(req,res,next){
	if(req.rawbody) return next();
	req.setEncoding('utf8');
	req.rawbody = true;
	var raw = [''];
	req.on('error',function(err){	return next(err); });
	req.on('data',function(chunk){	raw.push(chunk); });
	req.on('end',function(){ req.rawbody = raw; console.log(req.rawbody); return next(); });

});

app.use(midwares.Logger({ immediate: false}));
app.use(midwares.BodyParser());
app.use('/public/*',midwares.FileServer(__dirname,{ redirect: true}));
app.use(midwares.Query());

app.use(function(err,req,res,next){
	if(err){
		var stack = (err && err.stack) ? err.stack : '';
		res.setStatus(404).pushHead();
		res.write('Not Found Buddy!\n');
		res.end(stack);
		req.destroy();
	}
});

app.get("/",function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end("welcome to root");
	return next();
});

app.use('/admins',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end("welcome to central admin");
	return next();
});

app.use('/admins/create',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end('welcome ,lets create your admin');
	return next();
});

app.use('/admin/:id',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end('welcome admin with id:'+ req.params.id);
	return next();
});

app.use('/admin/:id/:country',function(req,res,next){
	res.setStatus(200).setContent('text/plain').pushHead();
	res.end('welcome admin with id:'+req.params.id+' and country:'+req.params.country);
	return next();
});

app.use('/a/:id',function(req,res,next){
	res.setStatus(200).setContent('text/plain')
	.addHeader('location','http://127.0.0.1:3000/admin/'+ req.params.id).pushHead();
	res.end('you are being redirect');
	return next();
});

app.listen(3000);