function PEAnimationItem(owner, target, manager, type) {
	'use strict';
	var self = this;

	TweenItem.call(target, type);

	this.dragMode = AI_CONST.MOVE_OUTSIDE;
	this.manager = manager;
	this.target = target;

	this._selected = false;
	this.graphics = new PIXI.Graphics();
	this.graphics.interactive = true;

	owner.addChild(this.graphics);

	this.type = type;//PA_TYPE.MOVE;

	this.start = 0;	
	this.length = 1000;
	this.updateVisuals();

	function mouseDown(event) {
    	if(self.manager.playing) {
    		event.stopped = true;
    		return;
    	}
    	// console.log("mouse-dn - "+self.hovered);
    	self.manager.selectItem(self);
    	self.dragMode = self.mapMousePos(event);
    	self.startX = event.data.getLocalPosition(self.graphics.parent).x;
    	event.stopped = true;
	}
	function mouseUp(event) {
    	if(self.manager.playing) {
    		// event.stopped = true;
    		return;
    	}
    	// console.log("mouse-up - "+self.hovered);
    	// if(self.manager.hoveredItem == self)
    	if(self.selected) {
			self.dragMode = AI_CONST.MOVE_OUTSIDE;
        	// event.stopped = true;
        	self.hovered = false;
        }
	}
	function mouseMove(event) {
		if(self.manager.core.app.modalOpen) return;
    	if(self.manager.playing) {
    		return;
    	}
    	// console.log("mouse-move - "+self.hovered);
    	var newX, newStart, newEndAt,newLength,deltaStart;
    	if(self.dragMode != AI_CONST.MOVE_OUTSIDE && self.selected) {
    		// event.stopped = true;
    	    var pos = event.data.getLocalPosition(self.graphics.parent);
    	    var nowX = event.data.getLocalPosition(self.graphics.parent).x;
    	    var deltaX = self.startX - nowX;
    	    self.startX = nowX;
        	switch(self.dragMode) {
				case AI_CONST.MOVE_START:
					newX = self.graphics.position.x - deltaX;
					newStart = newX/TL_CONST.WIDTH_OF_MSEC_IN_PX;
					deltaStart = self.start - newStart;
					newLength = self.length + deltaStart;
					if(newLength >= TL_CONST.MIN_EVENT_LENTH_IN_MSEC) {
						self.start = newStart;
						// newLength = TL_CONST.MIN_EVENT_LENTH_IN_MSEC;
						self.length = newLength;
						self.manager.itemChanged(self,AI_CONST.MOVE_START);
					}
				break;
				case AI_CONST.MOVE_DRAG:
					// self.offsetX = pos.x;
					newX = self.graphics.position.x - deltaX;
					newStart = newX/TL_CONST.WIDTH_OF_MSEC_IN_PX;
					if(newStart >= 0 && (newStart + self.length) < TL_CONST.MAX_LENGTH_IN_MSEC) {
						self.start = newStart;
						self.manager.itemChanged(self,AI_CONST.MOVE_DRAG);
					}
				break;
				case AI_CONST.MOVE_END:
					// self.offsetX = self.width - pos.x;
					newEndAt = nowX/TL_CONST.WIDTH_OF_MSEC_IN_PX;
					if(newEndAt <= TL_CONST.MAX_LENGTH_IN_MSEC) {
						newLength = newEndAt - self.start;
						if(newLength >= TL_CONST.MIN_EVENT_LENTH_IN_MSEC) {
							self.length = newLength;
							self.manager.itemChanged(self,AI_CONST.MOVE_END);
						}
					}
				break;
        	}
        	// event.stopped = true;
    	} else {
        	var mp = self.mapMousePos(event);
        	if(mp == AI_CONST.MOVE_OUTSIDE) {
	        	if(self.hovered) {
		        	self.hovered = false;
		        	self.updateVisuals();
		        	document.body.style.cursor = 'default';
		        }
		        return;
        	} else {
	        	if(!self.hovered) {
		        	self.hovered = true;
		        	self.updateVisuals();
		        }
		        // event.stopped = true;
        	}
			var cursor = 'default';
        	switch(mp) {
				case AI_CONST.MOVE_START:
		        	cursor = 'w-resize';
				break;
				case AI_CONST.MOVE_DRAG:
		        	cursor = 'move';
				break;
				case AI_CONST.MOVE_END:
		        	cursor = 'e-resize';
				break;
        	}
        	document.body.style.cursor = cursor;
    	}
	}
	this.graphics
        .on('mousedown', mouseDown)
        .on('mouseup', mouseUp)
        .on('mouseupoutside', mouseUp)
        .on('mousemove', mouseMove)
        .on('touchstart', function(event) {
	    	// console.log("touch-start");
        })
        .on('touchend', function(event) {
	    	// console.log("touch-end");
        })
        .on('touchendoutside', function(event) {
	    	// console.log("touch-endout");
        })
        .on('touchmove', function(event) {
	    	// console.log("touch-move");
        })


        // set the mouseover callback...
        .on('mouseover', function(event) {
        	// console.log("mouse-over");
        	// self.hovered = true;
        	// self.updateVisuals();
        })

        // set the mouseout callback...
        .on('mouseout', function(event) {
        	// console.log("mouse-out");
        	// self.hovered = false;
        	// self.updateVisuals();
        });
}

