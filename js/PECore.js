function PECore() {
	'use strict';

	var self = this;
	var dim = self.getMainCanvasDimension();
	var sw = dim.w;
	var sh = dim.h;
	self.isExpertMode = false;
	this.guiContainer = document.getElementById('gui-container');
	this._paused = true;

	this.nextObjectId = 1;
	this.yamProperties = {
		id: null,
		frameWidth:640,
		frameHeight:480,
		keepAspect:true,
		name:'<New YAM!>',
		desc:'YAM! description goes here....',
		created: new Date()
	};


	this.renderer = new PIXI.WebGLRenderer(
		sw,
		sh,
		{
			antialias:true,
			preserveDrawingBuffer:true,
			transparent:false,
			// autoResize:true
		}
	);
	
	// this.renderer = new PIXI.CanvasRenderer(
	// 	sw,
	// 	sh,
	// 	{
	// 		antialias:true,
	// 		preserveDrawingBuffer:true,
	// 		transparent:false,
	// 		// autoResize:true
	// 	}
	// );
	

	this.controllers = [];
	this.createHierarchyTree();
	this.renderer.backgroundColor = 0x3e3a3a;
	this.holder = document.getElementById('editor_canvas_holder');
	this.holder.appendChild(this.renderer.view);
	$(this.renderer.view).css("flex", "1 1");
	this.scrollableStage = new PIXI.Container();
	this.objectLayer = new PIXI.Container();
	this.type = OBJ_TYPE.BACKGROUND;
	this.objectLayer.locked = true;
	this.designerLayer = new PIXI.Container();
	// this.hudLayer = new PIXI.Container();

	this.stageRect = new ShapeFx();
	this.stageRect.makeStageRect(this.yamProperties.frameWidth, this.yamProperties.frameHeight);

	this.scrollableStage.addChild(this.stageRect);
	this.stageRect.interactive = true;

	this.scrollableStage.addChild(this.objectLayer);


	// this.objectLayer.filters = [new PIXI.filters.AsciiFilter()];

	this.scrollableStage.addChild(this.designerLayer);


	// this.stageRect = makeRect(0, 0, this.yamProperties.frameWidth, this.yamProperties.frameHeight,1,0x00ff00,1);

	// this.stageRect = new ShapeFx();
	// this.stageRect.makeStageRect(this.yamProperties.frameWidth, this.yamProperties.frameHeight);

	// this.scrollableStage.addChild(this.stageRect);
	// this.stageRect.interactive = true;
	// this.scrollableStage.addChild(this.hudLayer);

	this.stageRect.on('mousedown', function(event) {
		self.onStageMouseDown(event);
	});
	this.stageRect.on('mousemove', function(event) {
		if(self.app.modalOpen) return;
		self.onStageMouseMove(event);
	});
	this.stageRect.on('mouseup', function(event) {
		self.onStageMouseUp(event);
	});

	this.stageRect.hitArea = new PIXI.Rectangle(-2048,-2048,4096,4096);
	this.selectionHandler = new PESelectionHandler(this);

	this.rootStage = new PIXI.Container();
	this.rootStage.addChild(this.scrollableStage);
	this.stageScroller = new Scrollbars(this.rootStage,this.scrollableStage,sw,sh,-2048,2048,-2048,2048, function() {
  		self.manualRefresh();
  	});

	this.renderer.view.onmousewheel = function(ev){
		self.stageScroller.wheelBy(ev.wheelDeltaX,ev.wheelDeltaY);
    	return false;
	};

	this.isShiftOn = false;

	window.addEventListener(
		"keyup", self.onKeyUp.bind(self), false
	);

	window.addEventListener(
		"keydown", self.onKeyDown.bind(self), false
	);


	// window.on("keyup", function(event) {
	// 	self.onKeyUp(event);
	// });

	this.manualRefresh();
	this.setupDatGui();

	this.currentTool = 0;
	// this.currentToolboxIdx;
}

Object.defineProperties(PECore.prototype, {
    paused: {
        get: function ()
        {
            return this._paused;
        },
        set: function (paused)
        {
        	var self = this;
			self._paused = paused;
			createjs.Ticker.paused = paused;
			if(paused) {
				setTimeout(function() {
					self.animationManager.stopPlayback();
					self.stopBackgroundPlayback();
					self.selectionHandler.show();
				},0);
			} else {
				self.frames = [];
				setTimeout(function() {
					self.selectionHandler.hide();
					self.startBackgroundPlayback();
					self.animationManager.startPlayback();
				},0);
			}
        }
    }
});

