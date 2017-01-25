PECore.prototype.initUX = function() {
	'use strict';
	var self = this;
	// if(!jQuery.browser.mozilla) {
	var footer = $( "#footer-row" );
	footer.resizable({
	  handles: "n"
	});
	footer.on( "resize", function( event, ui ) {
		self.resizeCanvases();
	});
	// var hierarchy = $( "#left-col" );
	// hierarchy.resizable({
	//   handles: "e"
	// });
	// hierarchy.on( "resize", function( event, ui ) {
	// 	self.resizeCanvases();
	// });
	// }
	$(window).resize(function() {
		self.resizeCenterColumn();
		self.resizeCanvases();
	});
	self.resizeCenterColumn();
	self.resizeCanvases();
};

PECore.prototype.getCanvasDimension = function(container) {
	'use strict';
	var view = $(container);
	var w = view.width();
	var h = view.height();
	return ({w:w, h:h});
};

PECore.prototype.getMainCanvasDimension = function() {
	'use strict';
	var container = document.getElementById('editor_canvas_holder');
	return this.getCanvasDimension(container);
};

PECore.prototype.getTimelineCanvasDimension = function() {
	'use strict';
	var container = document.getElementById('timeline_canvas_holder');
	return this.getCanvasDimension(container);
};

PECore.prototype.getTimelineScaleCanvasDimension = function() {
	'use strict';
	var container = document.getElementById('timing_scale_canvas_holder');
	return this.getCanvasDimension(container);
};

PECore.prototype.resizeCenterColumn = function() {
	'use strict';
	var self = this;
	var w_frame = $("#main-frame").width();
	var w_right = $("#right-col").width();
	var w_left = $("#left-col").width();
	var w_center = $("#editor_canvas_holder").width();
	var w = w_frame - w_right - w_left - 16;
	// if(w !== w_center) {
		// console.log("Center col width:"+w_center+" Calculated width:"+w);
		var ch1 = document.getElementById("timeline_canvas_holder");
		var ch2 = document.getElementById("timing_scale_canvas_holder");
		var ch3 = document.getElementById("editor_canvas_holder");

		ch1.style.width = w+'px';
		ch2.style.width = w+'px';
		ch3.style.width = w+'px';
		
		var dim = this.getTimelineScaleCanvasDimension();
		this.timelineScaleRenderer.resize(w,dim.h);

		dim = this.getTimelineCanvasDimension();
		this.timelineRenderer.resize(w,dim.h);
		this.timelineScroller.resize(w,dim.h);

		dim = this.getMainCanvasDimension();
		this.renderer.resize(w,dim.h);
		this.stageScroller.resize(w,dim.h);

	// }
	// document.
};

PECore.prototype.resizeCanvases = function() {
	'use strict';
	var dim = this.getMainCanvasDimension();
	this.renderer.resize(dim.w,dim.h);
	this.stageScroller.resize(dim.w,dim.h);

	dim = this.getTimelineCanvasDimension();
	this.timelineRenderer.resize(dim.w,dim.h);
	this.timelineScroller.resize(dim.w,dim.h);

	dim = this.getTimelineScaleCanvasDimension();
	this.timelineScaleRenderer.resize(dim.w,dim.h);

	this.manualRefresh();

};