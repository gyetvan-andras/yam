var format = require('string-template');
var fs = require('fs');
var user = require('./user');

var editor_static = fs.readFileSync('templates/editor_static.tmpl', "utf8");
var editor_template = fs.readFileSync('templates/editor_dynamic.tmpl', "utf8");
var player_template = fs.readFileSync('templates/player_frame.tmpl', "utf8");

var console = process.console;

module.exports = function(express,_io) {
    var router = express.Router();
    setupRouter(router);
    return router;
};

function setupRouter(router) {

router.get('/editor/:yam_id', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
		    var editor_src = editor_static + format(editor_template, {
		        access_token:"secret",
		        editor_mode:"edit",
		        yam_id:req.params.yam_id
		    });
		    res.send(editor_src);
        }
    });

});

router.get('/editor', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
		    var editor_src = editor_static + format(editor_template, {
		        access_token:"secret",
		        editor_mode:"new"
		    });
		    res.send(editor_src);
        }
    });

});

/**
    YAM player frame source  
    - session_id : the session id of the YAM publish session
    ./published/5508ac12-3239-498b-abff-5e8f58ae64da/ad109807-938a-4b92-99bf-2c2aaa825411.yam
*/
router.get('/player/:session_id', function (req, res, next) {
    var session_id = req.params.session_id;
	var width = 640;
	var height = 480;
	var title = "We salute you!";
	var desc = "A skeleton silly-salutes :)";
	var poster = "images/sample.png";
	var player_src = format(player_template, {
		app_id:"1559812667643873",
		session:session_id,
		width:width,
		height:height,
		title:title,
		description:desc,
		poster:poster
	});
    res.send(player_src);
});

}