PEAnimationItem.prototype = Object.create(TweenItem.prototype);

PEAnimationItem.prototype.constructor = PEAnimationItem;

Object.defineProperties(PEAnimationItem.prototype, {
	selected: {
		get: function () {
			return this._selected;
		},
		set: function(value) {
			this._selected = value;
			this.updateVisuals();
		}
	},
	start: {
		get: function () {
			return this._start;
		},
		set: function(value) {
			this._start = value;
			this.graphics.position.x = value * TL_CONST.WIDTH_OF_MSEC_IN_PX;
			this.manager.layoutItems();
		}
	},
	level: {
		get: function() {
			return this._level;
		},
		set: function(value) {
			this._level = value;
			this.graphics.position.y = value*25;
			this.updateVisuals();
		}
	},
	length: {
		get: function () {
			return this._length;
		},
		set: function(value) {
			this._length = value;
			this.width = value * TL_CONST.WIDTH_OF_MSEC_IN_PX;
			this.manager.layoutItems();
			this.updateVisuals();
		}
	},
	// end: {
	// 	get: function() {
	// 		return this.start + this.length;
	// 	}
	// },
    type: {
        get: function () {
            return this._type;
        },
        set: function (value) {
			this._type = value;
			switch(value) {
				case PA_TYPE.MOVE:
				this.name = 'Move';
				this.texture = PIXI.Texture.fromImage('assets/act_move.png');
				// this.texture2 = PIXI.Texture.fromImage('assets/al_move.png');
				break;
				case PA_TYPE.SCALE:
				this.name = 'Scale';
				this.texture = PIXI.Texture.fromImage('assets/act_scale.png');
				// this.texture2 = PIXI.Texture.fromImage('assets/al_scale.png');
				break;
				case PA_TYPE.ROTATE:
				this.name = 'Rotate';
				this.texture = PIXI.Texture.fromImage('assets/act_rotate.png');
				// this.texture2 = PIXI.Texture.fromImage('assets/al_rotate.png');
				break;
				case PA_TYPE.TINT:
				this.name = 'Tint';
				this.texture = PIXI.Texture.fromImage('assets/act_tint.png');
				// this.texture2 = PIXI.Texture.fromImage('assets/al_tint.png');
				break;
				case PA_TYPE.CHANGE_TEXTURE:
				this.name = 'Switch Image';
				this.texture = PIXI.Texture.fromImage('assets/act_animate.png');
				// this.texture2 = PIXI.Texture.fromImage('assets/al_switch_img.png');
				break;
				case PA_TYPE.OPACITY:
				this.name = 'Opacity';
				this.texture = PIXI.Texture.fromImage('assets/act_fade.png');
				// this.texture2 = PIXI.Texture.fromImage('assets/al_opacity.png');
				break;
			}
			if(this.img) {
				this.img.texture = this.texture;
				// this.img2.setTexture(this.texture2);
				this.text.text = this.name+' - '+this.target.node_name;
			} else {
				this.img = new PIXI.Sprite(this.texture);
				this.graphics.addChild(this.img);
				this.text = new PIXI.Text(this.name+' - '+this.target.node_name,{font : '48px Verdana', fill : 0xFFFFFF, align : 'center'});

				this.graphics.addChild(this.text);
				this.text.height = 48;
				this.text.scale.x = this.text.scale.y;
			}
			this.updateVisuals();
        }
    }
});

PEAnimationItem.prototype.mapMousePos = function(event) {
	'use strict';
  var pos = event.data.getLocalPosition(this.graphics);
	var b = this.graphics.getLocalBounds();
	var ret = AI_CONST.MOVE_OUTSIDE;
	if(b.contains(pos.x, pos.y)) {
		if(pos.x <= AI_CONST.RESIZER_AREA_WIDTH) {
        	ret = AI_CONST.MOVE_START;
        } else if(pos.x >= this.width-AI_CONST.RESIZER_AREA_WIDTH) {
        	ret = AI_CONST.MOVE_END;
        } else {
        	ret = AI_CONST.MOVE_DRAG;
        }
    }
	return ret;
};