PECore.prototype.initialize = function() {
	'use strict';
	var self = this;
	this.createVueApp();
	// this.app.yamProperties = self.yamProperties;
	this.createTimeline();
	this.frames = [];
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", handleTick);
	function handleTick(event) {
		if (!event.paused) {
			self.selectionHandler.updateSelectionHandles();
			self.renderer.render(self.rootStage);	
			// console.log("rendering");
// var frame = self.renderer.view.toDataURL();
// window.open(canvas.toDataURL('png'), "");,
// self.frames.push(frame);
		}
		// self.timelineRenderer.render(self.timelineRootStage);
	}
	createjs.Ticker.paused = true;
	this.initCaman();
};


PECore.prototype.objectAtPoint = function(o,p) {
	'use strict';
	var ret;
	var idx;
	// for(idx = 0; idx < o.children.length;idx++) {
	for(idx = o.children.length-1; idx >= 0;idx--) {
		ret = this.objectAtPoint(o.children[idx],p);
		if(ret !== null) return ret;
	}
	if(!o.locked) {
		if(o.containsPoint) {
			if(o.containsPoint(p)) {
				return o;
			}
		}
	}
	return null;
};

PECore.prototype.onKeyDown = function(event) {
	//16 Shift
	// console.log("Key down:"+event.keyCode);
	if(event.keyCode === 16) {
		this.isShiftOn = true;
	}
};

PECore.prototype.onKeyUp = function(event) {
	// var keyName;
	var step = 1;
	if(this.isShiftOn) step = 10;
	var dx = 0;
	var dy = 0;
	switch(event.keyCode) {
	case 16:
		this.isShiftOn = false;
		dx = 0;
		dx = 0;
		break;	
	case 37: 
		// keyName = "Left Arrow";
		dx = -step;
		break;
	case 38: 
		// keyName = "Up Arrow";
		dy = -step;
		break;
	case 39: 
		// keyName = "Right Arrow";
		dx = step;
		break;
	case 40: 
		// keyName = "Down Arrow";
		dy = step;
		break;
	}
	// if(keyName) {
		if(dx || dy) {
			this.selectionHandler.moveBy(dx,dy);
			this.manualRefresh();
		}
		// console.log("Key UP:"+keyName+" Step is:"+step);
	// }
};


PECore.prototype.onStageMouseMove = function(event) {
	'use strict';
	if(!this.paused) return;
	if(this.activeTarget) {
		this.selectionHandler.onMouseMove(event);
		this.manualRefresh();
	// } else if(this.scrollableStage.dragging) {
	// 	this.scrollableStage.position.x =event.data.global.x - this.dragOffset.x;
	// 	this.scrollableStage.position.y =event.data.global.y - this.dragOffset.y;
	// 	this.updateGuiControllers();
	// 	this.manualRefresh();
	}
};

PECore.prototype.onStageMouseUp = function(event) {
	'use strict';
	if(!this.paused) return;
	if(this.activeTarget) {
		this.selectionHandler.onMouseUp(event);
	// } else {
	// 	this.scrollableStage.dragging = false;
	}
	this.manualRefresh();
};

PECore.prototype.onStageMouseDown = function(event) {
	'use strict';
	if(!this.paused) return;
	if(this.activeTarget) {
		this.selectionHandler.onMouseDown(event);
		if(this.selectionHandler.dragging !== CONST.OUTSIDE) return;
	} 
	var newTarget = this.objectAtPoint(this.objectLayer,event.data.global);

	this.selectDisplayObject(newTarget);

	if(this.activeTarget) {
		this.selectionHandler.onMouseDown(event,true);
		this.app.isTargetSelected = true;
		this.selectTreeNode(this.activeTarget);
	} else {
		this.app.isTargetSelected = false;
		// this.scrollableStage.dragging = true;
		// this.dragOffset = new PIXI.Point(event.data.global.x - this.scrollableStage.x,event.data.global.y - this.scrollableStage.y);
		this.selectTreeNode(this.objectLater);
	}
};

PECore.prototype.selectDisplayObject = function(newTarget) {
	'use strict';
	this.activeTarget = newTarget;
	this.selectionHandler.assignTo(this.activeTarget);
	this.setupDatGui();
	this.setupPropertiesPanle();
	this.manualRefresh();
};

PECore.prototype.deleteSelectedTarget = function() {
	'use strict';
	if(this.activeTarget) {
		this.deleteTreeNode(this.activeTarget);
		var parent = this.activeTarget.parent;
		parent.removeChild(this.activeTarget);
		this.selectDisplayObject(null);
	}
};

