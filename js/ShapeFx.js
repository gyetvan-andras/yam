var SHAPEFX = {
    LINE:1,
    TRIANGLE:2,
    RECT:3,
    CIRCLE:4,
    // ARC:5,
    SEGMENTS:6,
    //-------------
    RADIAL:1,
    LINEAR:2
};

function ShapeFxStyle() {
    'use strict';
    this.gradientFill = false;

    this.gradientStyle = SHAPEFX.LINEAR;
    this.gradientColors = [{stop:0,color:'#FF0080'},{stop:1,color:'#000000'}];
    this.gradientLinearLine = [{x:-45,y:-45},{x:45,y:45}];
    this.gradientRadialCircles = [{x:0,y:0,r:5},{x:0,y:0,r:50}];

    this.fill = true;
    this.fillColor = '#ffffff';
    this.strokeColor = '#000000';
    this.strokeThickness = 1;

    this.dropShadow = true;
    this.dropShadowBlur = 8;
    this.dropShadowColor = '#000000';
    this.dropShadowAngle = Math.PI / 6;
    this.dropShadowDistance = 15;
}

Object.defineProperties(ShapeFxStyle.prototype, {
   dropShadowAngleInDeg: {
        get:function() 
        {
            return this.dropShadowAngle * PIXI.RAD_TO_DEG;
        },
        set: function(value)
        {
            this.dropShadowAngle = value * PIXI.DEG_TO_RAD;
        }
    }
});

function ShapeFx(w,h)
{
    'use strict';
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.resolution = PIXI.RESOLUTION;
    var texture = PIXI.Texture.fromCanvas(this.canvas);
    texture.trim = new PIXI.Rectangle();
    PIXI.Sprite.call(this, texture);
    this.locked = false;
    this._style = new ShapeFxStyle();
    this._width = w || 100;
    this._height = h || 100;
    this.dirty = true;
    // this.kind = SHAPEFX.TRIANGLE;
    this.kind = SHAPEFX.RECT;
    // this.kind = SHAPEFX.LINE;
    // this._kind = SHAPEFX.CIRCLE;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.controlPoints = [];
    this.initPoints();
    this._transparent = false;
}

// constructor
ShapeFx.prototype = Object.create(PIXI.Sprite.prototype);
ShapeFx.prototype.constructor = ShapeFx;

ShapeFx.prototype.moveGradientPointTo = function(idx,ncp) {
    if(this._style.gradientStyle == SHAPEFX.LINEAR) {
        this._style.gradientLinearLine[idx].x = ncp.x;
        this._style.gradientLinearLine[idx].y = ncp.y;
    } else {
        var r;
        switch(idx) {
            case 0://center 1
                this._style.gradientRadialCircles[0].x = ncp.x;
                this._style.gradientRadialCircles[0].y = ncp.y;
                break;
            case 1://r 1
                r = ncp.x - this._style.gradientRadialCircles[0].x;
                if(r < 1) r = 1;
                this._style.gradientRadialCircles[0].r = r;
                break;
            case 2://center 2
                this._style.gradientRadialCircles[1].x = ncp.x;
                this._style.gradientRadialCircles[1].y = ncp.y;
                break;
            case 3://r 2
                r = ncp.x - this._style.gradientRadialCircles[1].x;
                if(r < 1) r = 1;
                this._style.gradientRadialCircles[1].r = r;
                break;
        }
    }
    this.updateShape();
};

