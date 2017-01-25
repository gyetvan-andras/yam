function PETweenableColor(target,property) {
	'use strict';
	this.target = target;
	this._property = property;
	this._startColor = 0;
	this._endColor = 0;
	this._startRGB = {r:0, g:0, b:0}; 
	this._endRGB = {r:0, g:0, b:0}; 
	this._deltaRGB = {r:0, g:0, b:0}; 
	this._progress = 0;
	// this.startColor = startTint;
	// this.endColor = endTint;
}

PETweenableColor.prototype.toRGB = function(color) {
	'use strict';
	var r, g, b = 0;
	// b = color & 0x0000FF;
	// g = (color & 0x00FF00) >> 8;
	// r = (color & 0xFF0000) >> 16;
	b = color & 0xFF;
	g = (color >> 8) & 0xFF;
	r = (color >> 16) & 0xFF;
	return {r:r, g:g, b:b}; 
};

PETweenableColor.prototype.updateTargetColor = function() {
	'use strict';
	if(this._progress === 0) {
		this.target[this._property] = this.startColor;
	} else {
		// console.log("Start: ("+this._startRGB.r+","+this._startRGB.g+","+this._startRGB.b+")");
		// console.log("End  : ("+this._endRGB.r+","+this._endRGB.g+","+this._endRGB.b+")");
		// console.log("Delta: ("+this._deltaRGB.r+","+this._deltaRGB.g+","+this._deltaRGB.b+")");
		var r = clamp(this._startRGB.r + Math.round(this._deltaRGB.r * this._progress),0,255);
		var g = clamp(this._startRGB.g + Math.round(this._deltaRGB.g * this._progress),0,255);
		var b = clamp(this._startRGB.b + Math.round(this._deltaRGB.b * this._progress),0,255);
		var newColor = (r << 16) + (g << 8) + b;
		// newColor = Math.abs(newColor);
		// console.log("New color: ("+r+","+g+","+b+") "+newColor.toString(16));
		if(newColor === 0) {
			// newColor = this.startColor;
			// console.log("ZERO");
		}
		this.target[this._property] = newColor;
	}
};

PETweenableColor.prototype.updateDelta = function() {
	'use strict';
	var rd = this._endRGB.r - this._startRGB.r;
	var gd = this._endRGB.g - this._startRGB.g;
	var bd = this._endRGB.b - this._startRGB.b;
	this._deltaRGB = {r:rd, g:gd, b:bd};
};

Object.defineProperties(PETweenableColor.prototype, {
    progress: {
        get: function ()
        {
            return this._progress;
        },
        set: function (value)
        {
        	if(value < 0) value = 0;
        	if(value > 1) value = 1;
			this._progress = value;
			// console.log("Progress:"+value);
			this.updateTargetColor();
        }
    },
    startColor: {
    	get: function() 
    	{
    		return this._startColor;
    	},
    	set: function(value) {
    		this._startColor = value;
    		this._startRGB = this.toRGB(this._startColor);
    		this.updateDelta();
    	}
    },
    endColor: {
    	get: function() 
    	{
    		return this._endColor;
    	},
    	set: function(value) {
    		this._endColor = value;
    		this._endRGB = this.toRGB(this._endColor);
    		this.updateDelta();
    	}
    }
});
