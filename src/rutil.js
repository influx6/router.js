;var R = (function(){

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

			utility.each(unit.split,function(e,i,o,fn){
				unit.params[i]= null;
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