Object.defineProperties(ShapeFx.prototype, {
    gradientPoints: {
        get: function () {
            var ret = [];
            if(this._style.gradientFill) {
                if(this._style.gradientStyle === SHAPEFX.LINEAR) {
                    for(var lidx in this._style.gradientLinearLine) {
                        var l = this._style.gradientLinearLine[lidx];
                        ret.push({x:l.x,y:l.y});
                    }
                    // return ret;//this._style.gradientLinearLine;
                } else {
                    for(var cidx in this._style.gradientRadialCircles) {
                        var c = this._style.gradientRadialCircles[cidx];
                        ret.push({x:c.x,y:c.y});
                        ret.push({x:c.x+c.r,y:c.y});
                    }
                }
            }
            return ret;
        }
    },
    kind: {
        get: function ()
        {
            return this._kind;
        },
        set: function (value) {
            this._kind = value;
            this.initPoints();
        }        
    },
    points: {
        get: function ()
        {
            return this._points;
        },
        set: function (value) {
            this._points = value;
            this.updateShape();
        }        
    },
    width: {
        get: function ()
        {
            return this._width;
        },
        set: function (value)
        {
            var style = this._style;
            if (style.dropShadow) {
                value -= (style.dropShadowDistance + style.dropShadowBlur) * 2;
                this._height -= (style.dropShadowDistance + style.dropShadowBlur) * 2;
            }
            // this.resizeGradientPointsW(this._width, value);
            this._width = value;
            this.dirty = true;
        }
    },

    height: {
        get: function ()
        {
            return  this._height;
        },
        set: function (value)
        {
            var style = this._style;
            if (style.dropShadow) {
                value -= (style.dropShadowDistance + style.dropShadowBlur) * 2;
                this._width -= (style.dropShadowDistance + style.dropShadowBlur) * 2;
            }
            // this.resizeGradientPointsH(this._height, value);
            this._height = value;
            this.dirty = true;
        }
    },

    transparent: {
        get: function ()
        {
            return this._transparent;
        },
        set: function(value) 
        {
            this._transparent = value;
            if(this._transparent) {
                this._style.fill = false;
                this._style.dropShadow = false;
            } else {
                this._style.fill = true;
                this._style.dropShadow = true;
            }
            this.updateShape();
        }
    },
    bgColor: {
        get: function ()
        {
            return this._style.fillColor;
        },
        set: function(value) 
        {
            this._style.fillColor = value;  
            if (typeof this._style.fillColor === 'number') {
                this._style.fillColor = PIXI.utils.hex2string(style.fillColor);
            }
            this.updateShape();
        }
    },

    style: {
        get: function ()
        {
            return this._style;
        },
        set: function (style)
        {
            style = style || new ShapeFxStyle();

            if (typeof style.fillColor === 'number') {
                style.fillColor = PIXI.utils.hex2string(style.fillColor);
            }
            this._style.fillColor = style.fillColor;

            if (typeof style.strokeColor === 'number') {
                style.strokeColor = PIXI.utils.hex2string(style.strokeColor);
            }
            this._style.strokeColor = style.strokeColor;

            this._style.fill = style.fill === undefined ? true : style.fill;
            this._style.fillColor = style.fillColor || '#000000';
            this._style.strokeColor = style.strokeColor || '#000000';
            this._style.strokeThickness = style.strokeThickness || 0;

            this._style.dropShadow = style.dropShadow || false;
            this._style.dropShadowBlur = style.dropShadowBlur || 8;
            this._style.dropShadowColor = style.dropShadowColor || '#000000';

            this._style.dropShadowAngle = style.dropShadowAngle === undefined ? Math.PI / 6 : style.dropShadowAngle;
            this._style.dropShadowDistance = style.dropShadowDistance === undefined ? 5 : style.dropShadowDistance;

            this._style.gradientFill = style.gradientFill || false;
            this._style.gradientStyle = style.gradientStyle || SHAPEFX.LINEAR;
            this._style.gradientColors = style.gradientColors || [{stop:0,color:'#FFFFFF'},{stop:1,color:'#000000'}];
            this._style.gradientLinearLine = style.gradientLinearLine || [{x:-45,y:-45},{x:45,y:45}];
            this._style.gradientRadialCircles = style.gradientRadialCircles || [{x:0,y:0,r:5},{x:0,y:0,r:50}];
            this.updateShape();
        }
    },

});


ShapeFx.prototype.initPoints = function () {
    'use strict';
    this._points = [];
    var w2 = this._width/2;
    var h2 = this._height/2;
    switch(this.kind) {
    case SHAPEFX.LINE:
        this._points.push({x:-w2,y:-h2});
        this._points.push({x:w2,y:h2});
        break;
    case SHAPEFX.TRIANGLE:
        this._points.push({x:0,y:-h2});
        this._points.push({x:w2,y:h2});
        this._points.push({x:-w2,y:h2});
        break;
    case SHAPEFX.RECT:
        this._points.push({x:-w2,y:-h2});
        this._points.push({x:w2,y:-h2});
        this._points.push({x:w2,y:h2});
        this._points.push({x:-w2,y:h2});
        break;
    case SHAPEFX.CIRCLE:
        // this._points.push({x:0,y:0});
        this._points.push({x:w2,y:h2});
        break;
    case SHAPEFX.SEGMENTS:
        this._points.push({x:-w2,y:-h2});
        this._points.push({x:w2,y:0});
        this._points.push({x:w250,y:h2});
        this._points.push({x:-w2,y:h2});
        break;
    }
};

