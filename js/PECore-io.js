
PECore.prototype.object2JSON = function(obj,recursive) {
	'use strict';
	var ret = {
	};

	ret.node_id = obj.node_id;
	ret.node_name = obj.node_name;
	ret.position = obj.position;
	ret.type = obj.type;
	ret.scale = obj.scale;
	ret.alpha = obj.alpha;
	ret.rotation = obj.rotation;
	ret.pivot = obj.pivot;
	if(obj.type == OBJ_TYPE.TEXT) {
		ret.text = obj.text;
		ret.style = obj.style;
		ret.width = obj.width;
		ret.height = obj.height;
	}
	if(obj.type == OBJ_TYPE.SHAPE) {
		ret.kind = obj.kind;
		ret.points = obj.points;
		ret.style = obj.style;
	}

	if(obj.tint) {
		ret.tint = obj.tint;
	}
	if(obj.texturePath) {
		ret.texture = obj.texturePath;
	}
	if(obj.type == OBJ_TYPE.SPRITE) {
		ret.presetMode = obj.presetMode;
	}
	ret.children = [];
	if(recursive) {
		for(var idx = 0; idx < obj.children.length;idx++) {
			var child = this.object2JSON(obj.children[idx],recursive);
			ret.children.push(child);
		}
	}
	return ret;
};

PECore.prototype.collectSprite = function(obj) {
	'use strict';
	var self = this;
	switch(obj.type) {
		case OBJ_TYPE.TEXT:
			self.sprites.push(obj);
			break;	
		case OBJ_TYPE.SHAPE:
			self.sprites.push(obj);
			break;	
		case OBJ_TYPE.SPRITE:
			self.sprites.push(obj);
			break;	
	}
	for(var idx = 0; idx < obj.children.length;idx++) {
		self.collectSprite(obj.children[idx]);
	}
};

PECore.prototype.collectSprites = function() {
	'use strict';
	var self = this;
	self.sprites = [];
	for(var idx = 0; idx < self.objectLayer.children.length;idx++) {
		self.collectSprite(self.objectLayer.children[idx]);
	}	
	return self.sprites;
};

PECore.prototype.save = function() {
	'use strict';
	var ret = {
		objects:[],
	};
	ret.id = this.yamProperties.id;
	ret.name = this.yamProperties.name;
	ret.desc = this.yamProperties.desc;
	ret.width = this.yamProperties.frameWidth;
	ret.height = this.yamProperties.frameHeight;
	// ret.offset = this.hudLayer.position;
	for(var idx = 0; idx < this.objectLayer.children.length;idx++) {
		var obj = this.object2JSON(this.objectLayer.children[idx],true);
		ret.objects.push(obj);
	}
	ret.timeline = this.animationManager.timeline2JSON();
	ret.backgroundItems = this.app.propertiesManager.backgroundItems;
	return JSON.stringify(ret,function(key, value) {
		if(key === "displayObject") {
			return undefined;
		} else {
			return value;			
		}
	},'\t');	
};

PECore.prototype.JSON2object = function(json_object,parent,cb) {
	'use strict';
	var self = this;
	var ret;
	switch(json_object.type) {
		case OBJ_TYPE.SPRITE:
			var tex = PIXI.Texture.fromImage(json_object.texture);
			PIXI.Texture.addTextureToCache(tex, json_object.texture);
			ret = new PIXI.Sprite(tex);
			ret.texturePath = json_object.texture;
			tex.on('update', function() {
				// console.log("tex updated");
				self.manualRefresh();
			});
			if(json_object.presetMode) {
				ret.presetMode = json_object.presetMode;
			}
			break;
		case OBJ_TYPE.TEXT:
			var text = new TextFx(json_object.text);
			ret = text;
			text.style = json_object.style;
			text.width = json_object.width;
			text.height = json_object.height;
			if(text.style.googleFont) {
				self.setTextFont(text.style.googleFontFamily, text.style.googleFontVariant, text);
			}

			break;
		case OBJ_TYPE.SHAPE:
			var sfx = new ShapeFx();
			ret = sfx;
			sfx.kind = json_object.kind;
			sfx.points = json_object.points;
			sfx.style = json_object.style;
			break;
	}
	if(ret) {
		ret.locked = false;
		ret.node_id = json_object.node_id;
		if(this.nextObjectId < ret.node_id) this.nextObjectId = ret.node_id;
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
			var child = this.JSON2object(json_object.children[idx],ret);
		}
	}
	if(json_object.presetMode) {
		// console.log("apply preset " + json_object.presetMode);
		if(cb) {
			self.applyPresetToSprite(ret.presetMode,null,ret, function() {
				cb(ret);
			});
		} else {
			PECore.spritesToApplyPreset.push(ret);
		}
	} else {
		if(cb) cb(ret);
	}
	return ret;
};


