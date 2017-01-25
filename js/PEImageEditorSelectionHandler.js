var IMG_EDT_CONST = {
	OUTSIDE:-1,

	ROTATE:0,
	FRAME:1,
	CONTROL_POINT:2,

	HOT_SPOT_R:5,
	ROTATE_L:30
};

function PEImageEditorSelectionHandler(owner,parent) {
	'use strict';
	this.owner = owner;
	this.parent = parent;	
	this.selectionRect = new PIXI.Graphics();
	this.selectionRect.visible = false;
	this.parent.addChild(this.selectionRect);
	this.controlPoints = [];
	this.currentControlPointIdx = -1;
	this.hotPoints = [];
	this.dragging = IMG_EDT_CONST.OUTSIDE;
}

PEImageEditorSelectionHandler.prototype.onMouseDown = function(event,first)
{
	'use strict';
	if(!this.isVisible()) return;
	var globalMousePos = event.data.global;
	var localMousePos = this.selectionRect.toLocal(globalMousePos);
	this.dragging = this.mapPointToHotspot(localMousePos);
	if(this.dragging != IMG_EDT_CONST.OUTSIDE) {
		// this.selectionRect.alpha = 0.1;
		if(first) this.dragging = IMG_EDT_CONST.FRAME;
		switch(this.dragging) {
			case IMG_EDT_CONST.ROTATE:
				this.globalPosOfInterest = rectCenter(this.hotPoints[IMG_EDT_CONST.ROTATE]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case IMG_EDT_CONST.FRAME:
				this.globalPosOfInterest = this.target.position;//this.target.parent.toGlobal(this.target.position);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
			case IMG_EDT_CONST.CONTROL_POINT:
				// this.startPos = this.target.position.clone();
				this.globalPosOfInterest = rectCenter(this.controlPoints[this.currentControlPointIdx]);
				this.globalOffset = new PIXI.Point(globalMousePos.x - this.globalPosOfInterest.x,globalMousePos.y - this.globalPosOfInterest.y);
				break;
		}
	}
};

PEImageEditorSelectionHandler.prototype.onMouseUp = function(event)
{
	'use strict';
	if(!this.isVisible()) return;
	this.dragging = IMG_EDT_CONST.OUTSIDE;
	// this.selectionRect.alpha = 1;
	document.body.style.cursor = 'default';
	this.owner.renderImageEditor();
};

PEImageEditorSelectionHandler.prototype.onMouseMove = function(event)
{
	'use strict';
	if(!this.isVisible()) return;
	var globalMousePos = event.data.global;
	var localMousePos = this.selectionRect.toLocal(globalMousePos);
	if(this.dragging != IMG_EDT_CONST.OUTSIDE) {
		var globalNewPos = new PIXI.Point(
			globalMousePos.x - this.globalOffset.x,
			globalMousePos.y - this.globalOffset.y); 
		var adjustedGlobalNewPos = new PIXI.Point(
			globalMousePos.x - this.globalOffset.x,
			globalMousePos.y - this.globalOffset.y
		); 
		var top, bottom, newHeight;
		var right, left, newWidth;
		switch(this.dragging) {
			case IMG_EDT_CONST.ROTATE:
				var mpAnchor = this.selectionRect.toLocal(this.target.pivot,this.target);
				var angle = Math.atan2(localMousePos.x- mpAnchor.x, - (localMousePos.y - mpAnchor.y) )*(180/Math.PI);  
				this.target.rotationInDeg = angle;
				break;
			case IMG_EDT_CONST.FRAME:
				var newPosition = globalNewPos;//this.target.parent.toLocal(globalNewPos);
				this.target.position = newPosition;
				break;
			case IMG_EDT_CONST.CONTROL_POINT:
				var newControlPosition = this.target.toLocal(globalNewPos,this.selectionRect);
				this.target.moveControlPointTo(this.currentControlPointIdx,newControlPosition);
				break;
		}
		this.updateSelectionHandles();
	} else {
		var hotspot = this.mapPointToHotspot(localMousePos);
		var cursor = 'pointer';
		switch(hotspot) {
			case IMG_EDT_CONST.CONTROL_POINT:
				cursor = 'crosshair';
				break;
			case IMG_EDT_CONST.ROTATE:
				cursor = 'crosshair';
				break;
			case IMG_EDT_CONST.FRAME:
				cursor = 'move';
				break;
			default:
				cursor = 'default';
		}
		document.body.style.cursor = cursor;
		// console.log('Mouse hover over '+hsmsg);
	}
};

PEImageEditorSelectionHandler.prototype.mapPointToHotspot = function(pt) {
	'use strict';
	if(!this.target) return IMG_EDT_CONST.OUTSIDE;

	this.currentControlPointIdx = -1;
	// if(this.hotPoints[IMG_EDT_CONST.ROTATE].contains(pt.x,pt.y)) return IMG_EDT_CONST.ROTATE;
	var idx;
	for(idx = 0; idx < this.controlPoints.length; idx++) {
		var hp = this.controlPoints[idx]; 
		if(hp.contains(pt.x,pt.y)) {
			this.currentControlPointIdx = idx;
			return IMG_EDT_CONST.CONTROL_POINT;
		}
	}
	var gpt = this.selectionRect.toGlobal(pt);
	if(this.target.containsPoint(gpt)) return IMG_EDT_CONST.FRAME;
	return IMG_EDT_CONST.OUTSIDE;
};

PEImageEditorSelectionHandler.prototype.setVisible = function(visible) {
	'use strict';
	if(visible) {
		if(this.target) {
			this.updateSelectionHandles();
			this.selectionRect.visible = true;
		}
	} else {
		this.selectionRect.visible = false;
	}
	this.owner.renderImageEditor();
};

PEImageEditorSelectionHandler.prototype.isVisible = function() {
	'use strict';
	if(this.target) {
		return this.selectionRect.visible;
	} else {
		return false;
	}
};

PEImageEditorSelectionHandler.prototype.assignTo = function(target) {
	'use strict';
	if(target) {
		this.target = target;
		this.updateSelectionHandles();
		this.selectionRect.visible = true;
	} else {
		this.selectionRect.visible = false;		
		this.target = undefined;
		this.dragging = IMG_EDT_CONST.OUTSIDE;
	}
};

PEImageEditorSelectionHandler.prototype.worldScaleOf = function(target,ws) {
	'use strict';
	ws.x = ws.x * (1/target.scale.x);
	ws.y = ws.y * (1/target.scale.y);
	if(target.parent) {
		this.worldScaleOf(target.parent,ws);
	}
};

PEImageEditorSelectionHandler.prototype.updateSelectionHandles = function() {
	'use strict';
	if(!this.target) return;
	this.updateSelectionHandlesForShapes();
	this.owner.renderImageEditor();
};

PEImageEditorSelectionHandler.prototype.updateSelectionHandlesForShapes = function() {
	'use strict';

	this.selectionRect.clear();
	var wps = [];
	this.controlPoints = [];
	var idx;
	for(idx in this.target.controlPoints) {
		var cp = this.target.controlPoints[idx];
		var pt = new PIXI.Point(cp.x, cp.y);
		pt = this.selectionRect.toLocal(pt,this.target);
		wps.push(pt);
		this.controlPoints.push(new PIXI.Rectangle(pt.x-IMG_EDT_CONST.HOT_SPOT_R, pt.y-IMG_EDT_CONST.HOT_SPOT_R, IMG_EDT_CONST.HOT_SPOT_R*2, IMG_EDT_CONST.HOT_SPOT_R*2));
	}

	this.selectionRect.clear();

	this.selectionRect.lineStyle(2,0xE67E22,1);
	this.selectionRect.moveTo(wps[0].x,wps[0].y);
	for(idx = 1; idx < wps.length; idx++) {
		this.selectionRect.lineTo(wps[idx].x,wps[idx].y);
	}
	this.selectionRect.lineTo(wps[0].x,wps[0].y);

	this.hotPoints[IMG_EDT_CONST.FRAME] 		= new PIXI.Polygon(wps);
	
	this.selectionRect.beginFill(0xFFF90A,1);
	for(idx in wps) {
		this.selectionRect.drawCircle(wps[idx].x,wps[idx].y,IMG_EDT_CONST.HOT_SPOT_R);
	}
	this.selectionRect.endFill();

};
