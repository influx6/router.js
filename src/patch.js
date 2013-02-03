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
});