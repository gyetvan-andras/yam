function BgiDisplayObject(bgi,core,prev) {
	'use strict';
	var self = this;
	self.bgi = bgi;
	self.core = core;
	self.paused = true;
	self.prev = prev;
	self.isLoaded = false;

	if(prev && prev.bgi.itemKind == BG_ITEM_KIND.TRANSITION) {
		prev.next = self;
	}
	if(self.bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		self.addVideoBackground();
	} else if(self.bgi.itemKind === BG_ITEM_KIND.IMAGE) {
		self.addImageBackground();
	} if(self.bgi.itemKind === BG_ITEM_KIND.TRANSITION) {
		self.isLoaded = true;
	}
}

BgiDisplayObject.prototype.remove = function() {
	'use strict';
	var self = this;
	if(self.sprite) {
		self.sprite.parent.removeChild(self.sprite);
				
	}
	self.sprite = null;
	self.bgi = null;
	self.core = null;
	if(self.prev) self.prev.next = self.next;
	self.prev = null;
	if(self.next) self.next.prev = self.prev;
	self.next = null;
	self.videoTexture = null;
};

BgiDisplayObject.prototype.createSpriteFormBgi = function() {
	'use strict';
	var self = this;
	var image_path = self.bgi.url;
	var image_texture = PIXI.Texture.fromImage(image_path);
	image_texture.on('update', function() {
		self.core.manualRefresh();
	});
	var sprite = self.core.createSprite(image_texture,image_path);
	sprite.locked = false;
	sprite.visible = false;	
	return sprite;
};

BgiDisplayObject.prototype.addImageBackground = function() {
	'use strict';
	var self = this;
	var sprite = self.createSpriteFormBgi();
	self.core.objectLayer.addChildAt(sprite,0);
	self.sprite = sprite;
	self.isLoaded = true;
};

BgiDisplayObject.prototype.createVideoPlaceholder = function() {
	'use strict';
	var self = this;
	var sprite = self.createSpriteFormBgi();
	sprite.width = self.core.yamProperties.frameWidth;
	sprite.height = self.core.yamProperties.frameHeight;
	// sprite.scale.y = sprite.scale.x;
	var fontName = 'Verdana';
	var fontSize = 64;
	var text = new TextFx('LOADING...!');
	text.anchor.x = 0.5;
	text.anchor.y = 0.5;
	text.locked = false;
	var style = text.style;
	style.fontFamily = fontName;
	style.fontWeight = 600;
	style.fontStyle = 'normal';
	style.fontSize = fontSize;
	style.fillColor = 0xffffff;
	style.gradientFill = false;
    style.fill = true;
    style.fillColor = '#FFFFFF';
    style.strokeColor = '#000000'; 
    style.strokeThickness = 2;

	text.style = style;

	setTimeout(function() {
		text.scale.x = 1/sprite.scale.x;
		text.scale.y = 1/sprite.scale.y;
		self.core.manualRefresh();
		text = null;
	},100);


	text.type = OBJ_TYPE.TEXT;

	sprite.addChild(text);

	return sprite;
};

BgiDisplayObject.prototype.addVideoBackground = function() {
	'use strict';
	var self = this;
	var video = document.createElement('video');
	self.placeholder = self.createVideoPlaceholder();
	self.core.objectLayer.addChildAt(self.placeholder,0);
	video.autoplay = false;
	// video.addEventListener("play", function( event ) {
	// 	console.log('play of '+self.index);
	// });
	// video.addEventListener("playing", function( event ) {
	// 	console.log('playing of '+self.index);
	// });
	// video.addEventListener("pause", function( event ) {
	// 	console.log('pause of '+self.index);
	// });
	// video.addEventListener("timeupdate", function( event ) {
	// 	console.log('timeupdate of '+self.index);
	// });


	video.muted = true;
	video.src = self.bgi.video_src;
	self.videoTexture = PIXI.VideoBaseTexture.fromVideo(video);
	self.videoTexture.on('loaded', function(src) {
		self.placeholder.parent.removeChild(self.placeholder);
		self.sprite = self.videoSprite;
		self.sprite.alpha = self.placeholder.alpha;
		self.sprite.visible = self.placeholder.visible;
		self.placeholder = null;
		self.core.objectLayer.addChildAt(self.videoSprite,0);
		self.isLoaded = true;
		self.video.pause();
	});
	var texture = new PIXI.Texture(self.videoTexture);
	self.videoSprite = new PIXI.Sprite(texture);
	self.videoSprite.node_name = "BG#";
	self.videoSprite.type = OBJ_TYPE.BACKGROUND;
	self.videoSprite.position.x = self.core.yamProperties.frameWidth/2;
	self.videoSprite.position.y = self.core.yamProperties.frameHeight/2;

	self.videoSprite.anchor.x = 0.5;
	self.videoSprite.anchor.y = 0.5;
	self.videoSprite.locked = false;

	self.videoSprite.visible = false;	
	// self.core.objectLayer.addChildAt(sprite,0);

	video.currentTime = self.bgi.startTime;
	self.sprite = self.placeholder;
	self.video = video;
};