PECore.prototype.createSprite = function(texture,texture_path) {
	'use strict';
	var sprite = new PIXI.Sprite(texture);
	sprite.type = OBJ_TYPE.SPRITE;
	sprite.texturePath = texture_path;
	sprite.position.x = this.yamProperties.frameWidth/2;
	sprite.position.y = this.yamProperties.frameHeight/2;

	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.locked = false;
	return sprite;
};

PECore.prototype.manualRefresh = function() {
	'use strict';
	var self = this;
	if(this.paused) {
		this.renderer.render(this.rootStage);
	}
	if(self.timelineRenderer) {
		self.timelineRenderer.render(self.timelineRootStage);
		self.timelineScaleRenderer.render(self.timelineScaleRulerStage);
	}
};

PECore.prototype.worldBounds = function (target) {
	'use strict';
	var bounds = new PointRect(target.getLocalBounds());
	var transformedBounds = bounds.transform(target,this.objectLayer);
	// console.log(target.node_name);
	// console.dir(transformedBounds);
	return transformedBounds;
};

PECore.prototype.collectBoundsRects = function (target, boundsRects) {
	'use strict';
	boundsRects.push(this.worldBounds(target));
    for (var i = 0, j = target.children.length; i < j; ++i) {
    	this.collectBoundsRects(target.children[i], boundsRects);
    }
};


PECore.prototype.calcBounds = function (target)
{
	'use strict';
	var boundsRects = [];
	this.collectBoundsRects(target, boundsRects);
    var minX = Infinity;
    var minY = Infinity;

    var maxX = -Infinity;
    var maxY = -Infinity;
    for(var i = 0; i < boundsRects.length; i++) {
    	var b = boundsRects[i];
    	if(b.minX < minX) minX = b.minX;
    	if(b.minY < minY) minY = b.minY;
    	if(b.maxX > maxX) maxX = b.maxX;
    	if(b.maxY > maxY) maxY = b.maxY;
    }

    var bounds = {};
    bounds.x = minX;
    bounds.y = minY;
    bounds.width = maxX - minX;
    bounds.height = maxY - minY;
    // console.log("Calculated bounds:"+minX+","+minY+","+maxX+","+maxY);
    console.dir(bounds);
    return bounds;
};

PECore.prototype.dumpTemplate = function() {
	'use strict';
	var self = this;
	if(self.activeTarget) {
		var tmpPos = self.activeTarget.position;
		var tmpl = this.object2JSON(self.activeTarget,true);
		var tmplSrc = JSON.stringify(tmpl);
		tmpl = JSON.parse(tmplSrc);
		this.JSON2object(tmpl,null,function(o) {
			self.objectLayer.addChild(o);
			var bounds = self.calcBounds(o);
			var pt = new PIXI.Point(o.position.x - bounds.x, o.position.y - bounds.y);
			self.objectLayer.removeChild(o);

			var w = bounds.width;
			var h = bounds.height;
			o.position.x = pt.x;
			o.position.y = pt.y;
			var holder = new PIXI.Container();
			holder.addChild(o);
			var renderer = new PIXI.CanvasRenderer(
				w,h,
				{
					antialias:true,
					preserveDrawingBuffer:true,
					transparent:false,
					// autoResize:true
				}
			);

		    var renderTexture = new PIXI.RenderTexture(renderer, w, h);
			renderTexture.render(holder);

			var img = renderTexture.getBase64();
			var name = self.activeTarget.text || self.activeTarget.node_name;//"Template";
			var type = 0;
			switch(self.activeTarget.type) {
				case OBJ_TYPE.SPRITE:
					type = 2;
					break;
				case OBJ_TYPE.TEXT:
					type = 0;
					break;
				case OBJ_TYPE.SHAPE:
					type = 1;
					break;
			}
			var template = {
				name:name,
				type:type
			};
			var json = JSON.stringify(tmpl, null, 2);
			yamPost("api/templates",{ template_meta: JSON.stringify(template), template_json: json, template_thumb:img}, function(res) {
				console.log("Template saved");
			})
			.fail(function(err) {
				console.log('save template api/templates - FAIL');
				console.dir(err);
			});
			self.activeTarget.position = tmpPos;
			// window.open(img, "");
		});
	}
};

