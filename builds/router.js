module.exports.R = (function(utility,debug){

	var debug = debug,
	R = {
		Errors: {}
	};

		// R.log = {
		// 	default: function(req,msg,to){
		// 		var path = url.parse(req.url),host = req.headers.host;
		// 		return utility.makeString(" ","Info:".red,req.method.green,"Page".grey,path.pathname.green,msg.grey,host.magenta,"on".grey,(new Date()).toUTCString().yellow);
		// 	},
		// 	redirect: function(req,to){
		// 		debug.log(this.default(req,"redirect to "+to.green+" from".grey));
		// 	},
		// 	custom: function(req,message,to){
		// 		debug.log(this.default(req,message,to));
		// 	}
		// };

		R.basic = {
			find : function(item){
					if(!this[item]) return false;
					return this[item];
			},
			set : function(item,value,force){
					if(this[item] && !force) return this[item];
					this[item] = value;
					return this[item];
			}
		};

		R.searchable = {

			find : function(item,success,failure){
				var count = 0, size = utility.keys(this).length - 1;
				if(!failure) failure = function(){};

				utility.eachAsync(this,function(e,i,o,fn){
					if(count === size) fn(true);
					count += 1;
					fn(false);
				},function(err){
					if(err) failure();
				},this,function(e,i,o){
					var match = item.match(e.mount);
					if(utility.isObject(e) && match){ success(e,match); return true;}
					return false;
				});

			},

			set : function(item,value,force){
					if(this[item] && !force) return this[item];
					this[item] = value;
					return this[item];
			}
		};

		R.helpers = function(scope,ext){
			scope.find = function(){ return ext.find.apply(scope, arguments); };
			scope.set = function(){ return ext.set.apply(scope,arguments); };
			return true;
		};

		R.params = function(templ,keys){
			console.log(templ,keys);
			if(!templ || !keys) return;
			var params = {};
			utility.eachAsync(templ,function(e,i,o){
			   var k = e.split(':'), c = keys[i];
			   if(k[1]) params[k[1]] = c;
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
			// rootsplitter: /^\/([\w|\d|\-|\_]+)(\/)/,
			// rootextender: /^\/([\w|\d|\-|\_]+)(\/[:\w\W]+)/,
			rootextender: /(\/[\w|\d|\-|\_]+)(\/$|\/[\w\W]+)/
		};


		R.processMount = function(mount){
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
						var item = e.match(m.param),tmp = utility.values(m.pure.toString());
						tmp[0] = tmp[tmp.length - 1] = '';
						set[item[1]] = null;
						join.push(tmp.join(''));
					}
					if(e.charAt(e.length) === '/') join.push('/');
					fn(false);
				},function(err){
					if(err) return;
					unit.mount = new RegExp(("^".concat(join.join('')).concat('$')),'i');
					unit.params = set;
					unit.split = split;

				},this);

				return unit;
		};

		//
		// HTTP Error objectst
		//
		R.Errors.BadRequest = function (msg) {
		    // status = 400;
		    // headers = {};
		    // body = { error: msg };
		};

		R.Errors.NotFound = function (msg) {
		    // .status = 404;
		    // .headers = {};
		    // .body = { error: msg };
		};

		R.Errors.MethodNotAllowed = function (allowed) {
		    // .status = 405;
		    // .headers = { allow: allowed };
		    // .body = { error: "method not allowed." };
		};

		R.Errors.NotAcceptable = function (accept) {
		    // .status = 406;
		    // .headers = {};
		    // .body = {
		    //     error: "cannot generate '" + accept + "' response",
		    //     only: "application/json"
		    // };
		};

		R.Errors.NotImplemented = function (msg) {
		    // .status = 501;
		    // .headers = {};
		    // .body = { error: msg };
		};

		R.Errors.NotAuthorized = function (res) {
		    // .status = 401;
		    // .headers = {};
		    // .body = { error: msg || 'Not Authorized' };
		};
		R.Errors.Forbidden = function (res) {
		    // .status = 403;
		    // .headers = {};
		    // .body = { error: msg || 'Forbidden' };
		};

	return R;

});module.exports.Router = (function(R,utility,url,qs,debug,domain){

	var utility = utility,
		domain = domain,
		r = R(utility),
		Router = function(server){

			var self = this;
			this.domain = domain.create();
			this.pipe = { server: server };
			this.routes = {};
			r.helpers(this.routes,r.basic);


			this.routes.set('/404',{ 
				mount:'/404',
				params: null,
				split: null,
				fn: function(req,res){
					res.writeHead(404,{ 
						'content-type': "text/plain",
					'x-powered-by':"router@0.1"});

					res.end("Page Not Found!");
					Router.debug.custom(req,'page not found from');
				}
			});


			server.on('request',function(req,res){
				var data = [''];
				self.domain.add(req);
				self.domain.add(res); 

				req.on('error',function(err){
					Router.debug.log("request error 505!",err);
					try{
						res.writeHead(505);
						res.end("Request Error! 505!");
						res.on('end',function(){	self.domain.dispose(); })
					}catch(e){
						Router.debug.log("tryCatching 505 Error!",e,req.url);
						self.domain.dispose()
					}
				});

				req.on('data',function(chunk){
					data.push(chunk);
				});

				req.on('end',function(){
					process.nextTick(function(){ self.process(req,res,data); });
				})

				// process.nextTick(function(){ self.process(req,res,data); });
			});
		};


		Router.debug = {
			default: function(req,msg,to){
				var path = url.parse(req.url),host = req.headers.host;
				return utility.makeString(" ","Info:".red,req.method.green,"Page".grey,path.pathname.green,msg.grey,host.magenta,"on".grey,(new Date()).toUTCString().yellow);
			},
			redirect: function(req,to){
				debug.log(this.default(req,"redirect to "+to.green+" from".grey));
			},
			custom: function(req,message,to){
				debug.log(this.default(req,message,to));
			}
		};


		Router.methods = {
			"get":"_get_",
			"post":"_post_",
			"put":"_put_",
			"delete":"_delete_",
		};

		Router.fn = Router.prototype;


		Router.fn.route = function(main,sets){
			var self = this,
			route = this.routes.set(main,{
				"_get_":{},
				"_post_":{},
				"_put_":{},
				"_delete_":{},
			});

			r.helpers(route,r.basic);
			r.helpers(route._get_,r.searchable);
			r.helpers(route._post_,r.searchable);
			r.helpers(route._put_,r.searchable);
			r.helpers(route._delete_,r.searchable);

			var handle = function(method,callbackwrapper){
				 return function(mount,callback){
					var list = this.find(method),processd;
					processd = r.processMount(mount);
					if(!callbackwrapper) processd.fn = callback;
					else processd.fn = callbackwrapper(callback);
					list.set(mount,processd);
				};
			};

			route.get = handle("_get_");
			route.put = handle("_put_");
			route.post = handle("_post_");
			route.delete = handle("_delete_");

			route.redirect = function(from,to,method){
				var id = r.processMount(from),
					key = to.match(r.matchrs.rootextender),
					rt = self.routes.find(key[1])[Router.methods[method.toLowerCase()]][key[2]],
					entry = this[Router.methods[method.toLowerCase()]];

					id.fn = function(req){
						Router.debug.redirect(req,to);
						return rt.fn.apply(this,arguments);
					}
					entry.set(from,id);
			};

			//execute sets against the route
			sets.call(route);
			return route;
		};

		Router.fn.params = function(templ,keys){
			var params = {};
			utility.eachAsync(templ,function(e,i,o){
			   var k = e.split(':'), c = keys[i];
			   if(k[1]) params[k[1]] = c;
			},null,this);
			return params;
		};

		Router.fn.process = function(req,res,body){
			req.res = res;
			res.req = req;

			var self = this,rootname,extra,root,requested,reqa,
				path = url.parse(req.url),
				failed = this.routes.find('/404'),
				method = Router.methods[req.method.toLowerCase()],
				epath = utility.eString(path.pathname);

				//minor corrections of url ending with ending slash
				if(epath.end() === '/'){ 
					var ep = epath.split('/'); ep.pop(); epath = ep.join('/');
				}

				rootname = epath.match(r.matchrs.basic);
				// if(!rootname) return failed.fn(req,res);

				extra = epath.match(r.matchrs.rootextender);
				root = this.routes.find( (utility.isArray(rootname) && rootname[0]) ? rootname[0] : '/')[method];
				requested = (extra ? extra[2] : '/');
				reqa = (requested.length > 1 ? requested.split('/') : requested);

				reqa = (utility.isArray(reqa) ? utility.splice(reqa,1,reqa.length) : reqa);

			if(!root) return failed.fn(req,res);

			root.find(requested,function(e,o){
				var param = {};
				param.url = self.params(e.split,reqa);
				param.body = qs.parse(body.join(''));
				res.params = param;
				Router.debug.custom(req,"made to");
				e.fn(req,res,param.body);
			},function(){
				failed.fn(req,res);
			});


		};

	return Router;

});module.exports.RouterWare = (function(toolstack,R,url){

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

			console.log(route);
			return route;

		},function(key,req,res){
			req.urlParams = req.urlParams || {};
			var path = url.parse(req.url),pathname = path.pathname;
			if('/' === pathname[pathname.length - 1] && pathname.length > 1) pathname = pathname.slice(0,-1);
			if(key.test(pathname) || key.test('*')){
				var clean = pathname.split('/');
				req.urlParams = r.params(key.setsplit,util.makeSplice(clean,1,clean.length));
				console.log(req.urlParams);
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


