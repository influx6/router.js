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