BgiDisplayObject.prototype.applyTransition = function(progress) {
	'use strict';
	var self = this;
	var prevOpacity = 1 - progress;
	var nextOpacity = progress;
	var ps = self.prevSprite();
	var ns = self.nextSprite();
	if(ps) {
		ps.alpha = prevOpacity;
		ps.visible = true;
	}
	if(ns) {
		ns.alpha = nextOpacity;
		ns.visible = true;
	}
};

BgiDisplayObject.prototype.moveToTime = function(time) {
	'use strict';
	var self = this;
	self.forcedMoveToTime(time,false);
};

BgiDisplayObject.prototype.forcedMoveToTime = function(time,forced) {
	'use strict';
	console.log("forcedMoveToTime("+forced+")");
	var self = this;
	var localTime = time - self.bgi.startsAt;
	if(localTime < 0) localTime = 0;
	if(localTime > self.bgi.length) localTime = self.bgi.length;
	if(!self.isLoaded) {
		if(self.sprite.alpha < 1) self.sprite.alpha = 1;
	} else if(self.bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		if(self.sprite.alpha < 1) self.sprite.alpha = 1;
		if(self.core.paused || forced) {
			self.pauseAndMove(localTime);
			// self.forcedMoveVideoToTime(localTime,forced);
			// self.video.currentTime = localTime + self.bgi.startTime;
			// self.videoTexture.update();
			// self.pauseVideo();
		} else {

			self.forcedMoveVideoToTime(localTime,forced);
			if(self.video.paused && !self.paused) {
				console.log('play!');
				self.video.play();
			}
		}
	} else if(self.bgi.itemKind === BG_ITEM_KIND.IMAGE) {
		if(self.sprite.alpha < 1) self.sprite.alpha = 1;
	} else if(self.bgi.itemKind === BG_ITEM_KIND.TRANSITION) {
		var progress = localTime/self.bgi.length;
		self.applyTransition(progress);
	}

};

BgiDisplayObject.prototype.pauseAndMove = function(localTime) {
	'use strict';
	var self = this;
	console.log("pause and move");
	self.video.pause();
	setTimeout(function() {
		self.video.currentTime = localTime + self.bgi.startTime;
		self.videoTexture.update();
	}, 100);
};

BgiDisplayObject.prototype.moveVideoToTime = function(time) {
	'use strict';
	var self = this;
	self.forcedMoveVideoToTime(time,false);
};

BgiDisplayObject.prototype.forcedMoveVideoToTime = function(time,forced) {
	'use strict';
	var self = this;
	if(!self.isLoaded) return;
	if(forced) {
		self.video.currentTime = time + self.bgi.startTime;
		// self.videoTexture.update();
	} else {
		var ct = self.video.currentTime;
		if(ct < self.bgi.startTime) {
			self.video.currentTime = time + self.bgi.startTime;
		} else if(ct > (self.bgi.startTime + self.bgi.length)) {
			self.video.currentTime = time + self.bgi.startTime;
		}
	}
};

BgiDisplayObject.prototype.prevSprite = function() {
	'use strict';
	var self = this;
	if(self.prev && self.prev.sprite) return self.prev.sprite;
	return null;
};

BgiDisplayObject.prototype.nextSprite = function() {
	'use strict';
	var self = this;
	if(self.next && self.next.sprite) return self.next.sprite;
	return null;
};

BgiDisplayObject.prototype.isNextTransition = function() {
	'use strict';
	var self = this;
	if(self.next && self.next.bgi.itemKind === BG_ITEM_KIND.TRANSITION) return true;
	return false;
};

BgiDisplayObject.prototype.resetVideo = function() {
	'use strict';
	var self = this;
	if(self.bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		self.video.currentTime = self.bgi.startTime;
		self.pauseVideo();
	}
};

BgiDisplayObject.prototype.pauseVideo = function() {
	'use strict';
	var self = this;
	if(self.video) {
		setTimeout(function() {
			self.video.pause();
			self.videoTexture.update();
			console.log("PAUSE");
		}, 100);
	}
};

BgiDisplayObject.prototype.startVideo = function() {
	'use strict';
	var self = this;
	if(self.bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		self.video.play();
		self.videoTexture.update();
	}
};

BgiDisplayObject.prototype.stop = function() {
	'use strict';
	var self = this;
	self.paused = true;
	if(self.bgi.itemKind === BG_ITEM_KIND.TRANSITION) {
		var ps = self.prevSprite();
		if(ps) {
			ps.visible = false;
		}
		if(self.prev) self.prev.resetVideo();
		return;
	}
	if(!self.isNextTransition()) {
		self.sprite.visible = false;
		self.resetVideo();
	}
};

BgiDisplayObject.prototype.start = function(time) {
	'use strict';
	var self = this;
	self.paused = false;
	if(self.bgi.itemKind === BG_ITEM_KIND.TRANSITION) {
		self.moveToTime(time);
		return;
	}
	self.sprite.visible = true;	
	self.startVideo();
};

