function createCRUDRequest(base,qry_params) {
	var req = base+"?token="+access_token;//secret";
	if(qry_params) {
		Object.keys(qry_params).forEach(function(key) {
			req = req + "&"+key+"="+qry_params[key];
		});
	}
	return req;
}

// document.yamGet = function(base,cb,qry_params) {
function yamGet(base,cb,qry_params) {
	var req = createCRUDRequest(base,qry_params);
	var ret = $.get(req, function(res) {
		cb(res);
	});
	return ret;
}

// document.yamPost = function(base,data,cb,qry_params) {
function yamPost(base,data,cb,qry_params) {
	var req = createCRUDRequest(base,qry_params);
	var ret = $.post(req, data, function(res) {
		cb(res);
	});
	return ret;
}
