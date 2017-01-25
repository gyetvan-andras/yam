var SCROLLBARS = {
	W:12,
	BG:0x7F8C8D,
	FG:0xECF0F1,

	DRAG_VERTICAL:1,
	DRAG_HORIZONTAL:2,
	DRAG_NONE:3
};

function ScrollbarHitArea(sb) {
	this.sb = sb;
}

ScrollbarHitArea.prototype.contains = function(x,y) {
	return this.sb.vRect.contains(x,y) || this.sb.hRect.contains(x,y);
};

function Scrollbars(root,target,w,h, xmin,xmax,ymin,ymax,cb) {
	'use strict';
	var self = this;
	this.callback = cb;
	this.drag = SCROLLBARS.DRAG_NONE;
	var g = new PIXI.Graphics();
	this.graphics = g;
	root.addChild(g);
	this.updateSettings(root,target,w,h, xmin,xmax,ymin,ymax);
	// this.draw();
	g.interactive = true;
	g.on('mousedown', function(event) {
		var lp = g.toLocal(event.data.global);
		if((self.fullH > self.viewH) && self.thumbV.contains(lp.x,lp.y)) {
			self.drag = SCROLLBARS.DRAG_VERTICAL;
			self.prev = lp;
		} else if((self.fullW > self.viewW) && self.thumbH.contains(lp.x,lp.y)) {
			self.drag = SCROLLBARS.DRAG_HORIZONTAL;
			self.prev = lp;
		} else {
			self.drag = SCROLLBARS.DRAG_NONE;
		}
		// console.log('sb:mousedown');
	});
	g.on('mousemove', function(event) {
		if(self.drag == SCROLLBARS.DRAG_NONE) return;
		var lp = g.toLocal(event.data.global);
		var delta = new PIXI.Point(lp.x - self.prev.x, lp.y - self.prev.y);
		switch(self.drag) {
			case SCROLLBARS.DRAG_VERTICAL:
				self.prev = lp;
				delta.x = 0;
				self.scroll(delta);
				// console.log('sb:mousemove vert:'+delta.y);
				break;
			case SCROLLBARS.DRAG_HORIZONTAL:
				self.prev = lp;
				delta.y = 0;
				self.scroll(delta);
				// console.log('sb:mousemove horz:'+delta.x);
				break;
		}
	});
	g.on('mouseupoutside',function(event) {
		self.drag = SCROLLBARS.DRAG_NONE;
		// console.log('sb:mouseupoutside');
	});	
	g.on('mouseup', function(event) {
		self.drag = SCROLLBARS.DRAG_NONE;
		// console.log('sb:mouseup');
	});		
}

Scrollbars.prototype.resize = function(w,h) {
	this.viewW = w;
	this.viewH = h;
	this.hScale = (this.viewW/this.fullW);
	this.vScale = (this.viewH/this.fullH);
	this.hBar = this.viewW * this.hScale;
	this.vBar = this.viewH * this.vScale;
	this.vRect = new PIXI.Rectangle(this.viewW-SCROLLBARS.W + 1,0,SCROLLBARS.W,this.viewH-SCROLLBARS.W);
	this.hRect = new PIXI.Rectangle(0,this.viewH-SCROLLBARS.W + 1,this.viewW-SCROLLBARS.W,SCROLLBARS.W);
	this.hitArea = new ScrollbarHitArea(this);
	this.thumbH = new PIXI.Rectangle(0,0);
	this.thumbV = new PIXI.Rectangle(0,0);
	if(this.fullW <= this.viewW) {
		this.target.position.x= 0;
	}
	if(this.fullH <= this.viewH) {
		this.target.position.y = 0;
	}
	this.calcThumbRects();
	this.draw();
};

Scrollbars.prototype.updateSettings = function(root,target,w,h, xmin,xmax,ymin,ymax) {
	'use strict';
	var self = this;
	this.root = root;
	this.target = target;
	// this.viewW = w;
	// this.viewH = h;

	this.ymax = ymax;
	this.xmax = xmax;
	this.ymin = ymin;
	this.xmin = xmin;
	this.fullW = xmax - xmin;
	this.fullH = ymax - ymin;

	this.resize(w,h);	
	// this.hScale = (this.viewW/this.fullW);
	// this.vScale = (this.viewH/this.fullH);
	// this.hBar = this.viewW * this.hScale;
	// this.vBar = this.viewH * this.vScale;

	// this.vRect = new PIXI.Rectangle(this.viewW-SCROLLBARS.W + 1,0,SCROLLBARS.W,this.viewH-SCROLLBARS.W);
	// this.hRect = new PIXI.Rectangle(0,this.viewH-SCROLLBARS.W + 1,this.viewW-SCROLLBARS.W,SCROLLBARS.W);
	// this.hitArea = new ScrollbarHitArea(this);
	// this.thumbH = new PIXI.Rectangle(0,0);
	// this.thumbV = new PIXI.Rectangle(0,0);
	// if(this.fullW <= this.viewW) {
	// 	this.target.position.x= 0;
	// }
	// if(this.fullH <= this.viewH) {
	// 	this.target.position.y = 0;
	// }
	// this.calcThumbRects();
	// this.draw();
};