BgiDisplayObject.prototype.pause = function() {
	'use strict';
	var self = this;
	self.paused = true;
	self.pauseVideo();
	// if(self.bgi.itemKind === BG_ITEM_KIND.VIDEO) {
	// 	self.video.pause();
	// }	
};

BgiDisplayObject.prototype.play = function() {
	'use strict';
	var self = this;
	self.paused = false;
	if(self.bgi.itemKind === BG_ITEM_KIND.VIDEO) {
		self.video.play();
	}	
};

PECore.prototype.bgiAtTime = function(time) {
	'use strict';
	var self = this;
	var ct = 0;
	var ret = null;
	for (var i = 0; i < self.app.propertiesManager.backgroundItems.length; i++) {
		var bgi = self.app.propertiesManager.backgroundItems[i];
		ct += bgi.length;
		if(time < ct) {
			ret = bgi;
			break;
		}
	}
	return ret;
};

PECore.prototype.calculateBgiTimes = function() {
	'use strict';
	var self = this;
	var ct = 0;
	for (var i = 0; i < self.app.propertiesManager.backgroundItems.length; i++) {
		var bgi = self.app.propertiesManager.backgroundItems[i];
		bgi.startsAt = ct;
		bgi.endsAt = ct + bgi.length;
		ct += bgi.length;
	}
};

PECore.prototype.ensureBgis = function() {
	'use strict';
	var self = this;
	var prev = null;
	for (var i = 0; i < self.app.propertiesManager.backgroundItems.length; i++) {
		var bgi = self.app.propertiesManager.backgroundItems[i];
		if(bgi.displayObject) {
			prev = bgi.displayObject;
			continue;
		}
		bgi.displayObject = new BgiDisplayObject(bgi,self,prev);
		bgi.displayObject.index = i + 1;
		prev = bgi.displayObject;
	}		
};

PECore.prototype.moveBackgroundToTime = function(time) {
	'use strict';
	// console.log('moving time');
	var self = this;
	self.ensureBgis();
	self.calculateBgiTimes();
	var bgi = self.bgiAtTime(time);
	if(self.currentBgi === bgi) {
		if(bgi) bgi.displayObject.moveToTime(time);
	} else {
		if(self.currentBgi && self.currentBgi.displayObject) self.currentBgi.displayObject.stop();
		self.currentBgi = bgi;
		if(bgi) bgi.displayObject.start(time);
	}
};

PECore.prototype.removeBackgroundItem = function(bgi) {
    'use strict';
    var self = this;
    if(bgi.displayObject) {
        bgi.displayObject.remove();
    }
	if(self.currentBgi === bgi) {
		self.currentBgi = null;
	}
};

PECore.prototype.showAllBgi = function() {
	'use strict';
	var self = this;
	self.moveBackgroundToTime(0);

	// self.ensureBgis();
	// self.calculateBgiTimes();
	// self.app.propertiesManager.backgroundItems.forEach(function(bgi,index) {
	// 	bgi.displayObject.forcedMoveToTime(bgi.startsAt,true);
	// 	bgi.displayObject.pause();
	// });
	// setTimeout(function() {
		self.app.propertiesManager.backgroundItems.forEach(function(bgi,index) {
			if(bgi.displayObject.sprite) {
				bgi.displayObject.sprite.alpha = 0.7;
				bgi.displayObject.sprite.visible = true;
			}
		});
		self.manualRefresh();
	// },250);
};

PECore.prototype.stopBackgroundPlayback = function() {
	'use strict';
	var self = this;
	self.app.propertiesManager.backgroundItems.forEach(function(bgi,index) {
		bgi.displayObject.forcedMoveToTime(bgi.startsAt,true);
		bgi.displayObject.pause();
	});
	self.app.propertiesManager.backgroundItems.forEach(function(bgi,index) {
		if(index > 0 && bgi.displayObject.sprite) {
			bgi.displayObject.sprite.alpha = 0;
			bgi.displayObject.sprite.visible = false;
		}
	});
	self.manualRefresh();
	// var bgi = self.bgiAtTime(0);
	// if(bgi) {
	// 	bgi.displayObject.moveToTime(0);
	// 	// setTimeout(function() {
	// 	// 	bgi.displayObject.pause();
	// 	// },100);
	// }
};

PECore.prototype.startBackgroundPlayback = function() {
	'use strict';
	var self = this;
	self.ensureBgis();
	self.calculateBgiTimes();
	self.app.propertiesManager.backgroundItems.forEach(function(bgi) {
		bgi.displayObject.forcedMoveToTime(bgi.startsAt,true);
		bgi.displayObject.pause();
	});
	self.app.propertiesManager.backgroundItems.forEach(function(bgi,index) {
		if(index > 0 && bgi.displayObject.sprite) {
			bgi.displayObject.sprite.alpha = 0;
			bgi.displayObject.sprite.visible = false;
		}
	});
	var bgi = self.bgiAtTime(0);
	if(bgi) {
		bgi.displayObject.play();
	}
};
