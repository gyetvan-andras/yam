var assets = require('./assets');
var yams = require('./yams');
var user = require('./user');
var uploads = require('./uploads');
var publisher = require('./publisher');
var fonts = require('./fonts');

// var player = require('./player');
var io = {};

var console = process.console;

module.exports = function(express,_io) {
    router = express.Router();
    setupRouter(router);
    setupSocketIO(_io);
    return router;
};

function setupSocketIO(_io) {
    io = _io;
    io.on('connection', function(socket){
        console.info('a user connected');
        socket.on('disconnect', function(){
            console.info('user disconnected');
        });
    });

}
function setupRouter(router) {
/**
    returns a list of available asset groups as an array.
    each item contains:
    {
        id:string,      -- id of the group
        name:string,    -- name of the group
        count:numeric   -- nember of items in the group
    }
*/
router.get('/assets', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.getGroups(user_id,function(err,ret) {
        	    if(err) {
        	        console.error(err);
        	        res.status(500).send({error:err});
        	    } else {
        	        res.json(ret);
        	    }
            });
        }
    });
});

//ret.push({name:row.name, thumb_url:row.thumb_url, content:row.content});
/**
    returns a list of available templater by template type as an array.
    each item contains:
    {
        name:string,        -- name of the template
        thumb_url:string    -- template thumbnail url
        content:string      -- template json
    }
*/
router.get('/templates/:type', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.getTemplates(parseInt(req.params.type),function(err,ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

//exports.saveTemplates = function(template_meta, cb) {
/**
    Saves a template
    The request body must contain the following parameters:
    req.body.template_meta - meta information for the asset
    {
        thumbnail:base64 coded PNG  -- the template thumbnail
        name:string                 -- tempate name
        type:integer                -- template type: 0 text, 1 shape
    }
    req.body.template_json:string   -- template content json 
*/
router.post('/templates', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.saveTemplate(JSON.parse(req.body.template_meta),req.body.template_json, req.body.template_thumb,function(err,ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.send("OK");
                }
            });
        }
    });
});

/**
    Saves an asset for the user
    The request body must contain the following parameters:
    req.body.asset_meta - meta information for the asset
    {
        name:string     -- name
        type:numeric    -- type of the asset. For values see below
    }
    req.body.asset_content - the content of the asset base64 coded

    The call will result the saved assets URL (relative to the server root) as res.path
    The asset will be available in the usr's assets group
*/
router.post('/assets', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.saveAsset(user_id,JSON.parse(req.body.asset_meta), req.body.asset_content,function(err,ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Deletes an asset from the user's asset group. Actually it does not delete, just makes it invisible when getting the group items.
*/
router.delete('/assets/:id', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.deleteAsset(user_id,req.params.id,function(err,ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});
/**
    returns a list of items in a group as an array. The parameter is the group id returned by /asset.
    each item contains:
    {
         name:string,   -- name of the asset
         url:string,    -- url of the assets. It is a relative path to the server root, for example /assets/image.png
         type:numeric   -- the type of the assets.
    }
    type can be:
         0 - image
         1 - sound
         2 - particle
         3 - animation (group of other assets with timeline)
         4 - video
*/

router.get('/assets/:group', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.getGroupItems(user_id,req.params.group, function(err,ret) {
        	    if(err) {
        	        console.error(err);
        	        res.status(500).send({error:err.stack});
        	    } else {
        	        res.json(ret);
        	    }
            });
        }
    });
});

/**
    Search for assets by text. Returns a list of items as an array. The parameter is the group id returned by /asset.
    each item contains:
    {
         name:string,   -- name of the asset
         url:string,    -- url of the assets. It is a relative path to the server root, for example /assets/image.png
         type:numeric   -- the type of the assets.
    }
    type can be:
         0 - image
         1 - sound
         2 - particle
         3 - animation (group of other assets with timeline)
         4 - video
*/
router.get('/search_assets/:text', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            assets.searchItems(user_id,req.params.text, function(err,ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Saves a new YAM file and process it (extract referenced assets)
    The request body must contain the following parameters:
    - req.body.yam_meta : the metadata of the YAM, contains the following properties:
    {
        name:string,    -- name
        desc:string,    -- description, should be processed for #-tags and @-refs
    }
    - req.body.yam_content : this is the JSON representation of an edited YAM

    returns the ID of the YAM
*/
router.post('/yams', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            yams.save(user_id, null, JSON.parse(req.body.yam_meta), req.body.yam_content, function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Updates YAM file and process it (extract referenced assets)
    The request body must contain the following parameters:
    - req.body.yam_meta : the metadata of the YAM, contains the following properties:
    {
        name:string,    -- name
        desc:string,    -- description, should be processed for #-tags and @-refs
    }
    - req.body.yam_content : this is the JSON representation of an edited YAM

    returns the ID of the YAM
*/
router.post('/yams/:id', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            yams.save(user_id, req.params.id, JSON.parse(req.body.yam_meta), req.body.yam_content, function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Request to start a publish session
    No parameters required, returns session;
*/
router.get('/publish/start', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            publisher.start(function(err, session) {
            if(err) {
                console.error(err);
                res.status(500).send({error:err.stack});
            } else {
                res.json({session:session});
            }
            });
        }
    });
});

/**
    Request to cancel a publish session
*/
router.delete('/publish/cancel/:session', function (req, res, next){
});

/**
    Generates frames from the background video.
    Returns an array of generated frmae fiel names
    The request body must contain the following parameters:
    - req.body.session: 
    - req.body.filename;
    - req.body.prefix;
    - req.body.start;
    - req.body.duration;
*/
router.post('/publish/frames', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            publisher.createFrames(req,res);
        }
    });
});

