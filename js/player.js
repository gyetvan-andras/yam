var BG_ITEM_KIND = {
	IMAGE:0,
	TRANSITION:1,
    VIDEO:2
};

var TRANSITION = {
	FADE:0,
};


var OBJ_TYPE = {
	SPRITE:1,
	TEXT:2,
	SHAPE:3,
	BACKGROUND:4,
};

var PA_TYPE = {
	MOVE:1, //x,y
	SCALE:2,//x,y
	ROTATE:3,//degree
	TINT:4,//endColor
	OPACITY:6,//endOpacity
	//-------- ADVANCED ANIMATIONS, WILL BE IMPLEMENTED LATER
	CHANGE_TEXTURE:5,//texture
	JUMP:7,//x,y,height,times
	BLINK:8,//times
};

var TL_CONST = {
	MAX_LENGTH_IN_SEC : 10,
	WIDTH_OF_SEC_IN_PX : 100,
	RULE_HEIGHT_IN_PX : 25,
	TIMELINE_HEIGHT_IN_PX : 512,
	CANVAS_COLOR:0x191919,
	LINE_COLOR:0x7F8C8D,
	MARKER_COLOR:0xFF8000,
	LINE_COLOR_STR:'#7F8C8D',
	CANVAS_WIDTH_IN_PX:1004,
	ITEM_HEIGHT_IN_PX:30,
	MIN_EVENT_LENTH_IN_MSEC:100
};

TL_CONST.MAX_WIDTH_IN_PX = TL_CONST.MAX_LENGTH_IN_SEC * TL_CONST.WIDTH_OF_SEC_IN_PX;
TL_CONST.WIDTH_OF_MSEC_IN_PX = TL_CONST.WIDTH_OF_SEC_IN_PX/1000;
TL_CONST.MAX_LENGTH_IN_MSEC = TL_CONST.MAX_LENGTH_IN_SEC*1000;

Object.defineProperties(PIXI.DisplayObject.prototype, {
     /**
     * The rotation of the object in degrees.
     *
     * @member {number}
     */
   rotationInDeg: {
        get:function() 
        {
            return this.rotation * PIXI.RAD_TO_DEG;
        },
        set: function(value)
        {
            this.rotation = value * PIXI.DEG_TO_RAD;
        }
    }
});

function PlayerEngine(holder) {
	'use strict';
	var self = this;
	self.holder = holder;
	self.ready = false;
	self.objectLayer = new PIXI.Container();
	self.animationManager = null;
	self.propertiesManager = null;
	self.loader = new PIXI.loaders.Loader("", 25);
	self.boundTickHandler = self.handleTick.bind(self);
	createjs.Ticker.framerate = 60;
	createjs.Ticker.paused = true;
	createjs.Ticker.addEventListener("tick", self.boundTickHandler);
}

PlayerEngine.prototype.resize = function(w,h, withCanvas) {
	'use strict';
	var self = this;
	if(self.previewRenderer) {
		var aspect = self.yam.width/self.yam.height;
		var nw = 0.0;
		var nh = 0.0;

		nw = w;
		nh = nw / aspect;
		// if(w > h) {
		// 	nw = w;
		// 	nh = nw / aspect;
		// } else {
		// 	nh = h;
		// 	nw = nh * aspect;
		// }
		console.log("Canvas:"+nw+" x "+nh);
		var sc = nw/self.yam.width;
		self.objectLayer.scale.x = sc;
		self.objectLayer.scale.y = sc;
		if(withCanvas) {
			self.previewRenderer.resize(nw,nh);
		}
	}
};

PlayerEngine.prototype.destroy = function() {
	'use strict';
	var self = this;
	if(self.previewRenderer) {
		self.holder.removeChild(self.previewRenderer.view);
		self.previewRenderer.destroy();
		self.previewRenderer = null;
	}
	createjs.Ticker.removeEventListener("tick", self.boundTickHandler);
	self.tweenTimeline.setPaused(true);
	createjs.Tween.removeAllTweens();
	createjs.Ticker.paused = true;
	self.tweenTimeline = null;
};

