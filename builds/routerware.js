;var patch = (function(){

	var http = require('http'),
	response = http.ServerResponse.prototype,
	writeHead  = response.writeHead,
	renderHeaders = response._renderHeaders,
	setHeaders = response.setHeader;

	if(!response.routerPatch){ 

		//changing setheaders to allow more extra details
		response.preHeaders = {};

		response.setStatus = function(code){
			this.preHeaders.status = code;
			return this;
		};

		response.SetCookie = function(field,val){
			var fd = this.getHeader(field);
			var val = Array.isArray(fd) ? prev.concat(val) : [prev,val];
			this.preHeaders['set-cookie'] = val;
			return this;
		};

		response.setContent = function(type){
			var m = type + (this.charset ? ('; charset=' + this.charset): '');
			this.addHeader('content-type',m);
			return this;
		};

		response.addHeader = function(field,val){
			this.preHeaders[field] = val;
			return this;
		};

		response.pushHead = function(){
			var pre = this.preHeaders;
			var code = this.preHeaders.status;
			var frag = this.preHeaders;
			delete this.preHeaders.status;
			this.writeHead(code,frag);
			return this;
		};

		response.Status = response.setStatus;
		response.Content = response.setContent;
		response.Cookie = response.SetCookie;
		response.push = response.pushHead;

		// response.setHeaders = function(field,val){
		// 	var fd = this.getHeader(field);
		// 	var vl = Array.isArray(fd) ? fd.concat(val) : [prev,val];
		// 	response.preHeaders[field] = val;
		// };

		// response.setStatus = function(code){
		// 	// if(response.statusCode) response.statusCode = code;
		// 	this.addHeader('status',code);
		// 	return this;
		// };
		// response.setHeader = function(field, val){
		//     var key = field.toLowerCase()
		//       , prev;

		//     // special-case Set-Cookie
		//     if (this._headers && 'set-cookie' == key) {
		//       if (prev = this.getHeader(field)) {
		//         val = Array.isArray(prev)
		//           ? prev.concat(val)
		//           : [prev, val];
		//       }
		//     // charset
		//     } else if ('content-type' == key && this.charset) {
		//       val += '; charset=' + this.charset;
		//     }

		//     setHeaders.call(this, field, val);
		//     return this;
		// };

		response._renderHeaders = function(){
		    if (!this._emittedHeader) this.emit('header');
		    this._emittedHeader = true;
		    return renderHeaders.call(this);
		};

		response.writeHead = function(){
		    if (!this._emittedHeader) this.emit('header');
		    this._emittedHeader = true;
		    return writeHead.apply(this, arguments);
		};

		response.routerPatch = true;

	};
});;var R = (function(){

	var utility = util = require('tsk').ToolStack.Utility;
		// http = require('http'),
		// crypto = require('crypto');

	var R = {
		HttpStatusCodes:{ 
		  '100': 'Continue',
		  '101': 'Switching Protocols',
		  '102': 'Processing',
		  '200': 'OK',
		  '201': 'Created',
		  '202': 'Accepted',
		  '203': 'Non-Authoritative Information',
		  '204': 'No Content',
		  '205': 'Reset Content',
		  '206': 'Partial Content',
		  '207': 'Multi-Status',
		  '300': 'Multiple Choices',
		  '301': 'Moved Permanently',
		  '302': 'Moved Temporarily',
		  '303': 'See Other',
		  '304': 'Not Modified',
		  '305': 'Use Proxy',
		  '307': 'Temporary Redirect',
		  '400': 'Bad Request',
		  '401': 'Unauthorized',
		  '402': 'Payment Required',
		  '403': 'Forbidden',
		  '404': 'Not Found',
		  '405': 'Method Not Allowed',
		  '406': 'Not Acceptable',
		  '407': 'Proxy Authentication Required',
		  '408': 'Request Time-out',
		  '409': 'Conflict',
		  '410': 'Gone',
		  '411': 'Length Required',
		  '412': 'Precondition Failed',
		  '413': 'Request Entity Too Large',
		  '414': 'Request-URI Too Large',
		  '415': 'Unsupported Media Type',
		  '416': 'Requested Range Not Satisfiable',
		  '417': 'Expectation Failed',
		  '418': 'I\'m a teapot',
		  '422': 'Unprocessable Entity',
		  '423': 'Locked',
		  '424': 'Failed Dependency',
		  '425': 'Unordered Collection',
		  '426': 'Upgrade Required',
		  '428': 'Precondition Required',
		  '429': 'Too Many Requests',
		  '431': 'Request Header Fields Too Large',
		  '500': 'Internal Server Error',
		  '501': 'Not Implemented',
		  '502': 'Bad Gateway',
		  '503': 'Service Unavailable',
		  '504': 'Gateway Time-out',
		  '505': 'HTTP Version not supported',
		  '506': 'Variant Also Negotiates',
		  '507': 'Insufficient Storage',
		  '509': 'Bandwidth Limit Exceeded',
		  '510': 'Not Extended',
		  '511': 'Network Authentication Required' 
	  	},
	};

		R.helpers = function(scope,ext){
			scope.find = function(){ return ext.find.apply(scope, arguments); };
			scope.set = function(){ return ext.set.apply(scope,arguments); };
			return true;
		};

		R.params = function(templ,keys){
			if(!templ || !keys) return;
			var params = {};
			utility.eachAsync(templ,function(e,i,o){
			   var k = e.split(':'), c = keys[i];
			   if(k.length > 1 && k[1]) params[k[1]] = c;
			   else params[k[0]] = c;
			},null,this);
			return params;
		};

		R.matchrs = {
			root: /^\/$/,
			basic: /\/([\w|\d|\-|\_]+)|\//,
			param: /^:([\w|\d|\-|\_]+)/,
			norm: /^([\w|\d|\-|\_]+)/,
			paramd:/\/(:[\w|\d|\-|\_]+)/,
			pure: /\/([\w|\d|\-|\_]+)/,
			addit: /\/*([\w|\d|\-|\_]*)/,
			asterick: /\*/,
			idc: /:id/,
			textc: /:text/,
			id: /\/([\d]+)/,
			text: /\/([\w_-]+)/,
			// rootsplitter: /^\/([\w|\d|\-|\_]+)(\/)/,
			// rootextender: /^\/([\w|\d|\-|\_]+)(\/[:\w\W]+)/,
			rootextender: /(\/[\w|\d|\-|\_]+)(\/$|\/[\w\W]+)/
		};

		R.processRegExp = function(reg){
			if(!utility.isRegExp(reg)) return false;

			var unit = {};
			unit.mount = unit.orig = reg;
			unit.split = utility.normalizeArray(reg.toString().replace(/\\+|\++/ig,'').split('/'));
			unit.params = {};

			utility.each(unit.split,function(e,i,o){
				// if(e === 'd') unit.params['id'] = null
				unit.params[e] = null;
			});

			return unit;
		};

		R.processMount = function(mount,open){
				var temp = mount,
				unit = { params: null, split: null, mount:null, orig: mount },
				split,join=[], m = R.matchrs,set = {};

				if(temp === '/'){ unit.mount = /^\/$/; return unit; }

				if(temp.charAt(0) === '/') temp = temp.substring(1);
				split = temp.split('/')

				if(!split.length) return false;

				utility.eachAsync(split,function(e,i,o,fn){
					if(e.match(m.norm)){
						// var tmp = utility.values(m.pure.toString());
						// tmp[0] = tmp[tmp.length - 1] = '';
						join.push('\\/'+e);
						set[e] = null;
					}
					else if(e.match(m.param)){ 
						var item = e.match(m.param),
						tmp = utility.values( e.match(m.idc) ? m.id.toString() : 
								( e.match(m.textc) ? 
								m.text.toString() : m.pure.toString()) );

						tmp[0] = tmp[tmp.length - 1] = '';
						set[item[1]] = null;
						join.push(tmp.join(''));
					}else if(e.match(m.asterick)){
						var tmp = utility.values(m.addit.toString());
						tmp[0] = tmp[tmp.length - 1] = '';
						join.push(tmp.join(''));
					}
					if(e.charAt(e.length) === '/') join.push('/');
					fn(false);
				},function(err){
					if(err) return;
					unit.mount = new RegExp(("^".concat(join.join('')).concat(open ? '' : '$')),'i');
					unit.params = set;
					unit.split = split;

				},this);

				return unit;
		};

	/*!
	 * Connect - utils
	 * Copyright(c) 2010 Sencha Inc.
	 * Copyright(c) 2011 TJ Holowaychuk
	 * MIT Licensed
	 */


	R.mime = function(req){
		return (req.headers['content-type'] || '').split(';');
	};

	R.error = function(code,message){
		var err = new Error(message || R.HttpStatusCodes[code]);
		err.status = err;
		return err;
	};

	// R.md5 = function(str,encoding){
	// 	return crypto.createHash('md5').update(str).digest(encoding || 'hex');
	// };

	// R.uid = function(len) {
	//   return crypto.randomBytes(Math.ceil(len * 3 / 4))
	//     .toString('base64')
	//     .slice(0, len);
	// };


	return R;

})();
;var routerware = (function(R){

	var ts = require('tsk').ToolStack,
	util = ts.Utility,
	url = require('url'),
	getr = /^get$|^head$/,postr = /^post$|^put$|^delete$/,
	r = R, Ware = {};
	

	Ware.Generate = function(notfoundhandler){

		if(!notfoundhandler) notfoundhandler = function(err,req,res){
			var status = (err && err.status) ? err.status : 404;
			var message = (err && err.message) ? err.message  : "Request Not Found!";
			var stack = (err && err.stack ) ? err.stack : null;

			res.writeHead(status,{ 'content-type':'text/plain'});
			res.write("Error: "+message+"\n");
			if(stack) res.write(stack);
			res.end();
			req.destroy();
		};

		var ware = ts.Middleware(function(key){
			if(!key){
				var route = /\*/; route.binding = '*';
				return route;
			}
			var open = key[key.length - 1] === '*' ? true : false;
			var procs = (util.isRegExp(key)) ? r.processRegExp(key) : r.processMount(key,open);
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
				var clean = util.normalizeArray(pathname.split('/'));
				req.params = r.params(key.setsplit,clean);
				return true;
			}
			else return false;
		},notfoundhandler);

		return ware;
	};

	Ware.Router = function(server,notfound){
		var routerware = Ware.Generate()(notfound);
		routerware.server = server || require('http').createServer();

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
		// routerware.pipeOut = function(proc){
		// 	if(!proc || !util.isObject(proc)) return;
		// 	this.server.stdout.pipe(proc.stdout,{ end: false });
		// };

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


//execute patcher
patch();
var router = routerware(R);
router.R = R;
router.Middleware = {
	BodyParser: bodyparser(R),
	FileServer: fileserver(R),
	Logger: logger(R),
	Query: query(R),
};

module.exports = router;
