var r = require('../builds/router');
var ware = r.RouterWare(require('../builds/toolstack').ToolStack,r.R,require('url'))()();

ware.use(function(req,res,next){
	var data = [''];
	req.on('error',function(err){	return next(err); });
	req.on('data',function(chunk){	data.push(chunk); });
	req.on('end',function(){ req.data = data; return next(); });
});
ware.use('/admins',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end("welcome to central admin");
	next();
});
ware.use('/admins/:id',function(req,res,next){
	res.writeHead(200,{ 'content-type':'text/plain'});
	res.end('wecome admin with id:');
	next('err');
});

console.log(ware);