PEAnimationItem.prototype.initParameters = function() {
	'use strict';
	var params = {};
	params.tween = 'linear/none';
	params.repeat = false;
	switch(this.type) {
	case PA_TYPE.MOVE: //x,y
		params.x = this.target.position.x;//0;
		params.y = this.target.position.y;//0;
	break;
	case PA_TYPE.SCALE://x,y
		params.sx = this.target.scale.x;//1;
		params.sy = this.target.scale.y;//1;
	break;
	case PA_TYPE.ROTATE://degree
		params.rotate = 360;
	break;
	case PA_TYPE.TINT://endColor
		params.tint = 0xFF0000;
	break;
	case PA_TYPE.CHANGE_TEXTURE://texture
		params.texture = 'texture';
	break;
	case PA_TYPE.OPACITY://endOpacity
		params.opacity = this.target.alpha;//1;
	break;
	}
	this.params = params;
};

PEAnimationItem.prototype.updateVisuals = function() {
	'use strict';
	var typeColor = AI_CONST.ITEM_COLOR;
	var bgColor = 0x000000;//0x535353;
	var separatorColor = 0x000000;

	if(this.selected) {
		typeColor = AI_CONST.SELECTION_COLOR;
	} else if(this.hovered) {
		typeColor = AI_CONST.HOVER_COLOR;
	}

	switch(this.type) {
		case PA_TYPE.MOVE: //x,y
			bgColor = AI_CONST.MOVE_COLOR;
			break;
		case PA_TYPE.SCALE://x,y
			bgColor = AI_CONST.SCALE_COLOR;
			break;
		case PA_TYPE.ROTATE://degree
			bgColor = AI_CONST.ROTATE_COLOR;
			break;
		case PA_TYPE.TINT://endColor
			bgColor = AI_CONST.TINT_COLOR;
			break;
		case PA_TYPE.CHANGE_TEXTURE://texture
			break;
		case PA_TYPE.OPACITY://endOpacity
			bgColor = AI_CONST.OPACITY_COLOR;
			break;
	}
	this.graphics.clear();
	if(this.width > 23) {
		this.graphics.lineStyle(2, typeColor, 1);
		this.graphics.beginFill(bgColor, 1);
		this.graphics.drawRoundedRect(1, 1, this.width-1, 21, 11);
		this.graphics.endFill();
		this.img.visible = true;
		this.img.position.x = 3;
		this.img.position.y = 3;
		this.img.width = 18;
		this.img.height = 18;

		this.text.position.x = 25;
		this.text.position.y = 1;
		this.text.visible = true;
	} else {
		this.graphics.lineStyle(2, typeColor, 1);
		this.graphics.beginFill(bgColor, 1);
		this.graphics.drawRoundedRect(1, 1, this.width-1, 21, 11);
		this.graphics.endFill();
		this.img.visible = true;
		this.text.visible = false;
	}

	if(this.graphics.mask) {
		this.graphics.removeChild(this.graphics.mask);
	}
	var mask = new PIXI.Graphics();
	mask.beginFill(0xffffff,0);
	mask.drawRect(0, 0, this.width+1, 23);
	mask.endFill();
	this.graphics.mask = mask;
	this.graphics.addChild(mask);
	this.graphics.hitArea = new PIXI.Rectangle(0, 0, this.width+1, 23);
};

PEAnimationItem.prototype.isOverlap = function(other) {
	var a = this.start;
	var b = a + this.length;
	var c = other.start;
	var d = c + other.length;
	// return ((b >= c) && (a <= d));
	return ((b > c) && (a < d));
};

function PEAnimationManager(pixi_container, core) {
	this.visible = false;
	this.playing = false;
	this.core = core;
	this.container = pixi_container;
	// this.items = [];
	this.objectProperties = [];
	this.guiContainer = document.getElementById('timeline_gui-container');
	this.tweenMaker = new TweenMaker();
}