ShapeFx.prototype.calcControlBounds = function() {
    'use strict';

    var w = this._width;
    var h = this._height;
    var minx = 0;
    var miny = 0;
    var maxx = 0;
    var maxy = 0;
    var ptcnt = 0;
    switch(this.kind) {
    case SHAPEFX.LINE:
        ptcnt = 2;
        break;
    case SHAPEFX.TRIANGLE:
        ptcnt = 3;
        break;
    case SHAPEFX.RECT:
        ptcnt = 4;
        break;
    case SHAPEFX.CIRCLE:
        ptcnt = 1;
        break;
    case SHAPEFX.SEGMENTS:
        ptcnt = 4;
        break;
    }
    for(var i = 0; i < ptcnt;i++) {
        if(this._points[i].x < minx) minx = this._points[i].x;
        if(this._points[i].y < miny) miny = this._points[i].y;
        if(this._points[i].x > maxx) maxx = this._points[i].x;
        if(this._points[i].y > maxy) maxy = this._points[i].y;
    }
    if(this.kind === SHAPEFX.CIRCLE) {
        maxy = maxx;
    }
    minx = Math.abs(minx);
    maxx = Math.abs(maxx);
    miny = Math.abs(miny);
    maxy = Math.abs(maxy);
    w = Math.max(minx,maxx) * 2;
    h = Math.max(miny,maxy) * 2;

    // if(this.style.dropShadow) {
    //     w += (this.style.dropShadowDistance + this.style.dropShadowBlur) * 2;
    //     h += (this.style.dropShadowDistance + this.style.dropShadowBlur) * 2;
    // }
    // if(this.style.strokeThickness > 0) {
    //     w += this.style.strokeThickness;
    //     h += this.style.strokeThickness;
    // }
    // this._width = w;
    // this._height = h;
    return {w:w, h:h};
};

ShapeFx.prototype.calcBounds = function() {
    'use strict';
    var cb = this.calcControlBounds();

    var w = cb.w;
    var h = cb.h;

    if(this.style.dropShadow) {
        w += (this.style.dropShadowDistance + this.style.dropShadowBlur) * 2;
        h += (this.style.dropShadowDistance + this.style.dropShadowBlur) * 2;
    }
    if(this.style.strokeThickness > 0) {
        w += this.style.strokeThickness;
        h += this.style.strokeThickness;
    }
    this._width = w;
    this._height = h;
    return {x:-w/2, y:-h/2, w:w, h:h};
};

ShapeFx.prototype.makeStageRect = function(w,h) {
    this._points = [];
    this._points.push({x:0,y:0});
    this._points.push({x:w,y:0});
    this._points.push({x:w,y:h});
    this._points.push({x:0,y:h});
    this.updateShape();
};

ShapeFx.prototype.setDimension = function(w,h) {
    var pcb = this.calcControlBounds();
    this._points[1].x = w;
    this._points[2].x = w;
    this._points[2].y = h;
    this._points[3].y = h;
    var ncb = this.calcControlBounds();
    this.resizeGradientPoints(pcb.w, ncb.w, pcb.h, ncb.h);
    this.updateShape();
};

ShapeFx.prototype.resizeGradientPoints = function(oldW, newW, oldH, newH) {
    'use strict';
    var self = this;
    var style = self._style;
    if(style.gradientFill) {
        if(style.gradientStyle == SHAPEFX.LINEAR) {
            console.log("W:"+oldW+"-"+newW+" h:"+oldH+"-"+newH);
            var cw = newW / oldW;
            var ch = newH / oldH;
            var dx = style.gradientLinearLine[1].x - style.gradientLinearLine[0].x;
            var dy = style.gradientLinearLine[1].x - style.gradientLinearLine[0].y;
            var ndx = dx * cw;
            var ndy = dy * ch;
            console.dir(style.gradientLinearLine);
            style.gradientLinearLine[1].x = style.gradientLinearLine[0].x + ndx;
            style.gradientLinearLine[1].x = style.gradientLinearLine[0].y + ndy;
            console.dir(style.gradientLinearLine);
        } else {

        }
    }
};

