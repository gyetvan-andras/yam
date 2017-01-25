var TEXTFX = {
    RADIAL:1,
    LINEAR:2
};

// font-family: s.fontFamily;//'Alegreya Sans';
// font-size: s.fontSize+'px';//24px;
// font-style: s.fontStyle;//italic;
// font-weight: s.fontWight;//400;

function TextFxStyle() {
    'use strict';
    this.googleFont = false;
    this.googleFontFamily = '';
    this.googleFontVariant = '';

    this.dropShadowAngle = Math.PI / 6;
    this._fontWeight = 400;
    this._fontFamily = 'Arial';
    this._fontStyle = 'bold';
    this._fontSize = '20';


    this.gradientFill = true;

    this.gradientStyle = TEXTFX.LINEAR;
    this.gradientColors = [{stop:0,color:'#FF0080'},{stop:1,color:'#000000'}];
    this.gradientLinearLine = [{x:-45,y:-45},{x:45,y:45}];
    this.gradientRadialCircles = [{x:0,y:0,r:5},{x:0,y:0,r:50}];
   
    this.fill = true;
    this.fillColor = '#000000';
    this.align = 'center';
    this.strokeColor = '#000000'; //provide a default, see: https://github.com/GoodBoyDigital/pixi.js/issues/136
    this.strokeThickness = 0;
    this.wordWrap = false;
    this.wordWrapWidth = 100;

    this.dropShadow = false;
    this.dropShadowBlur = 8;
    this.dropShadowColor = '#000000';
    this.dropShadowAngle = Math.PI / 6;
    this.dropShadowDistance = 5;

    this.xPadding = 0;
    this.yPadding = 0;

    this.textBaseline = 'alphabetic';

    this.lineJoin = 'miter';
    this.miterLimit = 10;

    this.cutOut = false;
    this.recalculateFont();
}

Object.defineProperties(TextFxStyle.prototype, {
   dropShadowAngleInDeg: {
        get:function() 
        {
            return this.dropShadowAngle * PIXI.RAD_TO_DEG;
        },
        set: function(value)
        {
            this.dropShadowAngle = value * PIXI.DEG_TO_RAD;
        }
    },
    fontWeight: {
        get:function() 
        {
            return this._fontWeight;
        },
        set: function(value)
        {
            this._fontWeight = value;
            this.recalculateFont();
        }
    },
    fontFamily: {
        get:function() 
        {
            return this._fontFamily;
        },
        set: function(value)
        {
            this._fontFamily = value;
            this.recalculateFont();
        }
    },
    fontStyle: {
        get:function() 
        {
            return this._fontStyle;
        },
        set: function(value)
        {
            this._fontStyle = value;
            this.recalculateFont();
        }
    },
    fontSize: {
        get:function() 
        {
            return this._fontSize;
        },
        set: function(value)
        {
            this._fontSize = value;
            this.recalculateFont();
        }
    }
});

TextFxStyle.prototype.recalculateFont = function() {
    'use strict';
    this.font = this._fontWeight+' ' + this._fontStyle + ' ' + this._fontSize + 'px ' + this._fontFamily;//' 700 italic 64px '+fontName
};

function TextFx(text, style, resolution)
{
    'use strict';
    this.canvas = document.createElement('canvas');

    this.context = this.canvas.getContext('2d');

    this.resolution = resolution || PIXI.RESOLUTION;

    // this.canvas.width = this._width;
    // this.canvas.height = this._height;

    this._text = null;

    this._style = new TextFxStyle();

    var texture = PIXI.Texture.fromCanvas(this.canvas);
    texture.trim = new PIXI.Rectangle();
    PIXI.Sprite.call(this, texture);

    this._width = 100;
    this._height = 25;
    this.canvas.width = this._width;
    this.canvas.height = this._height;

    this.text = text;
    this.style = style;
}

// constructor
TextFx.prototype = Object.create(PIXI.Sprite.prototype);
TextFx.prototype.constructor = TextFx;

TextFx.fontPropertiesCache = {};
TextFx.fontPropertiesCanvas = document.createElement('canvas');
TextFx.fontPropertiesContext = TextFx.fontPropertiesCanvas.getContext('2d');

