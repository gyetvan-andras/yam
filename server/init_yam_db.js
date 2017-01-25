var fs 			= require('fs');
var sqlite3 = require('sqlite3');//.verbose();
var db = new sqlite3.Database('yam_editor.db');
 
 function processDir(params, dir, group, cb) {
 	console.log("Processing "+dir);
    fs.readdir(dir, function(err,files) {
        if(err) {
        	console.log(err);
        	cb(err);
        } else {
            for(var idx = 0; idx < files.length;idx++) {
            	var fn = files[idx];
            	if(fn.indexOf('.') !== 0) {
	            	console.log("Adding "+fn);
	            	params.push({
						$group: group,
						$name: fn,
						$url: dir+files[idx]
					});
					// stmt.run({
					// 	$group: group,
					// 	$name: fn,
					// 	$url: dir+files[idx]
					// });
				}
            }
            cb();
        }
    });
}

function executeStatements(params) {
	var stmnt = db.prepare("INSERT INTO assets VALUES ($group, $name, $url, 0)");
	db.serialize(function() {
		params.forEach(function(param) {
			stmnt.run(param);
		});
	});
}
function fillDatabase() {
 	var params = [];
	processDir(params,'images/clouds/', 'Clouds', function(err) {
		processDir(params,'images/stars/', 'Stars', function(err) {
			processDir(params,'images/floral/', 'Floral', function(err) {
				processDir(params,'images/symbols/', 'Symbols', function(err) {
					processDir(params,'images/Cog/', 'Cogs', function(err) {
						processDir(params,'images/RunningCat/', 'RunningCat', function(err) {
							processDir(params,'images/Skeleton/', 'Skeleton', function(err) {
								executeStatements(params);
							});
						});
					});
				});
			});
		});
		
	});
}

function createDatabase() {
	db.serialize(function() {
		db.run("CREATE TABLE if not exists sys_options (version INTEGER)");

		//!!! IMPORTANT INCRESE DB VERSION HERE
		//!!! IMPORTANT INCRESE DB VERSION HERE
		//!!! IMPORTANT INCRESE DB VERSION HERE
		//!!! IMPORTANT INCRESE DB VERSION HERE
		db.run("INSERT INTO sys_options VALUES(4)");
		//!!! IMPORTANT INCRESE DB VERSION HERE
		//!!! IMPORTANT INCRESE DB VERSION HERE
		//!!! IMPORTANT INCRESE DB VERSION HERE
		//!!! IMPORTANT INCRESE DB VERSION HERE

		db.run("CREATE TABLE if not exists published (created DATE, user_id VARCHAR(30), name VARCHAR(30), description VARCHAR(512), session_id VARCHAR(512))");
		db.run("CREATE TABLE if not exists yams (created DATE, user_id VARCHAR(30), name VARCHAR(30), description VARCHAR(512), content TEXT, published INTEGER)");
		db.run("CREATE TABLE if not exists yam_assets (yam_id INTEGER, asset_id INTEGER)");
		db.run("CREATE TABLE if not exists assets (grp VARCHAR(30), name VARCHAR(30), url VARCHAR(512), type INTEGER)");

		db.run("CREATE TABLE if not exists templates (name VARCHAR(30), type INTEGER, thumb_url VARCHAR(512), content TEXT)");

		// db.run("DELETE FROM yam_assets");
		// db.run("DELETE FROM yams");
		// db.run("DELETE FROM assets");
		// var stmt = db.prepare("INSERT INTO assets VALUES ($group, $name, $url, 0)");
	 
		// processDir(stmt,'images/clouds/', 'Clouds', function(err) {
		// 	processDir(stmt,'images/stars/', 'Stars', function(err) {
		// 		processDir(stmt,'images/floral/', 'Floral', function(err) {
		// 			processDir(stmt,'images/symbols/', 'Symbols', function(err) {
		// 				processDir(stmt,'images/Cog/', 'Cogs', function(err) {
		// 					processDir(stmt,'images/RunningCat/', 'RunningCat', function(err) {
		// 						processDir(stmt,'images/Skeleton/', 'Skeleton', function(err) {
		// 						});
		// 					});
		// 				});
		// 			});
		// 		});
		// 	});
			
		// });
		console.log("Database created");
	});

}

function updateDatabase(version) {
	db.serialize(function() {

		if(version === 1) {
			db.run("CREATE TABLE if not exists published (created DATE, user_id VARCHAR(30), name VARCHAR(30), description VARCHAR(512), session_id VARCHAR(512))");
			db.run("ALTER TABLE yams ADD COLUMN published INTEGER");
			version = 2;
		}
		if(version === 2) {
		    db.run('UPDATE yams SET published = 0',{}, function(err) {
		    	if(err) throw err;
		    });
			version = 3;
		}
		if(version === 3) {
			// db.run("ALTER TABLE assets ALTER COLUMN url VARCHAR(512)");
			db.run("CREATE TABLE if not exists templates (name VARCHAR(30), type INTEGER, thumb_url VARCHAR(512), content TEXT)");
			version = 4;
		}
	    db.run('UPDATE sys_options SET version = $ver',{$ver:version}, function(err) {
	    	if(err) throw err;
	    });
	});
}

db.serialize(function() {
    var ver = 0;
    db.get('select so.version from sys_options so',{},function(err, row) {
        if(err) {
        	createDatabase();
        	fillDatabase();
        } else {
	        if(row) {
	        	ver = row.version;
	        	updateDatabase(ver);
	        } else {
	        	db.get('select * from yams',{},function(err, row) {
	        		if(err) createDatabase();
		        	updateDatabase(1);
	        	});
	        }
	    }
    });
});

