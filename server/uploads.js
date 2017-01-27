/*jshint node:true, laxcomma:true*/
'use strict';

var ffmpeg  = require('fluent-ffmpeg');
var multer  = require('multer');
var spawn   = require('child_process').spawn;
var fs      = require('fs');
var gm      = require('gm');
var storage = require('./chunked_store')();
var uuid = require('node-uuid');
var path = require('path')

var _upload = multer({ 
  storage : storage,
}).single('upl');

function createThumbnailStrip(shname,callback) {
    var stdout = '';
    var stdoutClosed = false;
    var stderr = '';
    var stderrClosed = false;

		var uploadFolder = path.join(__dirname,'../uploads');

    // Spawn ffprobe
    var ls = spawn('ls', [
      uploadFolder,
    ]);

    ls.on('error', function(err) {
      callback(err);
    });
    // Handle ls exit
    function handleExit() {
        // console.log('ls.stdout:'+stdout);
        // console.log('ls.stderr:'+stderr);
        // console.log('shname:'+shname);
        var tnfiles = [];
        var lines = stdout.split(/\r\n|\r|\n/);
        var line = lines.shift();
        while (line) {
          if(line.length > shname.length && line.startsWith(shname) && (!line.endsWith('thumbnail.png')) && (line.endsWith('.png'))) {
            var ptpos = line.lastIndexOf('.');
            var seq = line.substring(shname.length,ptpos);
            var item = {line:line, seq:seq};
            tnfiles.push(item);
          }
          line = lines.shift();
        }
        tnfiles.sort(function(i1,i2) {
          var seq1 = parseInt(i1.seq);
          var seq2 = parseInt(i2.seq);
          return seq1 - seq2;
        });
        var i = 0;
        if(tnfiles.length > 0) {
					var append = gm(path.join(uploadFolder,tnfiles[0].line));
          for(i = 1; i < tnfiles.length;i++) {
						append = append.append(path.join(uploadFolder,tnfiles[i].line));
          }
					append.append(true).write(path.join(uploadFolder,shname+"-strip.png"),function (err) {
            if (err) return console.dir(arguments);
            for(i = 0; i < tnfiles.length;i++) {
							fs.unlinkSync(path.join(uploadFolder,tnfiles[i].line));
            }
            callback(null,"uploads/"+shname+"-strip.png",tnfiles.length*100);
          });
        } else {
          callback(new Error('No thumbnails generated.'));
        }
    }

    var processExited = false;
    ls.on('exit', function(code, signal) {
      processExited = true;

      if (code) {
        // console.log('ls.stdout:'+stdout);
        console.log('ls.stderr:'+stderr);
        callback(new Error('ls exited with code ' + code));
      } else if (signal) {
        // console.log('ls.stdout:'+stdout);
        console.log('ls.stderr:'+stderr);
        callback(new Error('ls was killed with signal ' + signal));
      } else {
        handleExit();
      }
    });

    // Handle stdout/stderr streams
    ls.stdout.on('data', function(data) {
      stdout += data;
    });

    ls.stdout.on('close', function() {
      stdoutClosed = true;
      // handleExit();
    });

    ls.stderr.on('data', function(data) {
      stderr += data;
    });

    ls.stderr.on('close', function() {
      stderrClosed = true;
      // handleExit();
    });

}

function generateThumbnails(filename,shname,io) {
  var command = ffmpeg(filename);
	var uploadFolder = path.join(__dirname,'../uploads');
	var file_url = path.join('uploads',path.basename(filename));
  command.ffprobe(function(err, meta) {
    if(err) {
      console.log(err);
      return;
    } else {
      var vstream = meta.streams.reduce(function(biggest, stream) {
        if (stream.codec_type === 'video' && stream.width * stream.height > biggest.width * biggest.height) {
          return stream;
        } else {
          return biggest;
        }
      },{ 
        width: 0, 
        height: 0 
      });

      if (vstream.width === 0) {
        console.log('No video stream in input, cannot generate thumbnails');
        return;
        // return next(new Error('No video stream in input, cannot take screenshots'));
      }

			//console.log('stream:',vstream)
			var ss = vstream.start_time;

			if(ss) {
				ss = parseFloat(ss)
				ss *= -1
			}
			//console.log('ss:',ss)

      var duration = Number(vstream.duration);
      var fps = 1;
      var frames = Math.ceil(duration / fps);

      if (isNaN(duration)) {
        console.log("Cannot get duration!");
      } else {
        // console.log('Duration:'+duration);
      }
      var stripper = command
			.output(path.join(uploadFolder,shname+'%d.png'))
      .outputOptions('-vf', 'fps='+fps+',scale=100:-1')
      .on('end', function() {
        createThumbnailStrip(shname,function(err,strip,strip_width) {
          console.log("END generating "+frames+" frames.");
          io.emit('uploads/'+shname+'-thumbnail.png',{progress:100,strip:strip, video_src:file_url, strip_width:strip_width});
          // convertVideo(filename,duration);
        });
      })
      .on('error', function(err) {
        console.log("Error:"+err);
        io.emit('uploads/'+shname+'-thumbnail.png',{progress:-1});
      })
      .on('progress', function(progress) {
        // JSON.stringify(progress, null,2);
        var percent = Math.ceil((progress.frames/frames)*100);
        io.emit('uploads/'+shname+'-thumbnail.png',{progress:percent});
        // console.log("Progress:"+percent);//JSON.stringify(progress, null,2));
      });
			if(ss) {
				stripper.inputOptions('-ss', ss);
			}
      stripper.run();
    }
  }); 
}

exports.upload = function(req,res,io) {
	console.log('uploading...')
    _upload(req,res,function(err) {
        if(err) {
            return res.status(500).send(err);
        }
        res.send("OK");
    });
};

exports.requestSlot = function(req,res) {
  var slot = uuid.v4();
  var type = req.query.type;
  var fname = req.query.filename;
  var ext = fname.slice((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
  slot = slot + "." + ext;
  if(type.startsWith('video')) {
    slot = 'video-'+slot;
  }
  res.json({slot:slot});
};

exports.processSlot = function(slot,res,io) {
  var filename = slot;
  var shname = filename.substring(0,filename.lastIndexOf("."));
	var uploadFolder = path.join(__dirname,'../uploads');
	filename = path.join(uploadFolder,filename);
  if(slot.startsWith('video-')) {
    var command = ffmpeg(filename);
    command
      .on('filenames', function(filenames) {
          // console.log('Will generate ' + filenames.join(', '));
      })
      .on('end', function() {
        // var filename = 'uploads/'+shname+'-thumbnail.png';
        generateThumbnails(filename,shname,io);
        res.send('uploads/'+shname+'-thumbnail.png');
      })
      .on('error', function(err) {
        console.log("Error:"+err);
        res.status(500).send(err);
      })
      .on('progress', function(progress) {
        console.log("Progress:"+progress.percent);
      })
      .screenshots({
        count: 1,
        folder: uploadFolder,
        filename: shname+'-thumbnail.png',
        size:'200x?'
      });
  } else {
    res.send(filename);
  }
};

exports.cancelSlot = function(slot,res) {
  res.send("OK!");
};