PlayerEngine.prototype.handleTick = function(event) {
	'use strict';
	var self = this;
	if(self.ready) {
		self.previewRenderer.render(self.objectLayer);
	}
};

PlayerEngine.prototype.targetByNodeId = function(target_id) {
	'use strict';
	var self = this;
	function lookForTarget(parent, target_id) {
		if(parent.node_id == target_id) return parent;
		var ret;
		for(var idx = 0; idx < parent.children.length; idx++) {
			ret = lookForTarget(parent.children[idx],target_id);
			if(ret) return ret;
		}	
		return null;
	}
	var ret = lookForTarget(self.objectLayer,target_id);
	return ret;
};


PlayerEngine.prototype.createTweenItem = function(json_item) {
	'use strict';
	var self = this;
	var target = self.targetByNodeId(json_item.target);
	var ret = new TweenItem(target,json_item.type);
	ret.start = json_item.start;
	ret.length = json_item.length;
	ret.params = json_item.params;
	return ret;
};

PlayerEngine.prototype.createTweens = function(json_item) {
	'use strict';
	var self = this;
	self.tweenMaker = new TweenMaker();
	for(var idx = 0; idx < self.yam.timeline.items.length;idx++) {
		var item = self.createTweenItem(self.yam.timeline.items[idx]);
		self.tweenMaker.items.push(item);
	}
	self.tweenMaker.layoutItems();
	var tweens = self.tweenMaker.createTweens(true);
	self.tweenTimeline = new createjs.Timeline(tweens,[],{loop:false, paused:true});
	self.tweenTimeline.on('change', function(event) {
		if(event.target.position === event.target.duration) {
			self.gotoTheBeginning();
		}
		self.handleBackgroundPlayback(event.target.position);
		// self.previewRenderer.render(self.objectLayer);
	});
};

PlayerEngine.prototype.handleBackgroundPlayback = function(msecTime) {
	'use strict';
	var self = this;
	self.moveBackgroundToTime(msecTime/1000);
};

PlayerEngine.prototype.start = function() {
	'use strict';
	var self = this;
	if(self.yam.backgroundItems.length > 0) {
		var bgi = self.yam.backgroundItems[0];
		if(bgi.itemKind === BG_ITEM_KIND.VIDEO) {
			var bgiobj = bgi.displayObject;
			bgiobj.visible = true;
			bgiobj.play();
		}
	}
	// self.tweenTimeline.setPaused(false);
	self.prepareBgiChain();
	self.ready = true;
	self.tweenTimeline.setPaused(false);
	createjs.Ticker.paused = false;
	var endTime = new Date().getTime();
	var time = endTime - self.startTime;
	console.log('Execution time: ' + time);
	if(self.loadedCallback) self.loadedCallback();
	// self.tweenTimeline.gotoAndPlay(0);
};

PlayerEngine.prototype.stop = function() {
	'use strict';
	var self = this;
	self.tweenTimeline.gotoAndStop(0);
};

PlayerEngine.prototype.createRenderer = function() {
	'use strict';
	var self = this;
	self.previewRenderer = new PIXI.CanvasRenderer(

	// self.previewRenderer = PIXI.autoDetectRenderer(
		self.yam.width,
		self.yam.height,
		{
			antialias:true,
			preserveDrawingBuffer:true,
			transparent:true
		}
	);

	self.previewRenderer.backgroundColor = 0xffffff;
	self.holder.appendChild(self.previewRenderer.view);
};

PlayerEngine.prototype.preloadYam = function() {
	'use strict';
	var self = this;
	var child;
	for(var idx = 0; idx < self.yam.objects.length;idx++) {
		self.preloadTextures(self.yam.objects[idx]);
	}
	for(var i = 0; i < self.yam.backgroundItems.length; i++) {
		var bgi = self.yam.backgroundItems[i];
		bgi.seq = i;
		self.preloadBackground(bgi);
	}
};

