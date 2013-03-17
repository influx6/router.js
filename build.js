var js = require('jsconcat'), uglify = false, builds = "./builds";

js.compile({
	build_dir: builds,
	src_dir:"./src",
	name:"routerware.js",
	uglify: uglify,
	src:['patch.js','./rutil.js','./routerware.js','./initor.js']
});

js.compile({
	build_dir: builds,
	src_dir:"./src/middleware",
	name:"middlewares.js",
	uglify: uglify,
	src:['./bodyparser.js','fileserver.js','logger.js','query.js']
});


js.compile({
	build_dir: './',
	src_dir:"./builds",
	name:"router.js",
	uglify: uglify,
	src:['middlewares.js','routerware.js']
});