Scrollbars.prototype.scroll = function(delta) {
	'use strict';
	var self = this;
	self.thumbV.y += delta.y;
	self.thumbH.x += delta.x;
	if(self.thumbH.x < 0) self.thumbH.x = 0;
	if(self.thumbH.x > self.viewW - SCROLLBARS.W - self.hBar) self.thumbH.x = self.viewW - SCROLLBARS.W - self.hBar;
	if(self.thumbV.y < 0) self.thumbV.y = 0;
	if(self.thumbV.y > self.viewH - SCROLLBARS.W - self.vBar) self.thumbV.y = self.viewH - SCROLLBARS.W - self.vBar;
	var nx;
	if(self.xmin < 0) nx = ((self.thumbH.x + this.hBar/2) / self.hScale) + this.xmin;
	else nx = ((self.thumbH.x) / self.hScale) + this.xmin;
	
	var ny;
	if(self.ymin < 0) ny = ((self.thumbV.y + this.vBar/2) / self.vScale) + this.ymin;
	else ny = ((self.thumbV.y) / self.vScale) + this.ymin;
	
	if(this.fullW > this.viewW) self.target.position.x = -nx;
	if(this.fullH > this.viewH) self.target.position.y = -ny;
	self.draw();
	self.callback();
};

Scrollbars.prototype.zeroBasedWheelBy = function(dx,dy) {
	'use strict';
	dx *= 0.5;
	dy *= 0.5;
	var self = this;
	var pos = self.target.position;
	if(self.fullW > self.viewW) pos.x += dx;
	if(self.fullH > self.viewH) pos.y += dy;
	if(pos.x < self.viewW - (self.fullW - SCROLLBARS.W - 2)) pos.x = self.viewW - (self.fullW - SCROLLBARS.W - 2);
	if(pos.x > 0) pos.x = 0;
	if(pos.y < self.viewH - (self.fullH - 2*SCROLLBARS.W - 2)) pos.y = self.viewH - (self.fullH - 2*SCROLLBARS.W - 2);
	if(pos.y > 0) pos.y = 0;
	self.target.position = pos;
	self.calcThumbRects();
	self.draw();
	self.callback();
};

Scrollbars.prototype.wheelBy = function(dx,dy) {
	'use strict';
	// console.log('mouse wheel '+dx+','+dy);
	dx *= 0.5;
	dy *= 0.5;
	var self = this;
	if(self.fullW > self.viewW) self.target.position.x += dx;
	if(self.fullH > self.viewH) self.target.position.y += dy;

	var xmax = self.xmax - ((self.xmin < 0) ? self.viewW/2 : 0);
	var xmin = self.xmin + ((self.xmin < 0) ? self.viewW/2 : 0);

	var ymax = self.ymax - ((self.ymin < 0) ? self.viewH/2 : 0);
	var ymin = self.ymin + ((self.ymin < 0) ? self.viewH/2 : 0);

	// console.log("xmin:"+xmin+" xmax:"+xmax+" ymin:"+ymin+" ymax:"+ymax);

	if(self.target.position.x < xmin) self.target.position.x = xmin;
	if(self.target.position.x >= xmax) self.target.position.x = xmax;
	if(self.target.position.y < ymin) self.target.position.y = ymin;
	if(self.target.position.y >= ymax) self.target.position.y = ymax;

	self.calcThumbRects();
	self.draw();
	self.callback();
};

Scrollbars.prototype.calcThumbRects = function() {
	'use strict';
	var self = this;
	var virtp = 0;
	var tx = 0 - this.target.position.x;
	var ty = 0 - this.target.position.y;
	virtp = (tx - this.xmin) * this.hScale;

	var sx;
	var ex;

	if(self.xmin < 0) {
		sx = virtp - this.hBar/2;
		ex = virtp + this.hBar/2;
	} else {
		sx = virtp;
		ex = virtp + this.hBar;
	}

	this.thumbH.x = sx;
	this.thumbH.y = this.hRect.y + 2;
	this.thumbH.width = ex-sx;
	this.thumbH.height = SCROLLBARS.W-4;

	virtp = (ty - this.ymin) * this.vScale;
	var sy;
	var ey;
	if(self.ymin < 0) {
		sy = virtp - this.vBar/2;
		ey = virtp + this.vBar/2;
	} else {
		sy = virtp;
		ey = virtp + this.vBar;
	}
	this.thumbV.x = this.vRect.x + 2;
	this.thumbV.y = sy;
	this.thumbV.width = SCROLLBARS.W-4;
	this.thumbV.height = ey-sy;
};

Scrollbars.prototype.draw = function() {
	'use strict';
	var g = this.graphics;
	g.clear();
	g.beginFill(SCROLLBARS.BG);
	if(this.fullW > this.viewW) {
		g.drawRect(this.hRect.x,this.hRect.y,this.hRect.width,this.hRect.height);
	}
	if(this.fullH > this.viewH) {
		g.drawRect(this.vRect.x,this.vRect.y,this.vRect.width,this.vRect.height);
	}
	g.endFill();
	g.beginFill(SCROLLBARS.FG);
	var virtp = 0;
	if(this.fullW > this.viewW) {
		g.drawRoundedRect(this.thumbH.x,this.thumbH.y,this.thumbH.width,this.thumbH.height,4);
		// g.drawRect(this.thumbH.x,this.thumbH.y,this.thumbH.width);
	}
	if(this.fullH > this.viewH) {
		g.drawRoundedRect(this.thumbV.x,this.thumbV.y,this.thumbV.width,this.thumbV.height,4);
		// g.drawRect(this.thumbV.x,this.thumbV.y,this.thumbV.width);
	}
	g.endFill();
};