Object.defineProperties(TextFx.prototype, {
    gradientPoints: {
        get: function () {
            var ret = [];
            if(this._style.gradientFill) {
                if(this._style.gradientStyle === SHAPEFX.LINEAR) {
                    for(var lidx in this._style.gradientLinearLine) {
                        var l = this._style.gradientLinearLine[lidx];
                        ret.push({x:l.x,y:l.y});
                    }
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
    width: {
        get: function ()
        {
            if (this.dirty)
            {
                this.drawTexture();
            }

            return this._texture._frame.width;
        },
        set: function (value)
        {
            // this.scale.x = value / this._texture._frame.width;
            this._width = value;
            this.dirty = true;
        }
    },

    height: {
        get: function ()
        {
            if (this.dirty)
            {
                this.drawTexture();
            }

            return  this._texture._frame.height;
        },
        set: function (value)
        {
            // this.scale.y = value / this._texture._frame.height;
            this._height = value;
            this.dirty = true;
        }
    },

    style: {
        get: function ()
        {
            return this._style;
        },
        set: function (style)
        {
            style = style || new TextFxStyle();

            // console.log('Style:\n'+JSON.stringify(style, null, 2));

            if (typeof style.fillColor === 'number') {
                style.fillColor = PIXI.utils.hex2string(style.fillColor);
            }
            this._style.fillColor = style.fillColor;

            if (typeof style.strokeColor === 'number') {
                style.strokeColor = PIXI.utils.hex2string(style.strokeColor);
            }
            this._style.strokeColor = style.strokeColor;

            if (typeof style.dropShadowColor === 'number') {
                style.dropShadowColor = PIXI.utils.hex2string(style.dropShadowColor);
            }

            this.style.googleFont = style.googleFont || false;
            this.style.googleFontFamily = style.googleFontFamily || '';
            this.style.googleFontVariant = style.googleFontVariant || '';

            this._style._fontWeight = style._fontWeight || 400;
            this._style._fontFamily = style._fontFamily || 'Arial';
            this._style._fontStyle = style._fontStyle || 'bold';
            this._style._fontSize = style._fontSize || '20';

            this._style.font = style.font || 'bold 20pt Arial';
            this._style.fill = style.fill === undefined ? true : style.fill;
            this._style.fillColor = style.fillColor || '#000000';
            this._style.cutOut = style.cutOut === undefined ? false : style.cutOut;
            this._style.align = style.align || 'center';
            this._style.strokeColor = style.strokeColor || '#000000';
            this._style.strokeThickness = style.strokeThickness || 0;
            this._style.wordWrap = style.wordWrap || false;
            this._style.wordWrapWidth = style.wordWrapWidth || 100;

            this._style.dropShadow = style.dropShadow || false;
            this._style.dropShadowBlur = style.dropShadowBlur || 8;
            this._style.dropShadowColor = style.dropShadowColor || '#000000';

            this._style.dropShadowAngle = style.dropShadowAngle === undefined ? Math.PI / 6 : style.dropShadowAngle;
            this._style.dropShadowDistance = style.dropShadowDistance === undefined ? 5 : style.dropShadowDistance;

            this._style.xPadding = style.xPadding || 0;
            this._style.yPadding = style.yPadding || 0;

            this._style.textBaseline = style.textBaseline || 'alphabetic';

            this._style.lineJoin = style.lineJoin || 'miter';
            this._style.miterLimit = style.miterLimit || 10;

            this._style.gradientFill = style.gradientFill || false;
            this._style.gradientStyle = style.gradientStyle || SHAPEFX.LINEAR;
            this._style.gradientColors = style.gradientColors || [{stop:0,color:'#FFFFFF'},{stop:1,color:'#000000'}];
            this._style.gradientLinearLine = style.gradientLinearLine || [{x:-45,y:-45},{x:45,y:45}];
            this._style.gradientRadialCircles = style.gradientRadialCircles || [{x:0,y:0,r:5},{x:0,y:0,r:50}];
            // this._style = style;
            this.dirty = true;
        }
    },

    text: {
        get: function()
        {
            return this._text;
        },
        set: function (text){
            'use strict';
            text = text.toString() || ' ';
            if (this._text === text)
            {
                return;
            }
            this._text = text;
            this.dirty = true;
        }
    }
});

var getTextMetrics = function(style, line) {
    var css = {
        fontFamily: style.fontFamily,//'Alegreya Sans';
        fontSize: style.fontSize+'px',//24px;
        fontStyle: style.fontStyle,//italic;
        fontWeight: style.fontWeight,//400;
        display: "inline-block"
    };
    // console.log('css:'+JSON.stringify(css,null,2));
    var text = $('<div>'+line+'</div>').css(css);
    var body = $('body');
    body.append(text);
    var result = {};
    try {
        result.width = parseInt(text.css("width"),10);//text.outerWidth(true);
    } finally {
        text.remove();
    }
    return result;
};

/**

      var canvas = document.getElementById('myCanvas');
      var context = canvas.getContext('2d');
      var x = canvas.width / 2;
      var y = canvas.height / 2;

      context.font = '30pt Calibri';
      context.textAlign = 'center';
      context.fillStyle = 'blue';
      context.fillText('Hello World!', x, y);
 
*/
TextFx.prototype.drawTexture = function ()
{
    'use strict';
    this.context.save();

    var style = this._style;
    
    this.context.font = style.font;

    // var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;
    var outputText = this.wordWrap(this._text);

    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    var lineWidths = new Array(lines.length);
    var maxLineWidth = 0;
    var fontProperties = this.determineFontProperties(style.font);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var lineWidth = getTextMetrics(style,line).width;
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }


    var width = maxLineWidth + style.strokeThickness;
    if (style.dropShadow)
    {
        width += (style.dropShadowDistance + style.dropShadowBlur) * 2;
    }

    var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

    var height = lineHeight * lines.length;
    if (style.dropShadow) {
        height += (style.dropShadowDistance + style.dropShadowBlur) * 2;
    }


    var cwidth = Math.ceil(( width + this._style.xPadding * 2 ) * this.resolution);
    var cheight = Math.ceil(( height + this._style.yPadding * 2 ) * this.resolution);

    // var top = 0;
    // if(this._width < cwidth) {
    //     this._width = cwidth;
    // }

    // if(this._height < cheight) {
    //     this._height = cheight;
    // } else {
    //     top = (this._height - cheight) / 2;
    // }
    var top = 0;

    if(this._height > cheight) {
        top = (this._height - cheight) / 2;
    }

    this.canvas.width = this._width;
    this.canvas.height = this._height;

    this.context.scale( this.resolution, this.resolution);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var b = {x:0, y:0};
    var offx = 0;
    var offy = 0;


    this.context.font = style.font;
    this.context.strokeStyle = style.strokeColor;
    this.context.lineWidth = style.strokeThickness;
    this.context.textBaseline = style.textBaseline;
    this.context.lineJoin = style.lineJoin;
    this.context.miterLimit = style.miterLimit;

    var linePositionX;
    var linePositionY;


    var xShadowOffset = 0;
    var yShadowOffset = 0;
    if (style.dropShadow)
    {
        xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
    }
    var ctx = this.context;

    // if(style.cutOut) {
    //     this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // } else {
        if(style.gradientFill) {
            var grad;
            if(style.gradientStyle == SHAPEFX.LINEAR) {
                grad = this.context.createLinearGradient(
                    style.gradientLinearLine[0].x- b.x + offx, style.gradientLinearLine[0].y - b.y + offy,
                    style.gradientLinearLine[1].x- b.x + offx, style.gradientLinearLine[1].y - b.y + offy);
            } else {
                grad = this.context.createRadialGradient(
                    style.gradientRadialCircles[0].x- b.x + offx, style.gradientRadialCircles[0].y - b.y + offy, style.gradientRadialCircles[0].r,
                    style.gradientRadialCircles[1].x- b.x + offx, style.gradientRadialCircles[1].y - b.y + offy, style.gradientRadialCircles[1].r);
            }
            for(var idx in style.gradientColors) {
                grad.addColorStop(style.gradientColors[idx].stop, style.gradientColors[idx].color);
            }
            this.context.fillStyle = grad;
        } else {
            this.context.fillStyle = style.fillColor;
        }
    // }
    if(style.cutOut) {
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    //draw lines line by line
    for (i = 0; i < lines.length; i++)
    {

        var maxWidth = lineWidths[i];
        // var maxWidth = this._width - 200;
        linePositionX = (style.strokeThickness / 2);
        linePositionY = ((style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent) + top;
        if (style.align === 'right') {
            linePositionX += this._width - lineWidths[i];
            // linePositionX += maxLineWidth - lineWidths[i];
        }
        else if (style.align === 'center') {
            linePositionX += (this._width - lineWidths[i]) / 2;
            // linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }
        
        var lpx = linePositionX;
        var lpy = linePositionY;
        if (style.dropShadow) {
            if (style.align === 'right') {
                lpx -= (style.dropShadowBlur+style.dropShadowDistance);
                lpy += (style.dropShadowBlur+style.dropShadowDistance);
            }
            else if (style.align === 'center') {
                lpx -= (style.dropShadowBlur+style.dropShadowDistance)/2;
                lpy += (style.dropShadowBlur+style.dropShadowDistance);
            } else {
                lpx += (style.dropShadowBlur+style.dropShadowDistance);
                lpy += (style.dropShadowBlur+style.dropShadowDistance);
            }
        }
        
        if(style.cutOut) {
            this.context.globalCompositeOperation = 'destination-out'; 
            this.context.fillText(lines[i], lpx + this._style.xPadding, lpy + this._style.yPadding,maxWidth);
        } else {
            if(style.dropShadow) {
                ctx.shadowColor = style.dropShadowColor;
                ctx.shadowOffsetX = xShadowOffset; 
                ctx.shadowOffsetY = yShadowOffset;
                ctx.shadowBlur = style.dropShadowBlur;
                if (style.fill || style.gradientFill) {
                    this.context.fillText(lines[i], lpx + this._style.xPadding, lpy + this._style.yPadding,maxWidth);
                }
                if (style.strokeColor && style.strokeThickness) {
                    this.context.strokeText(lines[i], lpx + this._style.xPadding, lpy + this._style.yPadding,maxWidth);
                }
                ctx.shadowColor = '#00000000';
                ctx.shadowOffsetX = 0; 
                ctx.shadowOffsetY = 0; 
                ctx.shadowBlur = 0;
            } else {
                if (style.fill || style.gradientFill) {
                    this.context.fillText(lines[i], lpx + this._style.xPadding, lpy + this._style.yPadding,maxWidth);
                }
                if (style.strokeColor && style.strokeThickness) {
                    this.context.strokeText(lines[i], lpx + this._style.xPadding, lpy + this._style.yPadding,maxWidth);
                }
            }
        }
    }

    this.context.restore();
    this.updateTexture();

};

TextFx.prototype.updateTexture = function ()
{
    'use strict';
    var texture = this._texture;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;

    texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;

    // texture.trim.x = -this._style.xPadding;
    // texture.trim.y = -this._style.yPadding;

    // texture.trim.width = texture._frame.width - this._style.xPadding*2;
    // texture.trim.height = texture._frame.height - this._style.yPadding*2;
    texture.trim.x = 0;
    texture.trim.y = 0;

    texture.trim.width = texture._frame.width;
    texture.trim.height = texture._frame.height;

    this._width = this.canvas.width / this.resolution;
    this._height = this.canvas.height / this.resolution;

    texture.baseTexture.emit('update',  texture.baseTexture);

    this.dirty = false;
};

TextFx.prototype.renderWebGL = function (renderer)
{
    'use strict';
    if (this.dirty)
    {
        //this.resolution = 1//renderer.resolution;

        this.drawTexture();
    }

    PIXI.Sprite.prototype.renderWebGL.call(this, renderer);
};

TextFx.prototype._renderCanvas = function (renderer)
{
    'use strict';
    if (this.dirty)
    {
     //   this.resolution = 1//renderer.resolution;

        this.drawTexture();
    }

    PIXI.Sprite.prototype._renderCanvas.call(this, renderer);
};

TextFx.prototype.determineFontProperties = function (fontStyle) {
    'use strict';
    var properties = TextFx.fontPropertiesCache[fontStyle];

    if (!properties)
    {
        properties = {};

        var canvas = TextFx.fontPropertiesCanvas;
        var context = TextFx.fontPropertiesContext;

        context.font = fontStyle;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = fontStyle;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;

        var i, j;

        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        TextFx.fontPropertiesCache[fontStyle] = properties;
    }

    return properties;
};

TextFx.prototype.wordWrap = function (text) {
    'use strict';
    var result = '';
    var lines = text.split('\n');
    var wordWrapWidth = this._width;//this._style.wordWrapWidth;
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
            if (j === 0 || wordWidthWithSpace > spaceLeft)
            {
                // Skip printing the newline if it's the first word of the line that is
                // greater than the word wrap width.
                if (j > 0)
                {
                    result += '\n';
                }
                result += words[j];
                spaceLeft = wordWrapWidth - wordWidth;
            }
            else
            {
                spaceLeft -= wordWidthWithSpace;
                result += ' ' + words[j];
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

TextFx.prototype.getLocalBounds = function ()
{
    return this.getBounds(PIXI.Matrix.IDENTITY);
};


TextFx.prototype.getBounds = function (matrix)
{
    'use strict';
    if (this.dirty)
    {
        this.drawTexture();
    }

    return PIXI.Sprite.prototype.getBounds.call(this, matrix);
};

TextFx.prototype.destroy = function (destroyBaseTexture)
{
    'use strict';
    this.context = null;
    this.canvas = null;

    this._style = null;

    this._texture.destroy(destroyBaseTexture === undefined ? true : destroyBaseTexture);
};

TextFx.prototype.moveGradientPointTo = function(idx,ncp) {
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
    this.drawTexture();
};

