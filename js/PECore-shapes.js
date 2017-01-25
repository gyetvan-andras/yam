Vue.component('shapes', {
  replace: true,
	template: '#shapes-template',
	created: function() {
		var thiz = this;
	},
  methods: {
  	newShape: function(shape_name) {
  		this.$root.newShape(shape_name);	
  		this.show = false;
  	}
  }
});

PECore.prototype.gradientPopupClick = function(e) {
	e.stopPropagation();
};

PECore.prototype.editGradient = function(datgui) {
	'use strict';
	var self = this;
	var popup;
	var popups = $(datgui).find('.gradient-popup');
	if(popups.length > 0) {
		$(datgui).find('.gradient-popup').remove();
		self.selectionHandler.setGradientMode(false);
		self.manualRefresh();
	} else {
		self.selectionHandler.setGradientMode(true);
		self.manualRefresh();
		popup = $("<div class='gradient-popup'></div>");
		popup.click(this.gradientPopupClick);
		$(datgui).append(popup);
		var colorStops = [];
		for(var idx in this.activeTarget.style.gradientColors) {
			var colorStop = this.activeTarget.style.gradientColors[idx];
			var colorStopStr = colorStop.color + ' ' + (colorStop.stop * 100) + '%';
			colorStops.push(colorStopStr);
		}
		$(popup).gradientPicker({
			change: function(points, gradientColors) {
				var style = self.activeTarget.style;
				style.gradientColors = gradientColors;
				self.activeTarget.style = style;
			},
			controlPoints: colorStops
		});
	}
};

PECore.prototype.newShape = function(shape_name) {
	'use strict';
	var self = this;
	var sfx = new ShapeFx();
	sfx.type = OBJ_TYPE.SHAPE;
	if(self.activeTarget) {
		self.activeTarget.addChild(sfx);
		self.addChildNodeTo(self.activeTarget,sfx);
	} else {
		sfx.position.x = self.yamProperties.frameWidth/2;
		sfx.position.y = self.yamProperties.frameHeight/2;
		self.objectLayer.addChild(sfx);
		self.addChildNodeTo(self.objectLayer,sfx);
	}
	// style = sfx.style;
	// sfx.style = style;
	switch(shape_name) {
		case 'circle':
			sfx.kind = SHAPEFX.CIRCLE;
			break;
		case 'rect':
			sfx.kind = SHAPEFX.RECT;
			break;
		case 'line':
			sfx.kind = SHAPEFX.LINE;
			break;
		case 'triangle':
			sfx.kind = SHAPEFX.TRIANGLE;
			break;
	}
	self.manualRefresh();
};