/**
    Saves a texture
    The request body must contain the following parameters:
    - req.body.session: 
    - req.body.texture_content - the content of the texture base64 coded

    The call will result the saved texture URL (relative to the server root) as res.path
*/
router.post('/publish/texture', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            publisher.saveTexture(req.body.session,req.body.texture_content, function(err,ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Publish a YAM. 
    - req.body.session
    - req.body.yam_content
    returns the ID and path of the YAM
*/
router.post('/publish/yam', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            publisher.publishYam(user_id, req.body.session, req.body.yam_content, function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Returns an array of all published YAM by user.
    Each item will contain:
    {
        user: string,       -- user, who published the YAM
        created:date        -- creation date
        name: string,       -- name
        desc: string,       -- description
        session_id:string   -- session_id of the published YAM
    }
*/
router.get('/published/:user_id', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            publisher.getYams(req.params.user_id, function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Returns an array of all published YAM of all user.
    Each item will contain:
    {
        user: string,       -- user, who published the YAM
        created:date        -- creation date
        name: string,       -- name
        desc: string,       -- description
        session_id:string   -- session_id of the published YAM
    }
*/
router.get('/published', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            publisher.getAllYams(function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Returns an array of available YAMs.
    Each item will contain:
    {
        id: numeric,    -- ID of the YAM
        created:date    -- creation date
        name: string,   -- name
        desc: string,   -- description
    }
*/
router.get('/yams', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).json({error:err.stack});
        } else {
            yams.getYams(user_id, function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).json({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Returns a YAM by id.
*/
router.get('/yams/:id', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).json({error:err.stack});
        } else {
            yams.getYamById(user_id, req.params.id,function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).json({error:err.stack});
                } else {
                    res.json(JSON.parse(ret));
                }
            });
        }
    });
});

/**
    Deletes a YAM by id.
*/
router.delete('/yams/:id', function (req, res, next){
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).send({error:err.stack});
        } else {
            yams.deleteYamById(user_id, req.params.id,function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).send({error:err.stack});
                } else {
                    res.json(ret);
                }
            });
        }
    });
});

/**
    Handles file uploads  
*/
router.post('/uploads', function(req,res,next) {
    uploads.upload(req,res,io);
});

router.delete('/uploads/:slot', function(req,res,next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).json({error:err.stack});
        } else {
            uploads.cancelSlot(req.params.slot,res);
        }
    });
});

router.get('/uploads/newslot/', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).json({error:err.stack});
        } else {
            uploads.requestSlot(req,res);
        }
    });
});

router.get('/uploads/process/:slot', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).json({error:err.stack});
        } else {
            uploads.processSlot(req.params.slot,res,io);
        }
    });
});


router.get('/fonts', function (req, res, next) {
    user.getUserId(req,function(err,user_id) {
        if(err) {
            console.error(err);
            res.status(500).json({error:err.stack});
        } else {
            fonts.getFonts(user_id, function(err, ret) {
                if(err) {
                    console.error(err);
                    res.status(500).json({error:err.stack});
                } else {
                    console.dir(ret);
                    res.json(ret);                    
                }
            });
        }
    });
});

// /**
//     YAM player frame source  
//     ./published/5508ac12-3239-498b-abff-5e8f58ae64da/ad109807-938a-4b92-99bf-2c2aaa825411.yam
// */


// router.get('/player/:session_id', function (req, res, next) {
//     var session_id = req.params.session_id;
//     player.getPlayerFor(session_id, function(err, src) {
//         if(err) {
//             console.error(err);
//             res.status(500).json({error:err.stack});
//         } else {
//             res.send(src);
//         }
//     });
// });

}