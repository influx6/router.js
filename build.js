var js = require('jsconcat'), uglify = false, builds = "./builds";

js.compile({
	build_dir: builds,
	src_dir:"./src",
	name:"router.js",
	uglify: uglify,
	src:['./rutility.js','./router.js','./routerware.js']
});