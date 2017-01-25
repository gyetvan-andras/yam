var CONST = {
	OUTSIDE:-1,

	BOTTOM:0,
	LEFT:1,
	RIGHT:2,
	TOP:3,
	ROTATE:4,
	ANCHOR:5,
	FRAME:6,
	CONTROL_POINT:7,
	GRADIENT_POINT:8,

	HOT_SPOT_R:5,
	ROTATE_L:30
};

function PESelectionHandler(core) {
	'use strict';
	this.core = core;
	this.designerLayer = this.core.designerLayer;	
	this.selectionRect = new PIXI.Graphics();
	this.selectionRect.visible = false;
	this.designerLayer.addChild(this.selectionRect);
	this.hotPoints = [];
	this.controlPoints = [];
	this.currentControlPointIdx = -1;
	this.gradientPoints = [];
	this.currentGradientPointIdx = -1;
	this.gradientMode = true;
}

PESelectionHandler.prototype.onMouseDown = function(event,first)
{
	'use strict';
	// console.log("Original H:"+this.target.height);
	var globalMousePos = event.data.global;
	var localMousePos = this.designerLayer.toLocal(globalMousePos);
	this.dragging = this.mapPointToHotspot(localMousePos);
	if(this.dragging != CONST.OUTSIDE) {
		this.selectionRect.alpha = 0.1;
		if(first) this.dragging = CONST.FRAME;
		switch(this.dragging) {
			case CONST.TOP:
				this.globalPosOfInterest = rectCenter(this.hotPoints[CONST.TOP]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.BOTTOM:
				this.globalPosOfInterest = rectCenter(this.hotPoints[CONST.BOTTOM]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.LEFT:
				this.globalPosOfInterest = rectCenter(this.hotPoints[CONST.LEFT]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.RIGHT:
				this.globalPosOfInterest = rectCenter(this.hotPoints[CONST.RIGHT]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.ANCHOR:
				// this.startPos = this.target.position.clone();
				this.globalPosOfInterest = rectCenter(this.hotPoints[CONST.ANCHOR]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.ROTATE:
				this.globalPosOfInterest = rectCenter(this.hotPoints[CONST.ROTATE]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.FRAME:
				this.globalPosOfInterest = this.target.parent.toGlobal(this.target.position);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.CONTROL_POINT:
				// this.startPos = this.target.position.clone();
				this.globalPosOfInterest = rectCenter(this.controlPoints[this.currentControlPointIdx]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case CONST.GRADIENT_POINT:
				// this.startPos = this.target.position.clone();
				this.globalPosOfInterest = rectCenter(this.gradientPoints[this.currentGradientPointIdx]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
		}
	}
};

PESelectionHandler.prototype.onMouseUp = function(event)
{
	'use strict';
	this.dragging = CONST.OUTSIDE;
	this.selectionRect.alpha = 1;
	document.body.style.cursor = 'default';
};

PESelectionHandler.prototype.onMouseMove = function(event)
{
	'use strict';
	if(this.core.app.modalOpen) return;
	var globalMousePos = event.data.global;
	var localMousePos = this.designerLayer.toLocal(globalMousePos);
	if(this.dragging != CONST.OUTSIDE) {
		var globalNewPos = new PIXI.Point(
			globalMousePos.x - this.globalOffset.x,
			globalMousePos.y - this.globalOffset.y); 
		var adjustedGlobalNewPos = new PIXI.Point(
			globalMousePos.x - this.globalOffset.x + this.core.scrollableStage.x,
			globalMousePos.y - this.globalOffset.y + this.core.scrollableStage.y
		); 
		var top, bottom, newHeight;
		var right, left, newWidth;
		switch(this.dragging) {
			case CONST.TOP:
				bottom = this.target.toLocal(rectCenter(this.hotPoints[CONST.BOTTOM]),this.designerLayer);
				top = this.target.toLocal(globalNewPos,this.designerLayer);
				newHeight = (bottom.y - top.y) * this.target.scale.y;//ws.y;
				this.target.height = newHeight;
				if(this.core.yamProperties.keepAspect) {
					this.target.scale.x = this.target.scale.y;
				}
				this.core.animationManager.objectChanged(this.target,PA_TYPE.SCALE);
				break;
			case CONST.BOTTOM:
				top = this.target.toLocal(rectCenter(this.hotPoints[CONST.TOP]),this.designerLayer);
				bottom = this.target.toLocal(globalNewPos,this.designerLayer);
				newHeight = (bottom.y - top.y) * this.target.scale.y;// / ws.y;
				this.target.height = newHeight;
				if(this.core.yamProperties.keepAspect) {
					this.target.scale.x = this.target.scale.y;
				}
				this.core.animationManager.objectChanged(this.target,PA_TYPE.SCALE);
				break;
			case CONST.LEFT:
				right = this.target.toLocal(rectCenter(this.hotPoints[CONST.RIGHT]),this.designerLayer);
				left = this.target.toLocal(globalNewPos,this.designerLayer);
				newWidth = (right.x - left.x) * this.target.scale.x;// / ws.x;
				// if(this.target.type == OBJ_TYPE.SHAPE) {
				// 	var dw = (newWidth - this.target.width) * this.target.scale.x;
				// 	this.target.position.x -= (dw/2); 
				// }
				this.target.width = newWidth;
				if(this.core.yamProperties.keepAspect) {
					this.target.scale.y = this.target.scale.x;
				}
				this.core.animationManager.objectChanged(this.target,PA_TYPE.SCALE);
				break;
			case CONST.RIGHT:
				right = this.target.toLocal(globalNewPos,this.designerLayer);
				left = this.target.toLocal(rectCenter(this.hotPoints[CONST.LEFT]),this.designerLayer);
				newWidth = (right.x - left.x) * this.target.scale.x;// / ws.x;
				this.target.width = newWidth;
				if(this.core.yamProperties.keepAspect) {
					this.target.scale.y = this.target.scale.x;
				}
				this.core.animationManager.objectChanged(this.target,PA_TYPE.SCALE);
				break;
			case CONST.ANCHOR:
				var npp = this.target.toLocal(adjustedGlobalNewPos);
				this.target.pivot.x = npp.x;
				this.target.pivot.y = npp.y;
				var np = this.target.parent.toLocal(adjustedGlobalNewPos);
				this.target.position.x = np.x;
				this.target.position.y = np.y;
				this.core.animationManager.objectChanged(this.target,PA_TYPE.MOVE);
				break;
			case CONST.ROTATE:
				var mpAnchor = this.designerLayer.toLocal(this.target.pivot,this.target);
				var angle = Math.atan2(localMousePos.x- mpAnchor.x, - (localMousePos.y - mpAnchor.y) )*(180/Math.PI);  
				var parent = this.target.parent;
				while(parent) {
					angle -= parent.rotationInDeg;   
					parent = parent.parent;
				}
				this.target.rotationInDeg = angle;
				this.core.animationManager.objectChanged(this.target,PA_TYPE.ROTATE);
				break;
			case CONST.FRAME:
				var newPosition = this.target.parent.toLocal(globalNewPos);
				this.target.position = newPosition;
				this.core.animationManager.objectChanged(this.target,PA_TYPE.MOVE);
				break;
			case CONST.CONTROL_POINT:
				var newControlPosition = this.target.toLocal(globalNewPos,this.designerLayer);
				this.target.moveControlPointTo(this.currentControlPointIdx,newControlPosition);
				break;
			case CONST.GRADIENT_POINT:
				var newGradientPosition = this.target.toLocal(globalNewPos,this.designerLayer);
				this.target.moveGradientPointTo(this.currentGradientPointIdx,newGradientPosition);
				break;
		}
		this.updateSelectionHandles();
		this.core.updateGuiControllers();
	} else {
		var hotspot = this.mapPointToHotspot(localMousePos);
		var cursor = 'pointer';
		switch(hotspot) {
			case CONST.TOP:
				cursor = 'n-resize';
				break;
			case CONST.BOTTOM:
				cursor = 's-resize';
				break;
			case CONST.LEFT:
				cursor = 'w-resize';
				break;
			case CONST.RIGHT:
				cursor = 'e-resize';
				break;
			case CONST.ANCHOR:
				cursor = 'crosshair';
				break;
			case CONST.CONTROL_POINT:
				cursor = 'crosshair';
				break;
			case CONST.GRADIENT_POINT:
				cursor = 'crosshair';
				break;
			case CONST.ROTATE:
				cursor = 'crosshair';
				break;
			case CONST.FRAME:
				cursor = 'move';
				break;
			default:
				cursor = 'default';
		}
		document.body.style.cursor = cursor;
		// console.log('Mouse hover over '+hsmsg);
	}
};

PESelectionHandler.prototype.mapPointToHotspot = function(pt) {
	'use strict';
	if(!this.target) return CONST.OUTSIDE;
	var idx;
	var gp;
	if(this.target.type == OBJ_TYPE.SHAPE) {
		if(this.gradientMode) {
			if(this.target.style.fill) {
				for(idx = 0; idx < this.gradientPoints.length; idx++) {
					gp = this.gradientPoints[idx]; 
					if(gp.contains(pt.x,pt.y)) {
						this.currentGradientPointIdx = idx;
						return CONST.GRADIENT_POINT;
					}
				}
			}
		} else {
			this.currentControlPointIdx = -1;
			if(this.hotPoints[CONST.ROTATE].contains(pt.x,pt.y)) return CONST.ROTATE;
			if(this.hotPoints[CONST.ANCHOR].contains(pt.x,pt.y)) return CONST.ANCHOR;
			for(idx = 0; idx < this.controlPoints.length; idx++) {
				var hp = this.controlPoints[idx]; 
				if(hp.contains(pt.x,pt.y)) {
					this.currentControlPointIdx = idx;
					return CONST.CONTROL_POINT;
				}
			}
		}
		var gpt = this.designerLayer.toGlobal(pt);
		if(this.target.containsPoint(gpt)) return CONST.FRAME;
		// if(this.hotPoints[CONST.FRAME].contains(pt.x,pt.y)) return CONST.FRAME;
	} else {
		if(this.gradientMode) {
			if(this.target.style.fill) {
				for(idx = 0; idx < this.gradientPoints.length; idx++) {
					gp = this.gradientPoints[idx]; 
					if(gp.contains(pt.x,pt.y)) {
						this.currentGradientPointIdx = idx;
						return CONST.GRADIENT_POINT;
					}
				}
			}
		} else {
			if(this.hotPoints[CONST.ROTATE].contains(pt.x,pt.y)) return CONST.ROTATE;
			if(this.hotPoints[CONST.TOP].contains(pt.x,pt.y)) return CONST.TOP;
			if(this.hotPoints[CONST.BOTTOM].contains(pt.x,pt.y)) return CONST.BOTTOM;
			if(this.hotPoints[CONST.LEFT].contains(pt.x,pt.y)) return CONST.LEFT;
			if(this.hotPoints[CONST.RIGHT].contains(pt.x,pt.y)) return CONST.RIGHT;
			if(this.hotPoints[CONST.ANCHOR].contains(pt.x,pt.y)) return CONST.ANCHOR;
			if(this.hotPoints[CONST.FRAME].contains(pt.x,pt.y)) return CONST.FRAME;
		}
	}
	return CONST.OUTSIDE;
};

PESelectionHandler.prototype.hide = function() {
	'use strict';
	this.selectionRect.visible = false;
};

PESelectionHandler.prototype.show = function() {
	'use strict';
	if(this.target) {
		this.updateSelectionHandles();
		this.selectionRect.visible = true;
	}
};

PESelectionHandler.prototype.moveBy = function(dx, dy) {
	'use strict';
	if(this.target) {
		var pos = this.target.position;
		pos.x += dx;
		pos.y += dy;
		this.target.position = pos;
		this.updateSelectionHandles();
	}
};

PESelectionHandler.prototype.setGradientMode = function(mode) {
	if(this.target) {
		this.gradientMode = mode;
		this.updateSelectionHandles();
	}
};


PESelectionHandler.prototype.assignTo = function(target) {
	'use strict';
	// this.dragging = CONST.OUTSIDE;
	this.gradientMode = false;
	if(target) {
		this.target = target;
		// this.target.pp = new PIXI.Point(0,0);
		this.updateSelectionHandles();
		this.selectionRect.visible = true;
	} else {
		this.selectionRect.visible = false;		
		this.target = undefined;
		this.dragging = CONST.OUTSIDE;
	}
};

PESelectionHandler.prototype.worldScaleOf = function(target,ws) {
	'use strict';
	ws.x = ws.x * (1/target.scale.x);
	ws.y = ws.y * (1/target.scale.y);
	if(target.parent) {
		this.worldScaleOf(target.parent,ws);
	}
};

PESelectionHandler.prototype.updateSelectionHandles = function() {
	'use strict';
	if(!this.target) return;
	if(this.target.type == OBJ_TYPE.SHAPE) {
		this.updateSelectionHandlesForShapes();
	} else if(this.target.type == OBJ_TYPE.TEXT) {
		this.updateSelectionHandlesForTexts();
	}	else {
		this.updateSelectionHandlesForSprites();
	}
};

PESelectionHandler.prototype.updateSelectionHandlesForTexts = function() {
	'use strict';
	if(!this.target) return;
	var bounds = new PointRect(this.target.getLocalBounds());
	var transformedBounds = bounds.transform(this.target,this.designerLayer);

	this.selectionRect.clear();
	this.selectionRect.lineStyle(2,0xE67E22,1);
	this.selectionRect.moveTo(transformedBounds.pA.x,transformedBounds.pA.y);
	this.selectionRect.lineTo(transformedBounds.pB.x,transformedBounds.pB.y);
	this.selectionRect.lineTo(transformedBounds.pC.x,transformedBounds.pC.y);
	this.selectionRect.lineTo(transformedBounds.pD.x,transformedBounds.pD.y);
	this.selectionRect.lineTo(transformedBounds.pA.x,transformedBounds.pA.y);

	var mpTop 		= midpoint(transformedBounds.pA,transformedBounds.pB);//TOP
	var mpRight 	= midpoint(transformedBounds.pB,transformedBounds.pC);//RIGHT
	var mpBottom 	= midpoint(transformedBounds.pC,transformedBounds.pD);//BOTTOM
	var mpLeft 		= midpoint(transformedBounds.pD,transformedBounds.pA);//LEFT

	// var mpAnchor 	= this.designerLayer.toLocal(this.target.pp,this.target);
	var mpAnchor 	= this.designerLayer.toLocal(this.target.pivot,this.target);

	this.hotPoints[CONST.TOP] 			= new PIXI.Rectangle(mpTop.x-CONST.HOT_SPOT_R, mpTop.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.BOTTOM] 		= new PIXI.Rectangle(mpBottom.x-CONST.HOT_SPOT_R, mpBottom.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.LEFT] 			= new PIXI.Rectangle(mpLeft.x-CONST.HOT_SPOT_R, mpLeft.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.RIGHT] 		= new PIXI.Rectangle(mpRight.x-CONST.HOT_SPOT_R, mpRight.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2,CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.FRAME] 		= new PIXI.Polygon(transformedBounds.pA,transformedBounds.pB,transformedBounds.pC,transformedBounds.pD);

	this.hotPoints[CONST.ANCHOR] 		= new PIXI.Rectangle(mpAnchor.x-CONST.HOT_SPOT_R, mpAnchor.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);

	// var rotatePos = new PIXI.Point(this.target.pp.x,this.target.pp.y);
	var rotatePos = new PIXI.Point(this.target.pivot.x,this.target.pivot.y);
	var ws = new PIXI.Point(1,1);
	this.worldScaleOf(this.target,ws);
	rotatePos.y -= CONST.ROTATE_L * ws.y;//(this.target.height/2 + CONST.ROTATE_L);
	rotatePos = this.designerLayer.toLocal(rotatePos,this.target);

	this.hotPoints[CONST.ROTATE] = new PIXI.Rectangle(rotatePos.x-CONST.HOT_SPOT_R,rotatePos.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	
	// this.hotPoints[CONST.ROTATE] 	= new PIXI.Rectangle(transformedBounds.pC.x-CONST.HOT_SPOT_R,transformedBounds.pC.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);

	var idx;
	var gwps = [];
	this.gradientPoints = [];
	for(idx in this.target.gradientPoints) {
		var gp = this.target.gradientPoints[idx];
		var gpt = new PIXI.Point(gp.x, gp.y);
		gpt = this.designerLayer.toLocal(gpt,this.target);
		gwps.push(gpt);
		this.gradientPoints.push(new PIXI.Rectangle(gpt.x-CONST.HOT_SPOT_R, gpt.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2));
	}
	if(this.gradientMode) {
    	// this.gradientStyle = SHAPEFX.LINEAR;

		if(this.target.style.fill && this.target.style.gradientFill) {
			this.selectionRect.lineStyle(1,0x2980B9,1);
			if(this.target.style.gradientStyle === SHAPEFX.LINEAR) {
				this.selectionRect.moveTo(gwps[0].x,gwps[0].y);
				this.selectionRect.lineTo(gwps[1].x,gwps[1].y);
			} else {
				this.selectionRect.drawCircle(gwps[0].x,gwps[0].y,gwps[1].x - gwps[0].x);
				this.selectionRect.drawCircle(gwps[2].x,gwps[2].y,gwps[3].x - gwps[2].x);
			}
			
			this.selectionRect.lineStyle(2,0xE67E22,1);
			this.selectionRect.beginFill(0x2980B9,1);
			for(idx in gwps) {
				this.selectionRect.drawCircle(gwps[idx].x,gwps[idx].y,CONST.HOT_SPOT_R);
			}
			this.selectionRect.endFill();
			
		}
	} else {
		this.selectionRect.beginFill(0xFFF90A,1);
		this.selectionRect.drawCircle(mpTop.x,mpTop.y,CONST.HOT_SPOT_R);
		this.selectionRect.drawCircle(mpRight.x,mpRight.y,CONST.HOT_SPOT_R);
		this.selectionRect.drawCircle(mpBottom.x,mpBottom.y,CONST.HOT_SPOT_R);
		this.selectionRect.drawCircle(mpLeft.x,mpLeft.y,CONST.HOT_SPOT_R);
		this.selectionRect.endFill();

		this.selectionRect.lineStyle(1,0x2980B9,1);
		this.selectionRect.drawCircle(mpAnchor.x,mpAnchor.y,CONST.ROTATE_L);
		this.selectionRect.lineStyle(2,0xE67E22,1);

		this.selectionRect.beginFill(0xFC0035,1);
		this.selectionRect.drawCircle(rotatePos.x,rotatePos.y,CONST.HOT_SPOT_R);
		this.selectionRect.endFill();
		this.selectionRect.beginFill(0x16A085,1);
		this.selectionRect.drawCircle(mpAnchor.x,mpAnchor.y,CONST.HOT_SPOT_R);
		this.selectionRect.endFill();
	}
};

PESelectionHandler.prototype.updateSelectionHandlesForShapes = function() {
	'use strict';
	if(!this.target) return;
	var bounds = new PointRect(this.target.getLocalBounds());
	var transformedBounds = bounds.transform(this.target,this.designerLayer);

	this.selectionRect.clear();
	var wps = [];
	this.controlPoints = [];
	var idx;
	for(idx in this.target.controlPoints) {
		var cp = this.target.controlPoints[idx];
		var pt = new PIXI.Point(cp.x, cp.y);
		pt = this.designerLayer.toLocal(pt,this.target);
		wps.push(pt);
		this.controlPoints.push(new PIXI.Rectangle(pt.x-CONST.HOT_SPOT_R, pt.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2));
	}

	var gwps = [];
	this.gradientPoints = [];
	for(idx in this.target.gradientPoints) {
		var gp = this.target.gradientPoints[idx];
		var gpt = new PIXI.Point(gp.x, gp.y);
		gpt = this.designerLayer.toLocal(gpt,this.target);
		gwps.push(gpt);
		this.gradientPoints.push(new PIXI.Rectangle(gpt.x-CONST.HOT_SPOT_R, gpt.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2));
	}

	this.selectionRect.clear();

	this.selectionRect.lineStyle(2,0xE67E22,1);
	if(!this.gradientMode) {
		this.selectionRect.moveTo(wps[0].x,wps[0].y);
		for(idx = 1; idx < wps.length; idx++) {
			this.selectionRect.lineTo(wps[idx].x,wps[idx].y);
		}
		this.selectionRect.lineTo(wps[0].x,wps[0].y);
	}
	var mpAnchor 	= this.designerLayer.toLocal(this.target.pivot,this.target);

	this.hotPoints[CONST.FRAME] 		= new PIXI.Polygon(wps);

	this.hotPoints[CONST.ANCHOR] 		= new PIXI.Rectangle(mpAnchor.x-CONST.HOT_SPOT_R, mpAnchor.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);

	var rotatePos = new PIXI.Point(this.target.pivot.x,this.target.pivot.y);
	var ws = new PIXI.Point(1,1);
	this.worldScaleOf(this.target,ws);
	rotatePos.y -= CONST.ROTATE_L * ws.y;//(this.target.height/2 + CONST.ROTATE_L);
	rotatePos = this.designerLayer.toLocal(rotatePos,this.target);

	this.hotPoints[CONST.ROTATE] = new PIXI.Rectangle(rotatePos.x-CONST.HOT_SPOT_R,rotatePos.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	
	if(this.gradientMode) {
    	this.gradientStyle = SHAPEFX.LINEAR;

		if(this.target.style.fill && this.target.style.gradientFill) {
			this.selectionRect.lineStyle(1,0x2980B9,1);
			if(this.target.style.gradientStyle === SHAPEFX.LINEAR) {
				this.selectionRect.moveTo(gwps[0].x,gwps[0].y);
				this.selectionRect.lineTo(gwps[1].x,gwps[1].y);
			} else {
				this.selectionRect.drawCircle(gwps[0].x,gwps[0].y,gwps[1].x - gwps[0].x);
				this.selectionRect.drawCircle(gwps[2].x,gwps[2].y,gwps[3].x - gwps[2].x);
			}
			
			this.selectionRect.lineStyle(2,0xE67E22,1);
			this.selectionRect.beginFill(0x2980B9,1);
			for(idx in gwps) {
				this.selectionRect.drawCircle(gwps[idx].x,gwps[idx].y,CONST.HOT_SPOT_R);
			}
			this.selectionRect.endFill();
			
		}
	} else {
		this.selectionRect.beginFill(0xFFF90A,1);
		for(idx in wps) {
			this.selectionRect.drawCircle(wps[idx].x,wps[idx].y,CONST.HOT_SPOT_R);
		}
		this.selectionRect.endFill();


		this.selectionRect.lineStyle(1,0x2980B9,1);
		this.selectionRect.drawCircle(mpAnchor.x,mpAnchor.y,CONST.ROTATE_L);
		this.selectionRect.lineStyle(2,0xE67E22,1);

		this.selectionRect.beginFill(0xFC0035,1);
		this.selectionRect.drawCircle(rotatePos.x,rotatePos.y,CONST.HOT_SPOT_R);
		this.selectionRect.endFill();
		this.selectionRect.beginFill(0x16A085,1);
		this.selectionRect.drawCircle(mpAnchor.x,mpAnchor.y,CONST.HOT_SPOT_R);
		this.selectionRect.endFill();
	}
};

PESelectionHandler.prototype.updateSelectionHandlesForSprites = function() {
	if(!this.target) return;
	var bounds = new PointRect(this.target.getLocalBounds());
	var transformedBounds = bounds.transform(this.target,this.designerLayer);

	this.selectionRect.clear();
	this.selectionRect.lineStyle(2,0xE67E22,1);
	this.selectionRect.moveTo(transformedBounds.pA.x,transformedBounds.pA.y);
	this.selectionRect.lineTo(transformedBounds.pB.x,transformedBounds.pB.y);
	this.selectionRect.lineTo(transformedBounds.pC.x,transformedBounds.pC.y);
	this.selectionRect.lineTo(transformedBounds.pD.x,transformedBounds.pD.y);
	this.selectionRect.lineTo(transformedBounds.pA.x,transformedBounds.pA.y);

	var mpTop 		= midpoint(transformedBounds.pA,transformedBounds.pB);//TOP
	var mpRight 	= midpoint(transformedBounds.pB,transformedBounds.pC);//RIGHT
	var mpBottom 	= midpoint(transformedBounds.pC,transformedBounds.pD);//BOTTOM
	var mpLeft 		= midpoint(transformedBounds.pD,transformedBounds.pA);//LEFT

	// var mpAnchor 	= this.designerLayer.toLocal(this.target.pp,this.target);
	var mpAnchor 	= this.designerLayer.toLocal(this.target.pivot,this.target);

	this.hotPoints[CONST.TOP] 			= new PIXI.Rectangle(mpTop.x-CONST.HOT_SPOT_R, mpTop.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.BOTTOM] 		= new PIXI.Rectangle(mpBottom.x-CONST.HOT_SPOT_R, mpBottom.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.LEFT] 			= new PIXI.Rectangle(mpLeft.x-CONST.HOT_SPOT_R, mpLeft.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.RIGHT] 		= new PIXI.Rectangle(mpRight.x-CONST.HOT_SPOT_R, mpRight.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2,CONST.HOT_SPOT_R*2);
	this.hotPoints[CONST.FRAME] 		= new PIXI.Polygon(transformedBounds.pA,transformedBounds.pB,transformedBounds.pC,transformedBounds.pD);

	this.hotPoints[CONST.ANCHOR] 		= new PIXI.Rectangle(mpAnchor.x-CONST.HOT_SPOT_R, mpAnchor.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);

	// var rotatePos = new PIXI.Point(this.target.pp.x,this.target.pp.y);
	var rotatePos = new PIXI.Point(this.target.pivot.x,this.target.pivot.y);
	var ws = new PIXI.Point(1,1);
	this.worldScaleOf(this.target,ws);
	rotatePos.y -= CONST.ROTATE_L * ws.y;//(this.target.height/2 + CONST.ROTATE_L);
	rotatePos = this.designerLayer.toLocal(rotatePos,this.target);

	this.hotPoints[CONST.ROTATE] = new PIXI.Rectangle(rotatePos.x-CONST.HOT_SPOT_R,rotatePos.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);
	
	// this.hotPoints[CONST.ROTATE] 	= new PIXI.Rectangle(transformedBounds.pC.x-CONST.HOT_SPOT_R,transformedBounds.pC.y-CONST.HOT_SPOT_R, CONST.HOT_SPOT_R*2, CONST.HOT_SPOT_R*2);


	this.selectionRect.beginFill(0xFFF90A,1);
	this.selectionRect.drawCircle(mpTop.x,mpTop.y,CONST.HOT_SPOT_R);
	this.selectionRect.drawCircle(mpRight.x,mpRight.y,CONST.HOT_SPOT_R);
	this.selectionRect.drawCircle(mpBottom.x,mpBottom.y,CONST.HOT_SPOT_R);
	this.selectionRect.drawCircle(mpLeft.x,mpLeft.y,CONST.HOT_SPOT_R);
	this.selectionRect.endFill();

	this.selectionRect.lineStyle(1,0x2980B9,1);
	this.selectionRect.drawCircle(mpAnchor.x,mpAnchor.y,CONST.ROTATE_L);
	this.selectionRect.lineStyle(2,0xE67E22,1);

	this.selectionRect.beginFill(0xFC0035,1);
	this.selectionRect.drawCircle(rotatePos.x,rotatePos.y,CONST.HOT_SPOT_R);
	this.selectionRect.endFill();
	this.selectionRect.beginFill(0x16A085,1);
	this.selectionRect.drawCircle(mpAnchor.x,mpAnchor.y,CONST.HOT_SPOT_R);
	this.selectionRect.endFill();
};