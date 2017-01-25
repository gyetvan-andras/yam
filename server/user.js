exports.getUserId = function(req, cb) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token == 'secret') return cb(null,'gyand');
	else return cb(new Error("invalid token"));
};