module.exports.R = (function(utility){

	var R = {
		Errors: {}
	};

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

});