// PEAnimationManager.prototype.getItemLayers = function() {
// 	var levels = [];
// 
// 	function doesItFitTo(level_idx, item) {
// 		var level = levels[level_idx];
// 		if(level.length <= 0) return true;
// 		var last = level[level.length - 1];
// 		return last.end <= item.start;
// 	}
// 	var perTarget = this.extractItemsPerTargetFromArray(this.items);
// 	var targetIds = Object.keys(perTarget);
// 	var last_level = 0;
// 	for(var tidx = 0; tidx < targetIds.length; tidx++) {
// 		// console.log("Level #"+l+": "+targetIds[idx]);
// 		var items = perTarget[targetIds[tidx]];
// 		items.sort(function(a,b) {
// 			if(a.type == b.type) {
// 				if(a.start == b.start) {
// 					if(a.length == b.length) {
// 						return a.node_id - b.node_id;
// 					} else {
// 						return a.length - b.length;
// 					}
// 				} else {
// 					return a.start - b.start;
// 				}
// 			} else {
// 				return a.type - b.type;
// 			}
// 		});
// 		levels[last_level] = [];
// 		startLevel = last_level;
// 		for(var idx = 0; idx < items.length;idx++) {
// 			var itm = items[idx];
// 			var needToAddNewlevel = true;
// 			for(var l = startLevel;l <= last_level;l++) {
// 				if(doesItFitTo(l,itm)) {
// 					levels[l].push(itm);
// 					needToAddNewlevel = false;
// 					break;
// 				}
// 			}
// 			if(needToAddNewlevel) {
// 				last_level++;
// 				levels[last_level] = [];
// 				levels[last_level].push(itm);
// 			}
// 		}
// 		last_level++;
// 		// levels[last_level] = [];
// 	}
// 	return levels;
// 
// };

PEAnimationManager.prototype.layoutItems = function() {
	'use strict';
	this.tweenMaker.layoutItems();
};

// PEAnimationManager.prototype.layoutItems = function() {
// 	'use strict';
// 	var levels = this.getItemLayers();
// 	for(var l = 0; l < levels.length;l++) {
// 		var level = levels[l];
// 		for(var idx = 0; idx < level.length; idx++) {
// 			level[idx].level = l;
// 		}
// 	}

// };

PEAnimationManager.prototype.targetItems = function(target) {
	'use strict';
	return this.tweenMaker.items.filter(function(itm) {
		return(itm.target === target);
	});
};

PEAnimationManager.prototype.newItem = function(type,target) {
	'use strict';
	this.storeTargetProperties(target);
	var targetItems = this.targetItems(target);
	var lastPos = 0;
	for(var idx = 0; idx < targetItems.length;idx++) {
		if(lastPos < targetItems[idx].start + targetItems[idx].length) lastPos = targetItems[idx].start + targetItems[idx].length;
	}

	if((lastPos + 1000) > (TL_CONST.MAX_LENGTH_IN_SEC * 1000)) {
		lastPos = 0;
	}
	var itm = new PEAnimationItem(this.container,target,this,type);
	this.tweenMaker.items.push(itm);
	itm.length = 1000;
	itm.start = lastPos;
	itm.initParameters();
	this.createTweenTimeline();
	this.selectItem(itm);
	return itm;
};

PEAnimationManager.prototype.deleteItem = function() {
	'use strict';
	if(!this.selectedItem) return;
	var item = this.selectedItem;
	this.container.removeChild(item.graphics);
	// this.restoreAllTargetProperties();
	var idx = this.tweenMaker.items.indexOf(item);
	this.selectItem(null);
	this.tweenMaker.items.splice(idx, 1);
	this.tweenMaker.layoutItems();
	this.createTweenTimeline();
};

PEAnimationManager.prototype.selectItem = function(itm) {
	'use strict';
	if(this.selectedItem === itm) return;
	if(this.selectedItem) {
		this.selectedItem.selected = false;
	}
	// this.registerAnimationTarget(itm);
	if(itm) {
		itm.selected = true;
		this.selectedItem = itm;
		this.currentTarget = itm.target;
		// this.core.selectDisplayObject(itm.target);
		this.core.selectTreeNode(itm.target);
		this.core.app.isTargetSelected = true;
		if(!this.tweenTimeline) {
			this.storeAllTargetProperties();
			this.createTweenTimeline();
		}
		this.tweenTimeline.gotoAndStop(itm.start + itm.length - 1);
		this.core.selectDisplayObject(itm.target);
		this.core.selectionHandler.updateSelectionHandles();//assignTo(itm.target);
	} else {
		this.selectedItem = null;
		if(!this.tweenTimeline) {
			// this.storeAllTargetProperties();
			this.createTweenTimeline();
		}
		this.tweenTimeline.gotoAndStop(0);
		this.core.selectionHandler.updateSelectionHandles();//assignTo(itm.target);
	}
	this.createDatGui();
};

PEAnimationManager.prototype.updateGuiControllers = function() {
	'use strict';
	for(var idx = 0; idx < this.controllers.length;idx++) {
		this.controllers[idx].updateDisplay();
	}
};

