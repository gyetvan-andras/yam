var fs 			= require('fs');
var express 	= require("express");
var app	    	= express();

var http 		= require('http').Server(app);
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

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false,limit: '150mb' }));

app.use('/api',editor);

app.use('/',pages);
app.use('/', express.static(__dirname))

app.use('/logs',scribe.webPanel());

app.use(express.static(__dirname));
app.use('/editor/',express.static(__dirname));
app.use('/player',express.static(__dirname));

http.listen(7777,function(){
    console.log("Working on port 7777");
});

