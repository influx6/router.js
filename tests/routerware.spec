var r = require('../builds/router'),
 midwares = require('../builds/middlewares'),
 ts = require('../builds/toolstack').ToolStack,
 router = r.RouterWare(ts,r.R,require('url'))(),
 parser = midwares.BodyParser(ts.Utility,require('querystring'));
 ware = router();

// ware.use(function(req,res,next){
// 	var data = [''];
// 	req.on('error',function(err){	return next(err); });
// 	req.on('data',function(chunk){	data.push(chunk); });
// 	req.on('end',function(){ req.rawbody = data; next(); });
// });

ware.use(parser);

ware.use("/",function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end("welcome to root");
	console.log('gotten data',req.rawbody,req.body,req.origdata);
	return next();
});

ware.use('/admins',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end("welcome to central admin");
	console.log('gotten data',req.rawbody,req.body,req.origdata);
	return next();
});

ware.use('/admins/:id',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end('wecome admin with id:');
	return next();
});

ware.use('/admins/:id/:country',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end('wecome admin with id and country:');
	return next();
});

ware.use('/a/1',function(req,res,next){
	res.writeHead(302,{ 
		'content-type':'text/plain',
		'location':'http://127.0.0.1:3000/admins/1'
	});
	res.end('wecome admin with id:');
	return next();
});

// console.log(ware.stack.first);

server = require('http').createServer(ware.start);
server.listen(3000);