PEAnimationManager.prototype.registerGuiController = function(controller) {
	'use strict';
	this.controllers.push(controller);
	return controller;
};

PEAnimationManager.prototype.createDatGui = function() {
	'use strict';
	this.controllers = [];
	if(this.gui) {
		this.guiContainer.removeChild(this.gui.domElement);
		delete(this.gui);
	}
	if(this.selectedItem) {

		this.gui = new dat.GUI({ autoPlace: false,showClose:false });
		this.guiContainer.appendChild(this.gui.domElement);
		var self = this;
		var f;
		switch(this.selectedItem.type) {
		case PA_TYPE.MOVE: //x,y
			f = this.gui.addFolder('Move to');
			this.registerGuiController(f.add(this.selectedItem.params, 'x',-512,800)).setDisplayName('X').onChange(function(value) {
				self.currentTarget.position.x = value;
				self.updateTweenTimeline();
			});
			this.registerGuiController(f.add(this.selectedItem.params, 'y',-512,600)).setDisplayName('Y').onChange(function(value) {
				self.currentTarget.position.y = value;
				self.updateTweenTimeline();
			});
			break;
		case PA_TYPE.SCALE://x,y
			f = this.gui.addFolder('Scale to');
			this.registerGuiController(f.add(this.selectedItem.params, 'sx',0,10,0.01)).setDisplayName('Horizontal').onChange(function(value) {
				self.currentTarget.scale.x = value;
				self.updateTweenTimeline();
			});
			this.registerGuiController(f.add(this.selectedItem.params, 'sy',0,10,0.01)).setDisplayName('Vertical').onChange(function(value) {
				self.currentTarget.scale.y = value;
				self.updateTweenTimeline();
			});
			break;
		case PA_TYPE.ROTATE://degree
			f = this.gui.addFolder('Rotate');
			this.registerGuiController(f.add(this.selectedItem.params, 'rotate',-360,360)).setDisplayName('Degree').onChange(function(value) {
				self.currentTarget.rotationInDeg = value;
				self.updateTweenTimeline();
			});
			break;
		case PA_TYPE.TINT://endColor
			f = this.gui.addFolder('Tint');
			this.registerGuiController(f.addColor(this.selectedItem.params, 'tint')).setDisplayName('Color').onChange(function(value) {
				self.currentTarget.tint = value;
				self.updateTweenTimeline();
			});
			break;
		case PA_TYPE.CHANGE_TEXTURE://texture
			f = this.gui.addFolder('Switch Img.').onChange(function(value) {
			});
			break;
		case PA_TYPE.OPACITY://endOpacity
			f = this.gui.addFolder('Opacity');
			this.registerGuiController(f.add(this.selectedItem.params, 'opacity',0,1,0.01)).setDisplayName('Percent').onChange(function(value) {
				self.currentTarget.alpha = value;
				self.updateTweenTimeline();
			});
			break;
		}
		this.gui.add(this.selectedItem.params, 'repeat').setDisplayName('Repeat');
		this.gui.add(this.selectedItem.params, 'tween', 
			[
				'backIn',
				'backInOut',
				'backOut',
				'bounceIn',
				'bounceInOut',
				'bounceOut',
				'circIn',
				'circInOut',
				'circOut',
				'cubicIn',
				'cubicInOut',
				'cubicOut',
				'elasticIn',
				'elasticInOut',
				'elasticOut',
				'linear/none',
				'quadIn',
				'quadInOut',
				'quadOut',
				'quartIn',
				'quartInOut',
				'quartOut',
				'quintIn',
				'quintInOut',
				'quintOut',
				'sineIn',
				'sineInOut',
				'sineOut'
			]).setDisplayName('Tween');
		f.open();
		this.gui.add(this, 'deleteItem').setDisplayName('Delete');
	}
};

PEAnimationItem.prototype.item2JSON = function() {
	'use strict';
	var ret = {};
	ret.start = this.start;
	ret.length = this.length;
	ret.target = this.target.node_id;
	ret.type = this.type;
	ret.params = this.params;
	return ret;
};

PEAnimationManager.prototype.timeline2JSON = function() {
	'use strict';
	var ret = {};
	ret.items = [];
	for(var idx = 0; idx < this.tweenMaker.items.length;idx++) {
		var itm = this.tweenMaker.items[idx].item2JSON();
		ret.items.push(itm);
	}
	return ret;
};