PlayerEngine.prototype.preloadBackground = function(bgi) {
	'use strict';
	var self = this;
	if(bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		for (var i=0; i < bgi.frames.length; i++) {
			self.loader.add(bgi.frames[i]);
		}
	} if(bgi.itemKind === BG_ITEM_KIND.IMAGE) {
		self.loader.add(bgi.url);
	}
};

PlayerEngine.prototype.preloadTextures = function(json_object) {
	'use strict';
	var self = this;
	switch(json_object.type) {
		case OBJ_TYPE.SPRITE:
			self.loader.add(json_object.texture);
			break;
		case OBJ_TYPE.TEXT:
			self.loader.add(json_object.texture);
			break;
		case OBJ_TYPE.SHAPE:
			self.loader.add(json_object.texture);
			break;
	}
	for(var idx = 0; idx < json_object.children.length;idx++) {
		self.preloadTextures(json_object.children[idx]);
	}
};

PlayerEngine.prototype.loadYam = function(yam,cb) {
	'use strict';
	// console.dir(yam);
	var self = this;
	self.loadedCallback = cb;
	self.startTime = new Date().getTime();
	self.yam = yam;
	self.width = yam.width;
	self.height = yam.height;

	self.loader.once('complete',function(loader, resources){
		self.resources = resources;
		self.buildYam();
	});

	self.preloadYam();

	self.loader.load();
};

PlayerEngine.prototype.buildYam = function() {
	'use strict';
	var self = this;
	var idx;
	var child;
	for(idx = 0; idx < self.yam.objects.length;idx++) {
		self.JSON2object(self.yam.objects[idx], self.objectLayer);
	}
	for(var i = 0; i < self.yam.backgroundItems.length; i++) {
		var bgi = self.yam.backgroundItems[i];
		bgi.seq = i;
		self.addBgi(bgi);
	}
	self.createRenderer();
	self.createTweens();
	self.start();
};

PlayerEngine.prototype.addBgi = function(bgi) {
	'use strict';
	var self = this;
	var displayObject = null;
	if(bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		var textureArray = [];
		for (var i=0; i < bgi.frames.length; i++) {
			textureArray.push(self.resources[bgi.frames[i]].texture);
		}

		var mc = new PIXI.extras.MovieClip(textureArray);
		mc.position.x = self.width/2;
		mc.position.y = self.height/2;
		mc.loop = false;
		displayObject = mc;
	} if(bgi.itemKind === BG_ITEM_KIND.IMAGE) {
		var image_path = bgi.url;
		var tex = self.resources[image_path].texture;
		var sprite = new PIXI.Sprite(tex);
		sprite.texturePath = image_path;
		displayObject = sprite;
	}
	if(displayObject) {
		displayObject.anchor.x = 0.5;
		displayObject.anchor.y = 0.5;
		displayObject.locked = false;
		displayObject.visible = false;	
		self.objectLayer.addChildAt(displayObject,0);
		bgi.displayObject = displayObject;
	}	
};

PlayerEngine.prototype.JSON2object = function(json_object,parent) {
	'use strict';
	var self = this;
	var ret;
	var tex = null;
	switch(json_object.type) {
		case OBJ_TYPE.SPRITE:
			tex = self.resources[json_object.texture].texture;
			ret = new PIXI.Sprite(tex);
			ret.texturePath = json_object.texture;
			break;
		case OBJ_TYPE.TEXT:
			tex = self.resources[json_object.texture].texture;
			ret = new PIXI.Sprite(tex);
			ret.texturePath = json_object.texture;
			break;
		case OBJ_TYPE.SHAPE:
			tex = self.resources[json_object.texture].texture;
			ret = new PIXI.Sprite(tex);
			ret.texturePath = json_object.texture;
			break;
	}
	if(ret) {
		ret.locked = true;
		ret.node_id = json_object.node_id;
		ret.node_name = json_object.node_name;
		ret.position = json_object.position;
		ret.type = json_object.type;
		ret.scale = json_object.scale;
		ret.alpha = json_object.alpha;
		ret.rotation = json_object.rotation;
		ret.pivot = json_object.pivot;
		ret.anchor.x = 0.5;
		ret.anchor.y = 0.5;
		if(json_object.tint) ret.tint = json_object.tint;
		if(parent) parent.addChild(ret);

		for(var idx = 0; idx < json_object.children.length;idx++) {
			var child = self.JSON2object(json_object.children[idx],ret);
		}
	}
	return ret;
};