PECore.prototype.loadYam = function(yam) {
	'use strict';
	PECore.spritesToApplyPreset = [];
	PECore.textFxsToUpdate = [];
	this.nextObjectId = -1;
	this.activeTarget = null;
	var idx;
	var child;
	this.selectionHandler.assignTo(this.activeTarget);
	for(idx = this.objectLayer.children.length - 1; idx >= 0;idx--) {
		child = this.objectLayer.removeChild(this.objectLayer.children[idx]);
		// child.destroy(true);
	}

	this.yamProperties.id = yam.id;
	this.yamProperties.name = yam.name || 'YAM Name';
	this.yamProperties.desc = yam.desc || 'YAM Description';
	this.yamProperties.frameWidth = yam.width;
	this.yamProperties.frameHeight = yam.height;

	this.stageRect.setDimension(yam.width,yam.height);

	// this.hudLayer.position = yam.offset;

	// this.scrollableStage.position.x =  -this.hudLayer.position.x;
	// this.scrollableStage.position.y = -this.hudLayer.position.y;

	for(idx = 0; idx < yam.objects.length;idx++) {
		child = this.JSON2object(yam.objects[idx],this.objectLayer);
		// if(child) this.objectLayer.addChild(child);
	}

	this.nextObjectId++;
	this.setupDatGui();
	this.loadHierarchyTree();
	this.manualRefresh();
	this.selectDisplayObject(null);
	this.updateGuiControllers();
	this.animationManager.JSON2timeline(yam.timeline);	
	this.app.propertiesManager.backgroundItems = yam.backgroundItems;

	var self = this;
	function applyPreset(sprite) {
		if(sprite) {
			self.applyPresetToSprite(sprite.presetMode,null,sprite, function() {
				applyPreset(PECore.spritesToApplyPreset.pop());
			});
		}
	}
	applyPreset(PECore.spritesToApplyPreset.pop());
};

PECore.prototype.targetByNodeId = function(target_id) {
	'use strict';
	function lookForTarget(parent, target_id) {
		if(parent.node_id == target_id) return parent;
		var ret;
		for(var idx = 0; idx < parent.children.length; idx++) {
			ret = lookForTarget(parent.children[idx],target_id);
			if(ret) return ret;
		}	
		return null;
	}
	var ret = lookForTarget(this.objectLayer,target_id);
	return ret;
};

PECore.prototype.uploadYam = function() {
	'use strict';
	var self = this;
	var yam = this.save();
	var meta = JSON.stringify({name:this.yamProperties.name, desc:this.yamProperties.desc});
	if(this.yamProperties.id) {
		yamPost("api/yams/"+this.yamProperties.id,{ yam_meta: meta, yam_content: yam },function(res) {
		// $.post( "api/yams/"+this.yamProperties.id+'/?token=secret', { yam_meta: meta, yam_content: yam }, function(res) {
			self.yamProperties.id = res.id;
		} )
		.fail(function(err) {
			console.log("FAILED to update YAM! - "+err);
		}); 
	} else {
		yamPost("api/yams/",{ yam_meta: meta, yam_content: yam },function(res) {
		// $.post( "api/yams"+'/?token=secret', { yam_meta: meta, yam_content: yam }, function(res) {
			self.yamProperties.id = res.id;
		} )
		.fail(function(err) {
			console.log("FAILED to save YAM! - "+err);
		}); 
	}
};