PEAnimationManager.prototype.JSON2item = function(json_item) {
	'use strict';
	var target = this.core.targetByNodeId(json_item.target);
	var ret = new PEAnimationItem(this.container,target,this,json_item.type);
	ret.start = json_item.start;
	ret.length = json_item.length;
	ret.params = json_item.params;
	return ret;
};

PEAnimationManager.prototype.JSON2timeline = function(json_timeline) {
	'use strict';
	var idx;
	for(idx = this.container.children.length - 1; idx >= 0;idx--) {
		var child = this.container.removeChild(this.container.children[idx]);
		// child.destroy(true);
	}

	this.tweenMaker.items = [];
	for(idx = 0; idx < json_timeline.items.length;idx++) {
		var item = this.JSON2item(json_timeline.items[idx]);
		this.tweenMaker.items.push(item);
	}
	this.tweenMaker.layoutItems();
};

PEAnimationManager.prototype.objectChanged = function(obj,changeKind) {
	'use strict';
	// console.log("Object changed");
	if(!this.selectedItem || this.selectedItem.target !== obj) {
		this.updateTargetProperties(obj, changeKind);
		return;
	}
	var needToRecreate = false;
	switch(this.selectedItem.type) {
	case PA_TYPE.MOVE: //x,y
		this.selectedItem.params.x = this.currentTarget.position.x;
		this.selectedItem.params.y = this.currentTarget.position.y;
		needToRecreate = changeKind == PA_TYPE.MOVE;
		break;
	case PA_TYPE.SCALE://x,y
		this.selectedItem.params.sx = this.currentTarget.scale.x;
		this.selectedItem.params.sy = this.currentTarget.scale.y;
		needToRecreate = changeKind == PA_TYPE.SCALE;
		break;
	case PA_TYPE.ROTATE://degree
		this.selectedItem.params.rotate = this.currentTarget.rotationInDeg;
		needToRecreate = changeKind == PA_TYPE.ROTATE;
		break;
	case PA_TYPE.TINT://endColor
		this.selectedItem.params.tint = this.currentTarget.tint;
		break;
	case PA_TYPE.CHANGE_TEXTURE://texture
		break;
	case PA_TYPE.OPACITY://endOpacity
		this.selectedItem.params.opacity = this.currentTarget.alpha;
		break;
	}
	// this.storeAllTargetProperties();
	if(needToRecreate) {
		this.updateTweenTimeline();
		this.updateGuiControllers();
	} else {
		//this.updateTargetProperties(obj, changeKind);
	}
};

PEAnimationManager.prototype.updateTargetProperties = function(target, changeKind) {
	'use strict';
	// console.log("---- UPDATE ----");
	var prop;
	for(var idx = 0; idx < this.objectProperties.length; idx++) {
		var _prop = this.objectProperties[idx];
		if(_prop.target == target) {
			prop = _prop;
			break;
		}
	}
	if(prop) {
		switch(changeKind) {
		case PA_TYPE.MOVE: //x,y
			prop.prevPX 		= target.position.x;
			prop.prevPY 		= target.position.y;
			break;
		case PA_TYPE.SCALE://x,y
			prop.prevSX 		= target.scale.x;
			prop.prevSY 		= target.scale.y;
			break;
		case PA_TYPE.ROTATE://degree
			prop.prevRotation 	= target.rotation;
			break;
		case PA_TYPE.TINT://endColor
			prop.prevTint 		= target.tint;
			break;
		case PA_TYPE.CHANGE_TEXTURE://texture
			break;
		case PA_TYPE.OPACITY://endOpacity
			prop.prevAlpha 		= target.alpha;
			break;
		}
		this.reCreateTweenTimeline();
	}

};

// PEAnimationManager.prototype.extractItemsPerTargetFromArray = function(items) {
// 	'use strict';
// 	var ret = {};
// 	for(var idx = 0; idx < items.length;idx++) {
// 		var item = items[idx];
// 		var target = item.target;
// 		if(!ret[target.node_id]) {
// 			ret[target.node_id] = [];
// 		}
// 		ret[target.node_id].push(item);
// 	}
// 	return ret;
// };

PEAnimationManager.prototype.restoreAllTargetProperties = function() {
	'use strict';
	// console.log("---- RESTORE");
	for(var idx = 0; idx < this.objectProperties.length; idx++) {
		var prop = 	this.objectProperties[idx];
		// console.dir(prop);
		var target = prop.target;
		target.position.x 	= prop.prevPX;
		target.position.y 	= prop.prevPY;
		target.rotation 	= prop.prevRotation;
		target.tint 		= prop.prevTint;
		target.scale.x 		= prop.prevSX;
		target.scale.y 		= prop.prevSY;
		target.alpha 		= prop.prevAlpha;
	}
};

