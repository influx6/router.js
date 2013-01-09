var js = require('jsconcat'), uglify = false, builds = "./builds";

js.compile({
	build_dir: builds,
	src_dir:"./src",
	name:"router.js",
	uglify: uglify,
	src:['./rutil.js','./router.js','./routerware.js']
});

js.compile({
	build_dir: builds,
	src_dir:"./src/middleware",
	name:"middlewares.js",
	uglify: uglify,
	src:['./bodyparser.js','fileserver.js']
});