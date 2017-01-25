
PECore.prototype.createTimeline = function() {
	'use strict';
	// var MAX_LENGTH_IN_SEC = 10;
	// var WIDTH_OF_SEC_IN_PX = 200;
	// var MAX_WIDTH_IN_PX = MAX_LENGTH_IN_SEC * WIDTH_OF_SEC_IN_PX;
	// var WIDTH_OF_MSEC_IN_PX = WIDTH_OF_SEC_IN_PX/1000;

	var self = this;
	var h;

	// timing_scale_canvas_holder

	this.timelineScaleRenderer = new PIXI.CanvasRenderer(
		TL_CONST.CANVAS_WIDTH_IN_PX,
		TL_CONST.RULE_HEIGHT_IN_PX,
		{
			antialias:true,
			preserveDrawingBuffer:true,
			transparent:false
		});

	this.timelineRenderer = new PIXI.CanvasRenderer(
		TL_CONST.CANVAS_WIDTH_IN_PX,
		TL_CONST.TIMELINE_HEIGHT_IN_PX,
		{
			antialias:true,
			preserveDrawingBuffer:true,
			transparent:false
		});

	this.timelineRenderer.backgroundColor = TL_CONST.CANVAS_COLOR;//0x2F2C2C;//0x2C3E50;//0x3e3a3a;
	var timelineholder = document.getElementById('timeline_canvas_holder');
	timelineholder.appendChild(this.timelineRenderer.view);

	this.timelineScaleRenderer.backgroundColor = TL_CONST.CANVAS_COLOR;//0x2F2C2C;//0x2C3E50;//0x3e3a3a;
	var timelinescaleholder = document.getElementById('timing_scale_canvas_holder');
	timelinescaleholder.appendChild(this.timelineScaleRenderer.view);

	this.timelineScaleRulerStage = new PIXI.Container();

	// this.timelineRulerStage = new PIXI.Container();

	this.timelineRootStage = new PIXI.Container();
	this.timelineContentStage = new PIXI.Container();

	this.timelineMarker = new PIXI.Graphics();
	this.timelineMarker.lineStyle(1, TL_CONST.MARKER_COLOR, 1);
	this.timelineMarker.moveTo(0,2);
	this.timelineMarker.lineTo(0,TL_CONST.RULE_HEIGHT_IN_PX);

	h = TL_CONST.RULE_HEIGHT_IN_PX;
	var tl_ruler_bg = new PIXI.Graphics();
	tl_ruler_bg.beginFill(TL_CONST.CANVAS_COLOR,1);
	tl_ruler_bg.drawRect(0,0,TL_CONST.MAX_WIDTH_IN_PX,TL_CONST.RULE_HEIGHT_IN_PX);
	tl_ruler_bg.endFill();
	tl_ruler_bg.lineStyle(1, TL_CONST.LINE_COLOR, 1);
	tl_ruler_bg.moveTo(0,TL_CONST.RULE_HEIGHT_IN_PX);
	tl_ruler_bg.lineTo(TL_CONST.MAX_WIDTH_IN_PX,TL_CONST.RULE_HEIGHT_IN_PX);

	var tl_ruler_scale = new PIXI.Graphics();
	tl_ruler_scale.lineStyle(1, TL_CONST.LINE_COLOR, 1);

	h = TL_CONST.RULE_HEIGHT_IN_PX;
	var i,x;
	for(i = 0; i <= 100; i++) {//draw line by 100 msec
		x = (i*100 * TL_CONST.WIDTH_OF_MSEC_IN_PX);
		if(i%10 === 0) {
			tl_ruler_bg.moveTo(x,h-1);
			tl_ruler_bg.lineTo(x,h-8);
		} else {
			tl_ruler_bg.moveTo(x,h-1);
			tl_ruler_bg.lineTo(x,h-5);
		}
	}

	tl_ruler_scale.lineStyle(1, TL_CONST.LINE_COLOR, 0.4);
	for(i = 0; i <= 100; i += 10) {
		x = (i*100 * TL_CONST.WIDTH_OF_MSEC_IN_PX);
		tl_ruler_scale.moveTo(x,0);
		tl_ruler_scale.lineTo(x,TL_CONST.TIMELINE_HEIGHT_IN_PX);
	}

	// tl_ruler_scale.position.x = 10;
	// tl_ruler_bg.position.x = 10;

	this.timelineContentStage.addChild(tl_ruler_scale);
	this.timelineScaleRulerStage.addChild(tl_ruler_bg);

	for(i = 0; i <= 100; i += 10) {//draw line by 100 msec
		x = (i*100 * TL_CONST.WIDTH_OF_MSEC_IN_PX);// + 10;
		var label = ''+i/10;
		var text = new PIXI.Text(label,{font : '10px Verdana', strokeThickness:0.5, align : 'center', fill:TL_CONST.LINE_COLOR_STR, stroke:TL_CONST.LINE_COLOR_STR});
		text.position.x = x - (text.width/2);
		text.position.y = 2;
		this.timelineScaleRulerStage.addChild(text);
	}
	this.timelineScaleRulerStage.addChild(this.timelineMarker);

	self.timelineScaleRulerStage.x = 10;
	this.timelineRootStage.position.x = 10;
	this.timelineRootStage.addChild(this.timelineContentStage);
	// this.timelineRootStage.addChild(this.timelineRulerStage);
	// this.timelineContentStage.addChild(this.timelineMarker);

	this.timelineRootStage.interactive = true;
	this.timelineRootStage.hitArea = new PIXI.Rectangle(0,0,TL_CONST.CANVAS_WIDTH_IN_PX,TL_CONST.TIMELINE_HEIGHT_IN_PX);

	this.timelineMarker.interactive = true;
	this.timelineMarker.hitArea = new PIXI.Rectangle(-10,0,20,TL_CONST.RULE_HEIGHT_IN_PX);

	// this.timelineContentStage.position.y = TL_CONST.RULE_HEIGHT_IN_PX + 2;

 	this.timelineScroller = new Scrollbars(this.timelineRootStage,this.timelineContentStage,
	  	TL_CONST.CANVAS_WIDTH_IN_PX,
	  	TL_CONST.TIMELINE_HEIGHT_IN_PX,
	  	0,TL_CONST.MAX_WIDTH_IN_PX,
	  	0,TL_CONST.TIMELINE_HEIGHT_IN_PX, function() {
	  		self.timelineScaleRulerStage.x = self.timelineContentStage.position.x + 10;
	  		self.manualRefresh();
		}
	);
	this.timelineRenderer.view.onmousewheel = function(ev){
		self.timelineScroller.zeroBasedWheelBy(ev.wheelDeltaX,ev.wheelDeltaY);
		return false;
	};

	this.animationManager = new PEAnimationManager(this.timelineContentStage,self);

	var dragging = false;
	var startx = 0;
	var dx = 0;
	function mouseDown(event) {
		dragging = true;
		startx = event.data.getLocalPosition(self.timelineMarker.parent).x;
		dx = self.timelineMarker.position.x - startx;
	}
	function mouseUp(event) {
		dragging = false;
	}
	function mouseMove(event) {
		if(dragging) {
			var px = event.data.getLocalPosition(self.timelineMarker.parent).x + dx;
			if(px < 0) px = 0;
			if(px > TL_CONST.MAX_WIDTH_IN_PX) px = TL_CONST.MAX_WIDTH_IN_PX;
			self.timelineMarker.position.x = px;

			var moveTo = (px/TL_CONST.WIDTH_OF_MSEC_IN_PX)/1000;

			self.animationManager.moveTimeTo(moveTo);
			// self.animationManager.tweenTimeline.gotoAndStop(moveTo);
			// self.animationManager.moverMarkerTo(moveTo);

			// self.moveBackgroundToTime((px/TL_CONST.WIDTH_OF_MSEC_IN_PX)/1000);
			// self.manualRefresh();

		}
	}
	this.timelineMarker
	    .on('mousedown', mouseDown)
	    .on('mouseup', mouseUp)
	    .on('mouseupoutside', mouseUp)
	    .on('mousemove', mouseMove);
	this.timelineMarker.position.x = 0;
};

