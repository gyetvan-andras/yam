// Object.defineProperties(PIXI.DisplayObject.prototype, {
//      /**
//      * The rotation of the object in degrees.
//      *
//      * @member {number}
//      */
//    rotationInDeg: {
//         get:function() 
//         {
//             return this.rotation * PIXI.RAD_TO_DEG;
//         },
//         set: function(value)
//         {
//             this.rotation = value * PIXI.DEG_TO_RAD;
//         }
//     }
// });

function PointRect(bounds) {
	'use strict';
	if(bounds) {
		this.pA = new PIXI.Point(bounds.x, bounds.y);
		this.pB = new PIXI.Point(bounds.x+bounds.width, bounds.y);
		this.pC = new PIXI.Point(bounds.x+bounds.width, bounds.y+bounds.height);
		this.pD = new PIXI.Point(bounds.x, bounds.y+bounds.height);
	}
}


Object.defineProperties(PointRect.prototype, {
	minX: {
		get: function () {
			return this.pA.x;
		}
	},
	minY: {
		get: function () {
			return this.pA.y;
		}
	},
	maxX: {
		get: function () {
			return this.pC.x;
		}
	},
	maxY: {
		get: function () {
			return this.pC.y;
		}
	},
});
function clamp(val, min, max) {
	'use strict';
	if(val > max) return max;
	if(val < min) return min;
	return val;
}

PointRect.prototype.transform = function(from,to) {
	'use strict';
	var ret = new PointRect();
	ret.pA = to.toLocal(this.pA,from);
	ret.pB = to.toLocal(this.pB,from);
	ret.pC = to.toLocal(this.pC,from);
	ret.pD = to.toLocal(this.pD,from);
	return ret;
};

function rectCenter(r) {
	'use strict';
	return new PIXI.Point(r.x+r.width/2,r.y+r.height/2);
}
function midpoint(p1,p2) {
	'use strict';
	return new PIXI.Point((p1.x+p2.x)/2, (p1.y+p2.y)/2);
}

function length(p1,p2) {
	'use strict';
	var dx = p1.x - p2.x;
	var dy = p1.y - p2.y;
	return Math.round(Math.sqrt((dx*dx)+(dy*dy)));
}

function deg2rad(degrees) {
	'use strict';
	return degrees * (Math.PI / 180);
}

function makeRectFromPoints(pointsRect,lineWidth, color, alpha) {
	'use strict';
	var ret = new PIXI.Graphics();
	ret.lineStyle(lineWidth, color, alpha);
	ret.moveTo(pointsRect.pA.x,pointsRect.pA.y);
	ret.lineTo(pointsRect.pB.x,pointsRect.pB.y);
	ret.lineTo(pointsRect.pC.x,pointsRect.pC.y);
	ret.lineTo(pointsRect.pD.x,pointsRect.pD.y);
	ret.moveTo(pointsRect.pA.x,pointsRect.pA.y);
	return ret;
}

function makeRect(x,y,w,h,lineWidth, color, alpha) {
	'use strict';
	var ret = new PIXI.Graphics();
	ret.lineStyle(lineWidth, color, alpha);
	ret.moveTo(x,y);
	ret.lineTo(x+w,y);
	ret.lineTo(x+w,y+h);
	ret.lineTo(x,y+h);
	ret.lineTo(x,y);
	return ret;
}

function rectPointsFromLine(p1, p2, thickness) {
	var x0 = p1.x;
	var x1 = p2.x;
	var y0 = p1.y;
	var y1 = p2.y;

	var dx = x1 - x0;
	var dy = y1 - y0;
	var linelength = Math.sqrt(dx * dx + dy * dy);
	dx /= linelength;
	dy /= linelength;
	var px = 0.5 * thickness * dy; 
	var py = 0.5 * thickness * -dx;
	return [
		new PIXI.Point(x0 + px, y0 + py),
		new PIXI.Point(x1 + px, y1 + py),
		new PIXI.Point(x1 - px, y1 - py),
		new PIXI.Point(x0 - px, y0 - py)];
}