// PEAnimationManager.prototype.updateAllTargetProperties = function() {
// 	'use strict';
// 	if(!this.objectProperties) {
// 		this.objectProperties = [];
// 	}
// 	for(var idx = 0; idx < this.tweenMaker.items.length; idx++) {
// 		var item = this.tweenMaker.items[idx];
// 		var target = item.target;
// 		this.updateTargetProperties(target);
// 	}
// };

// PEAnimationManager.prototype.updateTargetProperties = function(target) {
// 	'use strict';
// 	// console.log("----- UPDATE -----");
// 	var prop = {};
// 	for(var idx = 0; idx < this.objectProperties.length; idx++) {
// 		prop = 	this.objectProperties[idx];
// 		if(prop.target === target) {
// 			prop.prevPX 		= target.position.x;
// 			prop.prevPY 		= target.position.y;
// 			prop.prevRotation 	= target.rotation;
// 			prop.prevTint 		= target.tint;
// 			prop.prevSX 		= target.scale.x;
// 			prop.prevSY 		= target.scale.y;
// 			prop.prevAlpha 		= target.alpha;
// 		}
// 	}
// };

PEAnimationManager.prototype.storeTargetProperties = function(target) {
	'use strict';
	// console.log("----- STORE -----");
	var prop = {};
	for(var idx = 0; idx < this.objectProperties.length; idx++) {
		prop = 	this.objectProperties[idx];
		if(prop.target === target) {
			return;
		}
	}
	prop = {};
	prop.target 		= target;
	prop.prevPX 		= target.position.x;
	prop.prevPY 		= target.position.y;
	prop.prevRotation 	= target.rotation;
	prop.prevTint 		= target.tint;
	prop.prevSX 		= target.scale.x;
	prop.prevSY 		= target.scale.y;
	prop.prevAlpha 		= target.alpha;
	// console.log("----- STORE -----");
	// console.dir(prop);
	this.objectProperties.push(prop);
};

PEAnimationManager.prototype.storeAllTargetProperties = function() {
	'use strict';
	// console.log("STORE -----");
	if(!this.objectProperties) {
		this.objectProperties = [];
	}
	for(var idx = 0; idx < this.tweenMaker.items.length; idx++) {
		var item = this.tweenMaker.items[idx];
		var target = item.target;
		this.storeTargetProperties(target);
	}
};

PEAnimationManager.prototype.setVisible = function(visible) {
	'use strict';
	if(visible) {
		this.storeAllTargetProperties();
		this.createTweenTimeline();
	} else {
		this.restoreAllTargetProperties();
	}
	this.selectItem(null);
	this.core.manualRefresh();
	this.visible = visible;
};

PEAnimationManager.prototype.updateTweenTimeline = function() {
	'use strict';
	var prevPos = this.tweenTimeline.position;
	this.createTweenTimeline();
	this.tweenTimeline.gotoAndStop(prevPos);
	// this.core.selectionHandler.assignTo(itm.target);
};


// PEAnimationManager.prototype.getEase = function(name) {
// 	'use strict';
// 	var ret = createjs.Ease.linear;
// 	for(var idx = 0; idx < easeInfo.length;idx++) {
// 		if(easeInfo[idx].label == name) {
// 			ret = easeInfo[idx].type;
// 		}
// 	}
// 	return ret;
// };

PEAnimationManager.prototype.reCreateTweenTimeline = function() {
	'use strict';
	var self = this;
	var tweens = this.tweenMaker.createTweens(true);
	this.tweenTimeline = new createjs.Timeline(tweens,[],{loop:true});
	this.tweenTimeline.on('change', function(event) {
		self.moverMarkerTo(event.target.position);
		self.core.selectionHandler.updateSelectionHandles();//assignTo(this.core.activeTarget);
	});
};

PEAnimationManager.prototype.createTweenTimeline = function() {
	'use strict';
	var self = this;
	this.restoreAllTargetProperties();
	this.reCreateTweenTimeline();
	// var tweens = this.tweenMaker.createTweens();
	// this.tweenTimeline = new createjs.Timeline(tweens,[],{loop:true});
	// this.tweenTimeline.on('change', function(event) {
	// 	self.moverMarkerTo(event.target.position);
	// 	self.core.selectionHandler.updateSelectionHandles();//assignTo(this.core.activeTarget);
	// });
	
};

// PEAnimationManager.prototype.createTweenTimeline = function() {
// 	'use strict';
// 	this.restoreAllTargetProperties();