PECore.prototype.onAssetsLoaded = function(editor, loader, resources) {
	'use strict';
	var self = this;

	var kind;
	var sfx;
	var style;
	var sample;
	if(!false) {
		sample = self.createSprite(resources['images/sample.jpg'].texture,resources['images/sample.jpg'].url);
		sample.node_name = 'sample';
		self.objectLayer.addChild(sample);

		// sample.filters = [new PIXI.filters.PixelateFilter()];

		// var car = self.createSprite(resources.car.texture,resources.car.url);
		// car.node_name = 'car';
		// self.objectLayer.addChild(car);

		// for(kind = SHAPEFX.LINE; kind <= SHAPEFX.CIRCLE;kind++) {
		// 	sfx = new ShapeFx();
		// 	self.objectLayer.addChild(sfx);
		// 	sfx.type = OBJ_TYPE.SHAPE;
		// 	sfx.kind = kind;
		// 	style = sfx.style;
		// 	style.fill = false;
		// 	sfx.style = style;
		// 	sfx.position.x = (kind*120);
		// 	sfx.position.y = 70;
		// 	sfx.locked = false;
		// }

		// for(kind = SHAPEFX.LINE; kind <= SHAPEFX.CIRCLE;kind++) {
		// 	sfx = new ShapeFx();
		// 	self.objectLayer.addChild(sfx);
		// 	sfx.type = OBJ_TYPE.SHAPE;
		// 	sfx.kind = kind;

		// 	sfx.position.x = (kind*120);
		// 	sfx.position.y = 140;
		// 	sfx.locked = false;
		// }

		// for(kind = SHAPEFX.LINE; kind <= SHAPEFX.CIRCLE;kind++) {
		// 	sfx = new ShapeFx();
		// 	self.objectLayer.addChild(sfx);
		// 	sfx.type = OBJ_TYPE.SHAPE;
		// 	sfx.kind = kind;

		// 	style = sfx.style;
		// 	style.gradientStyle = SHAPEFX.RADIAL;
		// 	sfx.style = style;

		// 	sfx.position.x = (kind*120);
		// 	sfx.position.y = 210;
		// 	sfx.locked = false;
		// }

		self.newText();
	} else {
		
		// sample = self.createSprite(resources['images/sample.jpg'].texture,resources['images/sample.jpg'].url);
		// sample.node_name = 'sample';
		// self.objectLayer.addChild(sample);
		// sample = self.createSprite(resources.sample.texture,resources.sample.url);
		// sample.node_name = 'sample';
		// sample.skew.x = 0.3;
		// sample.skew.y = 0.3;
		// self.objectLayer.addChild(sample);

	// var myMask = new PIXI.Graphics();
	// myMask.beginFill();
	// myMask.drawCircle(0, 0, 150);
	// myMask.endFill();
	 
	// self.objectLayer.addChild(myMask);
	// self.mask = myMask;

	sfx = new ShapeFx();
	self.objectLayer.addChild(sfx);
	sfx.type = OBJ_TYPE.SHAPE;
	sfx.kind = SHAPEFX.RECT;

	// style = sfx.style;
	// style.gradientFill = true;
	// sfx.style = style;

	self.mask = sfx;

		sample = self.createSprite(resources['images/sample.jpg'].texture,resources['images/sample.jpg'].url);
		sample.node_name = 'sample';
		sample.addChild(self.mask);
		sample.mask = self.mask;
		self.objectLayer.addChild(sample);

		sfx = new ShapeFx();
		self.objectLayer.addChild(sfx);
		sfx.type = OBJ_TYPE.SHAPE;
		sfx.kind = SHAPEFX.RECT;
		style = sfx.style;
		style.gradientFill = true;
		sfx.style = style;

		sfx.position.x = (120);
		sfx.position.y = 140;
		sfx.locked = false;

		sfx = new ShapeFx();
		self.objectLayer.addChild(sfx);
		sfx.type = OBJ_TYPE.SHAPE;
		sfx.kind = SHAPEFX.TRIANGLE;
		style = sfx.style;
		style.gradientFill = true;
		sfx.style = style;

		sfx.position.x = (220);
		sfx.position.y = 140;
		sfx.locked = false;

		// self.newText();
	}
	self.loadHierarchyTree();
	self.manualRefresh();
};

PECore.prototype.loadSampleData = function() {
	'use strict';
	var self = this;
	var loader = PIXI.loader;
	loader.add('assets/loading.json');
	// loader.add('assets/fighter.json');


	loader.add('images/sample.jpg');
	// loader.add('images/car.svg');
	loader.once('complete',function(loader, resources) {
		setTimeout(function() {
			self.onAssetsLoaded(self,loader,resources);
		},0);
	});

	loader.load();

};

// PECore.prototype.doGet = function(url,cb,qry_params) {
// 	var req = url+"?token=secret";
// 	if(qry_params) {
// 		Object.keys(qry_params).forEach(function(key) {
// 			req = req + "&"+key+"="+qry_params[key];
// 		});
// 	}
// 	var ret = $.get(req, function(res) {
// 		cb(res);
// 	});
// 	return ret;
// };
