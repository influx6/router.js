var r = require('../builds/router'),
midwares = require('../builds/middlewares'),
ts = require('../builds/toolstack').ToolStack,
rutil = r.R(ts.Utility), 

qs = require('querystring'),url = require('url'),
fs = require('fs'), path = require('path'),
send = require('send'),

rware = r.RouterWare(ts,rutil,url,qs)(),
bparser = midwares.BodyParser(ts.Utility,rutil,qs),
fserver = midwares.FileServer(ts.Utility,rutil,fs,url,path,send),

ware = rware();

// ware.use(function(req,res,next){
// 	var data = [''];
// 	req.on('error',function(err){	return next(err); });
// 	req.on('data',function(chunk){	data.push(chunk); });
// 	req.on('end',function(){ req.rawbody = data; next(); });
// });

ware.use(bparser());
ware.use('/public/*',fserver(__dirname,{ redirect: true, log: ts.Console.init('web') }));
ware.use(midwares.Query())
ware.use(function(err,req,res,next){
	if(err){
		var stack = (err && err.stack) ? err.stack : '';
		res.writeHead(404);
		res.write('Not Found Buddy!\n');
		res.end(stack);
		req.destroy();
	}
});


ware.use("/",function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end("welcome to root");
	console.log('gotten data',req.body,req.socket,req.socket.remoteAddress,req.url);
	return next();
});

ware.use('/admins',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end("welcome to central admin");
	console.log('gotten data',req.body);
	return next();
});

ware.use('/admins/create',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end('welcome ,lets create your admin');
	return next();
});

ware.use('/admin/:id',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end('welcome admin with id:'+ req.params.id);
	return next();
});

ware.use('/admin/:id/:country',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end('welcome admin with id:'+req.params.id+' and country:'+req.params.country);
	return next();
});

ware.use('/a/:id',function(req,res,next){
	res.writeHead(302,{ 
		'content-type':'text/plain',
		'location':'http://127.0.0.1:3000/admin/'+ req.params.id
	});
	res.end('you are being redirect');
	return next();
});

server = require('http').createServer(ware.start);
server.listen(3000);