// 	var self = this;
// 	createjs.Tween.removeAllTweens();
// 	var tweens = [];

// 	var fakeTarget = new TweenWrapper(null);
// 	var fakeTween = new createjs.Tween.get(fakeTarget).to({fake:100},TL_CONST.MAX_LENGTH_IN_SEC*1000);
// 	tweens.push(fakeTween);

// 	var levels = this.getItemLayers();
// 	for(var l = 0; l < levels.length;l++) {
// 		var level = levels[l];
// 		var perTarget = this.extractItemsPerTargetFromArray(level);
// 		var targetIds = Object.keys(perTarget);
// 		for(var idx = 0; idx < targetIds.length; idx++) {
// 			// console.log("Level #"+l+": "+targetIds[idx]);
// 			var items = perTarget[targetIds[idx]];
// 			var target = items[0].target;
// 			var tweenTarget = new TweenWrapper(target);
// 			var tween = new createjs.Tween.get(tweenTarget);
// 			var prevEnd = 0;
// 			var tintIndex = 0;
// 			var prevTint = target.tint;
// 			for(var t = 0; t < items.length;t++) {
// 				var item = items[t];
// 				var wait = item.start - prevEnd;
// 				if(wait > 0) tween = tween.wait(wait);
// 				prevEnd = item.start + item.length;
// 				var ease = this.getEase(item.params.tween);
// 				switch(item.type) {
// 				case PA_TYPE.MOVE: //x,y
// 					tween = tween.to({x:item.params.x, y: item.params.y}, item.length, ease);
// 					break;
// 				case PA_TYPE.SCALE://x,y
// 					tween = tween.to({sx:item.params.sx, sy: item.params.sy}, item.length, ease);
// 					break;
// 				case PA_TYPE.ROTATE://degree
// 					tween = tween.to({rid:item.params.rotate}, item.length, ease);
// 					break;
// 				case PA_TYPE.TINT://endColor
// 					tweenTarget.pushTintColor(prevTint,item.params.tint);
// 					prevTint = item.params.tint;
// 					tintIndex++;
// 					tween = tween.to({tintProgress:tintIndex}, item.length, ease);
// 					break;
// 				case PA_TYPE.CHANGE_TEXTURE://texture
// 					break;
// 				case PA_TYPE.OPACITY://endOpacity
// 					tween = tween.to({a:item.params.opacity}, item.length, ease);
// 					break;
// 				}
// 			}
// 			tweens.push(tween);
// 		}
// 	}
// 	this.tweenTimeline = new createjs.Timeline(tweens,[],{loop:true});
// 	this.tweenTimeline.on('change', function(event) {
// 		self.moverMarkerTo(event.target.position);
// 		self.core.selectionHandler.updateSelectionHandles();//assignTo(this.core.activeTarget);
// 	});
	
// };

PEAnimationManager.prototype.itemChanged = function(item,changedAt) {
	'use strict';
	this.createTweenTimeline();
	var moveTo = item.start;
	switch(changedAt) {
		case AI_CONST.MOVE_START:
			moveTo = item.start;
		break;
		case AI_CONST.MOVE_DRAG:
			moveTo = item.start;
		break;
		case AI_CONST.MOVE_END:
			moveTo = item.start + item.length - 1;
		break;
	}
	this.tweenTimeline.gotoAndStop(moveTo);
	this.core.selectionHandler.assignTo(item.target);
};

PEAnimationManager.prototype.startPlayback = function() {
	'use strict';
	if(!this.visible) {
		this.storeAllTargetProperties();
	}
	this.playing = true;
	this.selectItem(null);
	this.restoreAllTargetProperties();
	this.createTweenTimeline();
};

PEAnimationManager.prototype.stopPlayback = function() {
	'use strict';
	if(this.tweenTimeline) this.tweenTimeline.gotoAndStop(0);
	this.restoreAllTargetProperties();
	this.playing = false;
	this.core.selectionHandler.updateSelectionHandles();//assignTo(this.core.activeTarget);
	this.core.manualRefresh();
};

PEAnimationManager.prototype.moverMarkerTo = function(time) {
	'use strict';
	this.core.timelineMarker.x = time * TL_CONST.WIDTH_OF_MSEC_IN_PX;
	this.core.moveBackgroundToTime(time/1000);
	this.core.manualRefresh();
};

PEAnimationManager.prototype.moveTimeTo = function(timeInSec) {
	'use strict';
	if(this.tweenTimeline) {
		this.tweenTimeline.gotoAndStop(timeInSec*1000);
	}
	this.core.moveBackgroundToTime(timeInSec);
	this.core.manualRefresh();
};

