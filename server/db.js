var sqlite3 = require('sqlite3');//.verbose();
var path = require('path')
exports.db = new sqlite3.Database(path.join(__dirname,'../yam_editor.db'));

