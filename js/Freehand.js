function Freehand() {
    'use strict';
    PIXI.Graphics.call(this);
    this.curvePoints = [];
    this.points = [];
    this.locked = false;
    this.w = 640;
    this.h = 480;
    this.pivot.x = this.w/2;
    this.pivot.y = this.h/2;
    this.type = OBJ_TYPE.SHAPE;
    this.tempPoint = new PIXI.Point();
}

Freehand.prototype = Object.create(PIXI.Graphics.prototype);
Freehand.prototype.constructor = Freehand;

Freehand.prototype.drawCurve = function() {
    'use strict';
    // move to the first point
    this.lineStyle(2, 0xE74C3C, 1);

    this.moveTo(this.curvePoints[0], this.curvePoints[1]);

    for (i = 2; i < this.curvePoints.length; i+=2)
    {

        this.lineTo(this.curvePoints[i], this.curvePoints[i+1]);
    }

    this.lineStyle(2, 0x16A085, 1);

    for (i = 0; i < this.points.length; i+=2)
    {
        this.drawCircle(this.points[i],this.points[i+1],5);
    }

};

Freehand.prototype.containsPoint = function( point ) {
    'use strict';
    this.worldTransform.applyInverse(point, this.tempPoint);
    var bounds = this.getLocalBounds();
    return bounds.contains(this.tempPoint.x, this.tempPoint.y);
};


Freehand.prototype.randomize = function() {
    'use strict';
    this.points = [];
    var numOfPoints = 125; //min. 2
    for(var i = 0; i < numOfPoints; i++) {
        this.points.push( 
            (this.w * Math.random() * 0.9 + this.w * 0.05)|0,
            (this.h * Math.random() * 0.9 + this.h * 0.05)|0
        );
    }
    this.curvePoints = getCurvePoints(this.points);
    this.drawCurve();
};