PlayerEngine.prototype.applyTransition = function(bgi,progress) {
	'use strict';
	var self = this;
	var prevOpacity = 1 - progress;
	var nextOpacity = progress;
	var ps = bgi.prevSprite;
	var ns = bgi.nextSprite;
	if(ps) {
		ps.alpha = prevOpacity;
		ps.visible = true;
	}
	if(ns) {
		if(ns instanceof PIXI.extras.MovieClip) {
			if(!ns.playing) ns.play();
		}
		ns.alpha = nextOpacity;
		ns.visible = true;
	}
};

PlayerEngine.prototype.bgiAtTime = function(time) {
	'use strict';
	var self = this;
	var ct = 0;
	var ret = null;
	for (var i = 0; i < self.yam.backgroundItems.length; i++) {
		var bgi = self.yam.backgroundItems[i];
		ct += bgi.length;
		if(time < ct) {
			ret = bgi;
			break;
		}
	}
	return ret;
};

PlayerEngine.prototype.moveBackgroundToTime = function(time) {
	'use strict';
	var self = this;
	if(time === 0) {
		console.log('need to reset bg');
	}
	var bgi = self.bgiAtTime(time);
	if(bgi) {
		if(bgi.itemKind === BG_ITEM_KIND.TRANSITION) {
			var localTime = time - bgi.startsAt;
			if(localTime < 0) localTime = 0;
			if(localTime > bgi.length) localTime = bgi.length;
			var progress = localTime/bgi.length;
			self.applyTransition(bgi,progress);
		}
	}
};

PlayerEngine.prototype.gotoTheBeginning = function() {
	'use strict';
	var self = this;
	var bgi = null;
	for (var i = 0; i < self.yam.backgroundItems.length; i++) {
		bgi = self.yam.backgroundItems[i];
		var mc = bgi.displayObject;
		if(bgi.itemKind === BG_ITEM_KIND.VIDEO) {
			mc.gotoAndStop(0);
		}
		if(mc) {
			mc.visible = false;
			mc.alpha = 1;
		}
	}
	bgi = self.yam.backgroundItems[0];
	if(bgi) {
		if(bgi.itemKind === BG_ITEM_KIND.VIDEO) {
			var bgiobj = bgi.displayObject;
			bgiobj.visible = true;
			bgiobj.play();
		}
	}
	self.tweenTimeline.gotoAndPlay(0);
};

PlayerEngine.prototype.prepareBgiChain = function() {
	'use strict';
	var self = this;
	var ct = 0;
	var prev = null;
	var next = null;
	for (var i = 0; i < self.yam.backgroundItems.length; i++) {
		var bgi = self.yam.backgroundItems[i];
		if(i > 0) {
			prev = self.yam.backgroundItems[i-1];
			if(prev.itemKind !== BG_ITEM_KIND.TRANSITION) {
				bgi.prevSprite = prev.displayObject;
			}
		}
		if(i < self.yam.backgroundItems.length-1) {
			next = self.yam.backgroundItems[i+1];
			if(next.itemKind !== BG_ITEM_KIND.TRANSITION) {
				bgi.nextSprite = next.displayObject;
			}
		}
		bgi.startsAt = ct;
		bgi.endsAt = ct + bgi.length;
		ct += bgi.length;
	}
};