ShapeFx.prototype.moveControlPointTo = function(idx,ncp) {
    'use strict';
    var style = this._style;
    var pcb = this.calcControlBounds();
    var pt = {};
    pt.x = ncp.x;
    pt.y = ncp.y;
    this._points[idx] = pt;

    switch(this.kind) {
        case SHAPEFX.RECT:
            switch(idx) {
                case 0:
                    this._points[1].y = pt.y;
                    this._points[3].x = pt.x;
                    break;
                case 1:
                    this._points[0].y = pt.y;
                    this._points[2].x = pt.x;
                    break;
                case 2:
                    this._points[1].x = pt.x;
                    this._points[3].y = pt.y;
                    break;
                case 3:
                    this._points[0].x = pt.x;
                    this._points[2].y = pt.y;
                    break;
            }
            break;
        case SHAPEFX.TRIANGLE:
            break;
        case SHAPEFX.LINE:
            break;
        case SHAPEFX.SEGMENTS:
            break;

    }

    var ncb = this.calcControlBounds();
    this.resizeGradientPoints(pcb.w, ncb.w, pcb.h, ncb.h);

    // this.dirty = true;
    this.updateShape();
};

ShapeFx.prototype.containsPoint = function(gpt) {
    'use strict';
    var lpt = this.toLocal(gpt);
    // console.log("SFX.LPT:"+lpt.x+","+lpt.y);
    var ret = this.shapePoly.contains(lpt.x, lpt.y);
    return ret;
};

