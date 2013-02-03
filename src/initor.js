//execute patcher
patch();
module.exports = {
	R: R,
	router : routerware(R),
	middleware:{
		BodyParser: bodyparser(R),
		FileServer: fileserver(R),
		Logger: logger(R),
		Query: Query(R),
	}
};