/*jshint node:true, laxcomma:true*/
'use strict';
var fs = require('fs');

function ChunkedStorage () {
  this.targetFolder = './uploads/';
}

ChunkedStorage.prototype.outputFile = function(req) {
  var self = this;
  var slot = req.body.slot;
  var fileOut = null;
  if(slot) {
    fileOut = self.targetFolder+slot;
  }
  return fileOut;
};

ChunkedStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  var self = this;
  var fileOut = this.outputFile(req,file.originalname);
  if(fileOut) {
    var outStream = fs.createWriteStream(fileOut, {'flags': 'a'});
    file.stream.pipe(outStream);
    outStream.on('error', cb);
    outStream.on('finish', function () {
      cb(null, {
        path: fileOut,
        size: outStream.bytesWritten
      });
    });
  } else {
    cb(new Error("No slot for file"));
  }
};

ChunkedStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  console.log("Remove file");
  fs.unlink(file.path, cb);
};

module.exports = function () {
  return new ChunkedStorage();
};