ShapeFx.prototype.updateShape = function ()
{
    'use strict';
    var style = this._style;

    var b = this.calcBounds();
    var width = b.w;
    var height = b.h;

    // this.resizeGradientPoints(this._width, width, this._height, height);

    this.canvas.width = width * this.resolution;
    this.canvas.height = height * this.resolution;

    this.context.scale( this.resolution, this.resolution);

    this.context.strokeStyle = style.strokeColor;
    this.context.lineWidth = style.strokeThickness;

    if(style.gradientFill) {
        var grad;
        if(style.gradientStyle == SHAPEFX.LINEAR) {
            grad = this.context.createLinearGradient(
                style.gradientLinearLine[0].x- b.x, style.gradientLinearLine[0].y - b.y,
                style.gradientLinearLine[1].x- b.x, style.gradientLinearLine[1].y - b.y);
        } else {
            grad = this.context.createRadialGradient(
                style.gradientRadialCircles[0].x- b.x, style.gradientRadialCircles[0].y - b.y, style.gradientRadialCircles[0].r,
                style.gradientRadialCircles[1].x- b.x, style.gradientRadialCircles[1].y - b.y, style.gradientRadialCircles[1].r);
        }
        for(var idx in style.gradientColors) {
            grad.addColorStop(style.gradientColors[idx].stop, style.gradientColors[idx].color);
        }
        this.context.fillStyle = grad;
    } else {
        this.context.fillStyle = style.fillColor;
    }

    if (style.dropShadow)
    {
        var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
        this.context.shadowColor = style.dropShadowColor;
        this.context.shadowOffsetX = xShadowOffset; 
        this.context.shadowOffsetY = yShadowOffset; 
        this.context.shadowBlur = style.dropShadowBlur;
    }

    var wps = [];
    this.controlPoints = [];
    var polyPoints = [];
    if(this.kind === SHAPEFX.CIRCLE) {
        var c_pt = {};
        var c_cp = {};
        var c_opt = {}; //origo
        c_opt.x = 0 - b.x;
        c_opt.y = 0 - b.y;
        wps.push(c_opt);

        // c_pt.x = this._points[0].x - b.x + ;
        // c_pt.y = 0 - b.y;
        c_cp = {x:this._points[0].x,y:0};
        this.controlPoints.push(c_cp);

    } else {
        // for(var pidx in this._points) {
        var pidx = 0;
        for(pidx = 0; pidx < this._points.length; pidx++) {
            var pt = {};
            var cp = {};
            pt.x = this._points[pidx].x - b.x;
            pt.y = this._points[pidx].y - b.y;
            wps.push(pt);

            cp = {x:this._points[pidx].x,y:this._points[pidx].y};
            this.controlPoints.push(cp);
            polyPoints.push(new PIXI.Point(cp.x, cp.y));
        }
    }

    switch(this.kind) {
        case SHAPEFX.RECT:
            var x = wps[0].x;
            var y = wps[0].y;
            var w = wps[2].x - x;
            var h = wps[2].y - y;
            if(style.fill) {
                this.context.fillRect(x,y,w,h);
                this.context.shadowOffsetX = 0; 
                this.context.shadowOffsetY = 0; 
                this.context.shadowBlur = 0;
                this.context.shadowColor = '#00000000';
            }
            if(style.strokeThickness) this.context.strokeRect(x,y,w,h);
            this.shapePoly = new PIXI.Polygon(polyPoints);
            break;
        case SHAPEFX.TRIANGLE:
            var sp = wps[0];
            this.context.beginPath();
            this.context.moveTo(sp.x,sp.y);
            for(var wpsidx = 1; wpsidx < 3;wpsidx++) {
                this.context.lineTo(wps[wpsidx].x,wps[wpsidx].y);    
            }
            // this.context.lineTo(sp.x,sp.y);
            this.context.closePath();
            if(style.fill) {
                this.context.fill();
                this.context.shadowOffsetX = 0; 
                this.context.shadowOffsetY = 0; 
                this.context.shadowBlur = 0;
                this.context.shadowColor = '#00000000';
            }
            if(style.strokeThickness) this.context.stroke();
            this.shapePoly = new PIXI.Polygon(polyPoints);
            break;
        case SHAPEFX.LINE:
            this.context.beginPath();
            this.context.moveTo(wps[0].x,wps[0].y);
            this.context.lineTo(wps[1].x,wps[1].y);
            if(style.strokeThickness) this.context.stroke();
            var thickness = Math.max(style.strokeThickness+2,10);
            var lineRect = rectPointsFromLine(this.controlPoints[0], this.controlPoints[1], thickness);
            this.shapePoly = new PIXI.Polygon(lineRect);
            break;
        case SHAPEFX.SEGMENTS:
            break;
        case SHAPEFX.CIRCLE:
            this.context.beginPath();
            this.context.arc(wps[0].x,wps[0].y,this._points[0].x,0,Math.PI*2,true);
            if(style.fill) {
                this.context.fill();
                this.context.shadowOffsetX = 0; 
                this.context.shadowOffsetY = 0; 
                this.context.shadowBlur = 0;
                this.context.shadowColor = '#00000000';
            }
            if(style.strokeThickness) this.context.stroke();
            // this.shapePoly = new PIXI.Circle(-b.w/2,-b.h/2,this._points[0].x);
            this.shapePoly = new PIXI.Circle(0,0,this._points[0].x);
            break;

    }

    this.updateTexture();
};

ShapeFx.prototype.updateTexture = function ()
{
    'use strict';
    var texture = this._texture;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;
    texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;

    texture.trim.x = 0;//-this._style.xPadding;
    texture.trim.y = 0;//-this._style.yPadding;

    texture.trim.width = texture._frame.width;// - this._style.xPadding*2;
    texture.trim.height = texture._frame.height;// - this._style.yPadding*2;

    this._width = this.canvas.width / this.resolution;
    this._height = this.canvas.height / this.resolution;

    texture.baseTexture.emit('update',  texture.baseTexture);

    this.dirty = false;
};

ShapeFx.prototype.renderWebGL = function (renderer)
{
    'use strict';
    if (this.dirty)
    {
        this.updateShape();
    }

    PIXI.Sprite.prototype.renderWebGL.call(this, renderer);
};

ShapeFx.prototype._renderCanvas = function (renderer)
{
    'use strict';
    if (this.dirty)
    {
        this.updateShape();
    }

    PIXI.Sprite.prototype._renderCanvas.call(this, renderer);
};

ShapeFx.prototype.getBounds = function (matrix)
{
    'use strict';
    if (this.dirty)
    {
        this.updateShape();
    }

    return PIXI.Sprite.prototype.getBounds.call(this, matrix);
};

ShapeFx.prototype.destroy = function (destroyBaseTexture)
{
    'use strict';
    // make sure to reset the the context and canvas.. dont want this hanging around in memory!
    this.context = null;
    this.canvas = null;

    this._style = null;

    this._texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
};
