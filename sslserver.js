var fs 			= require('fs');
var express 	= require("express");
var https = require('https');
var httpSignature = require('http-signature');



process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var options = {
    key: fs.readFileSync('./cert/key.pem', 'ascii'),
    cert: fs.readFileSync('./cert/cert.pem', 'ascii')
};
var app = express(options);
var https = require('https');




var app	    	= express();

// http === HTTPS Server
var http = https.createServer(options, app);

var io 			= require('socket.io')(http);

var scribe = require('scribe-js')({
    createDefaultConsole : false
});
var editorConsole = scribe.console({

    console : {
        alwaysLocation	: true,
        alwaysTime		: true,
        alwaysDate		: true
    },

    createBasic : true
});

process.console = editorConsole;

var editor      = require('./server/editor')(express,io);
var pages      = require('./server/pages')(express);

var bodyParser 	= require('body-parser');

app.use(function(req, res, next){
    console.log("Check Signature!");
    try {
        var parsed = httpSignature.parseRequest(req);
        var pub = fs.readFileSync(parsed.keyId, 'ascii');
        if (!httpSignature.verifySignature(parsed, pub)) {
            res.status(401).send('Unauthorized YAM Request!! Status Code (401)');
        } else {
            next();
        }
    }catch(e){
        console.log("Error");
        res.status(404).send('Unauthorized YAM Request!! Status Code (404)');
    }
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false,limit: '150mb' }));

app.use('/api',editor);

app.use('/',pages);

app.use('/logs',scribe.webPanel());

app.use(express.static('./'));
app.use('/editor/',express.static('./'));
app.use('/player',express.static('./'));

http.listen(7777,function(){
    console.log("Working on port 7777");
});

/**
 * Created by peter on 29/03/16.
 */
