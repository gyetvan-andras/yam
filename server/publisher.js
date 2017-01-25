/*jshint node:true, laxcomma:true*/
'use strict';

var ffmpeg  = require('fluent-ffmpeg');
var spawn   = require('child_process').spawn;
var fs      = require('fs');
var uuid 	= require('node-uuid');
var utils 	= require('./utils');
var jpegframes = true;
var yams 	= require('./yams');
var db 		= require('./db');

function createSessionFolder(session) {
	try {
		var stat = fs.statSync('./published/'+session);
		if(!stat.isDirectory()) {
			fs.mkdirSync('./published/'+session);
		}
	} catch(err) {
		fs.mkdirSync('./published/'+session);
	}
}

function generateFrames(session,filename,prefix,start,duration,cb) {
	createSessionFolder(session);
	var command = ffmpeg(filename);
	if(jpegframes) {
		command
			.seekInput(start)
			.duration(duration)
			.output('./published/'+session+'/'+prefix+'%d.jpg')
			.outputOptions('-vf', 'fps=60','-q:v', '1')
			.on('end', function() {
				cb(null,command.frameNames);
			})
			.on('error', function(err) {
				cb(err);
			})
			.run();
	} else {
		command
			.seekInput(start)
			.duration(duration)
			.output('./published/'+session+'/'+prefix+'%d.png')
			.outputOptions('-vf', 'fps=60')
			.on('end', function() {
				cb(null,command.frameNames);
			})
			.on('error', function(err) {
				cb(err);
			})
			.run();
	}
}

//exports.publishYam = function(user_id, yam_id, url ,cb) {

exports.publishYam = function(user_id, session, yam_content,cb) {
	createSessionFolder(session);
	var buff = new Buffer(yam_content);
    var filename = './published/'+session +'/' + session +'.yam';
    fs.writeFile(filename, buff, function(err) {
        if(err) {
            return cb(err);
        } else {
        	var yam = JSON.parse(yam_content);
        	var yam_id = yam.id;
        	if(yam_id) {
	        	yams.publishYam(user_id,yam_id,session, yam.name, yam.desc, function(err,ret) {
	        		if(err) {
	        			return cb(err);
	        		} else {
	            		return cb(null,{path:filename});
	        		}
	        	});
        	} else {
        		return cb(null,{path:filename});
        	}
        }
    });

};

exports.start = function(cb) {
  var session = uuid.v4();
  cb(null, session);
};

exports.saveTexture = function(session,texture_content, cb) {
	createSessionFolder(session);
    var filename = './published/'+session +'/' + uuid.v4()+'.png';
    var fileBuffer = utils.decodeBase64Image(texture_content);
    fs.writeFile(filename, fileBuffer.data, function(err) {
        if(err) {
            return cb(err);
        } else {
            return cb(null,{path:filename});
        }
    });
};

exports.createFrames = function(req,res) {
	var session = req.body.session;
	var filename = req.body.filename;
	var prefix = req.body.prefix;
	var start = req.body.start;
	var duration = req.body.duration;
	if(session && filename && prefix && start !== undefined && duration) {
		generateFrames(session,filename,prefix,start,duration, function(err) {
			if(err) {
				return res.status(500).send(err);		
			} else {
				var filenames = [];
				var frames = duration * 60;
				for(var fidx = 0; fidx < frames;fidx++) {
					var fname = "";
					if(jpegframes) {
						fname = './published/'+session+'/'+prefix+(fidx+1)+'.jpg';
					} else {
						fname = './published/'+session+'/'+prefix+(fidx+1)+'.png';
					}
					filenames.push(fname);
				}
				// console.log('generated frames are ' + filenames.join(', '));
				res.json(filenames);
			}
		});
	} else {
		return res.status(500).send("Invalid parameters");
	}
};

exports.getYams = function(user_id, cb) {
    var ret = [];
    db.db.each('select p.created, p.user_id, p.name, p.description, p.session_id from published as p where p.user_id = $user_id order by p.created desc',{$user_id:user_id},function(err, row) {
        if(err) return; 
        var p = {
	        user: row.user_id,
	        created: row.created,
	        name: row.name,
	        desc: row.description,
	        session_id: row.session_id
    	};
        ret.push(p);
    }, function(err) {
        if(err) return cb(err); 
        else return cb(null,ret);
    });
};

exports.getAllYams = function(cb) {
    var ret = [];
    db.db.each('select p.created, p.user_id, p.name, p.description, p.session_id from published as p order by p.created desc',{},function(err, row) {
        if(err) return; 
        var p = {
	        user: row.user_id,
	        created: row.created,
	        name: row.name,
	        desc: row.description,
	        session_id: row.session_id
    	};
        ret.push(p);
    }, function(err) {
        if(err) return cb(err); 
        else return cb(null,ret);
    });
};
