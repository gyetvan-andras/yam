var utils = require('./utils');
var db = require('./db');
var uuid = require('node-uuid');
var fs = require('fs');

// exports.processGroups = function(groups, callback) {
function processGroups(groups, callback) {
    utils.processCollection(groups, function(item,cb) {
        try {
            var grp_name = item.name;
            db.db.get('select count(*) cnt from assets a where a.grp = $grp',{$grp:grp_name}, function(err, row) {
                if (err) return cb(err); 
                item.count = row.cnt;
                cb();
            });
        } catch (exception) {
          cb(exception);
        }
    }, callback);
}

exports.getGroups = function(user_id,cb) {
    var ret = [];
    db.db.each('select distinct a.grp from assets a order by a.grp',function(err, row) {
        if(err) {
            console.log(err);
            return;
        } else {
            var grp_name = row.grp;
            // console.log("Group:"+grp_name);
            ret.push({id:grp_name.toLowerCase(), name:grp_name, count: 0});
        }
    }, function(err) {
        if(err) return cb(err); 
        processGroups(ret,function(err) {
            if(err) {
                return cb(err);
            } else {
                return cb(null,ret);
            }
        });
    });
};

exports.getGroupItems = function(user_id, grp_name, cb) {
    var ret = [];
    db.db.each('select a.name, a.url, a.type from assets a where a.grp like $grp order by a.name',{$grp:grp_name},function(err, row) {
        if(err) return;
        ret.push({name:row.name, url:row.url, type:row.type});
    }, function(err) {
        if(err) return cb(err); 
        else return cb(null,ret);
    });
};

exports.searchItems = function(user_id, text, cb) {
    var ret = [];
    db.db.each('select a.name, a.url, a.type from assets a where a.name like $text order by a.name',{$text:'%'+text+'%'},function(err, row) {
        if(err) return;
        ret.push({name:row.name, url:row.url, type:row.type});
    }, function(err) {
        if(err) return cb(err); 
        else return cb(null,ret);
    });
};

// exports.saveTemplate = function(user_id, asset_meta, asset_content,cb) {

exports.saveAsset = function(user_id, asset_meta, asset_content,cb) {
    var filename = 'uploads/' + uuid.v4() + '.png';
    var fileBuffer = utils.decodeBase64Image(asset_content);
    fs.writeFile(filename, fileBuffer.data, function(err) {
        if(err) {
            return cb(err);
        } else {
            db.db.run("INSERT INTO assets VALUES ($group, $name, $url, $type)",{$group: 'User',$name: asset_meta.name,$url: filename,$type:asset_meta.type}, function(err) {
                if(err) {
                    return cb(err);
                } else {
                    return cb(null,{path:filename});
                }
            });
        }
    });
};

//  db.run("CREATE TABLE if not exists templates (name VARCHAR(30), type INTEGER, thumb_url VARCHAR(512), content TEXT)");

// template_meta 
// {
//     thumbnail:
//     name:
//     type:
//     json:
// }
exports.saveTemplate = function(template_meta, template_json, template_thumb, cb) {
    var filename = 'yam_templates/' + uuid.v4() + '.png';
    var fileBuffer = utils.decodeBase64Image(template_thumb);
    fs.writeFile(filename, fileBuffer.data, function(err) {
        if(err) {
            return cb(err);
        } else {
            db.db.run("INSERT INTO templates VALUES ($name, $type, $url, $content)",{$name:template_meta.name, $type:template_meta.type, $url:filename, $content:template_json}, function(err) {
                if(err) {
                    return cb(err);
                } else {
                    return cb(null,{path:filename});
                }
            });
        }
    });
};

exports.getTemplates = function(type,cb) {
    var ret = [];
    db.db.each('select tmpl.name, tmpl.thumb_url, tmpl.content from templates as tmpl where tmpl.type = $type order by tmpl.name',{$type:type},function(err, row) {
        if(err) return cb(err);
        ret.push({name:row.name, thumb_url:row.thumb_url, content:row.content});
    }, function() {
        return cb(null,ret);
    });
};
