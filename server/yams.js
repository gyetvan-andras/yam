var utils = require('./utils');
var db = require('./db');

// yams.save(meta, content, cb) {
// db.run("CREATE TABLE if not exists yams (user_id VARCHAR(30), name VARCHAR(30), description VARCHAR(512), content TEXT)");
// db.run("CREATE TABLE if not exists yam_assets (yam_id INTEGER, asset_id INTEGER)");

// id:string,      -- unique ID, when null create new
// user_id:string, -- owner
// name:string,    -- name
// desc:string,    -- description, should be processed fro #-tags and @-refs

exports.save = function(user_id, yam_id, meta, content, cb) {
	if(yam_id) {
		db.db.run('update yams set user_id = $user_id, name = $name, description = $desc, content = $cont where rowid = $rowid',
			{$user_id:user_id, $name:meta.name,$desc:meta.desc,$cont:content,$rowid:yam_id},function(err) {
 			if(err) {
 				return cb(err);
 			} else {
 				return cb(null, {id:yam_id});
 			}
		});
	} else {
		db.db.run('insert into yams values($created, $user_id, $name, $desc, $cont, 0)',{$created:new Date(), $user_id:user_id, $name:meta.name,$desc:meta.desc,$cont:content},function(err) {
 			if(err) {
 				cb(err);
 			} else {
 				cb(null, {id:this.lastID});
 			}
		});
	}
};

exports.getYams = function(user_id, cb) {
    var ret = [];
    db.db.each('select y.rowid, y.created, y.name, y.description from yams y where y.user_id = $user_id and published = 0 order by y.name',{$user_id:user_id},function(err, row) {
        if(err) return;
        ret.push({id:row.rowid, created:new Date(row.created), name:row.name, desc:row.desc});
    }, function(err) {
        if(err) return cb(err); 
        else return cb(null,ret);
    });
};

exports.getYamById = function(user_id, id,cb) {
    db.db.get("select y.content from yams y where y.rowid = $rowid",{$rowid:id},function(err,row) {
        if(err) {
            return cb(err);
        } else {
            return cb(null, row.content);
        }
    });
};


//  db.run("CREATE TABLE if not exists published (created DATE, user_id VARCHAR(30), name VARCHAR(30), description VARCHAR(512), content_url VARCHAR(512))");

exports.publishYam = function(user_id, yam_id, session_id, name, desc ,cb) {
    db.db.run('update yams set published = 1 where rowid = $rowid',
        {$rowid:yam_id},function(err) {
        if(err) {
            return cb(err);
        } else {
            db.db.run('insert into published values($created, $user_id, $name, $desc, $session_id)',{$created:new Date(), $user_id:user_id, $name:name,$desc:desc,$session_id:session_id},function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, {id:this.lastID});
                }
            });
        }
    });
};

exports.deleteYamById = function(user_id, id,cb) {
};
