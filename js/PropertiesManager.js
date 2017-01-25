var FILLMODE = {
	NONE:0,
	SOLID:1,
	GRADIENT:2,
};

// var BG_ITEM_KIND = {
// 	IMAGE:0,
// 	TRANSITION:1,
//     VIDEO:2
// };

// var TRANSITION = {
// 	FADE:0,
// };

function PropertiesManager(core) {
	'use strict';
	this.core = core;
	this._assignedObject = null;//{style:{}};
	this._name = "";
	//text properties
	this._text = "";
	this._fontSize = 14;
	this._fontName = "Arial";
    // this
	this._fillMode = FILLMODE.NONE;
	this._fillColor = 0x000000;
    // this._gradientColors = [{stop:0,color:'#FF0080'},{stop:1,color:'#000000'}];
    this._gradientStyle = SHAPEFX.LINEAR;

    this._isCutOut = false;
    this._drawOutline = true;
	this._outlineColor = 0x000000;
	this._outlineThickness = 0;
	this._dropShadow = false;
    this._dropShadowBlur = 8;
    this._dropShadowColor = '#000000';
    this._dropShadowAngle = Math.PI / 6;
    this._dropShadowDistance = 5;
    this._gradientEditing = false;
	//shape properties
	this._size = 1;
	//image
	this._tintColor = '#ffffff';
    this._paintTint = false;
	//background
	this.backgroundItems = [
		// {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg", editing:false},
		{itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
                // item.strip = msg.strip;
                // item.video_src = msg.video_src;
                // item.startTime = 20;
                // item.length = 5;
		{itemKind:BG_ITEM_KIND.VIDEO, progress:100, 
            url:"images/test-thumbnail.png", 
            strip:"images/test-strip.png",
            strip_width:'59700px',
            video_src:"images/test.mp4",
            startTime: 20,
            length:3
        },
        {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        {itemKind:BG_ITEM_KIND.VIDEO, progress:100, 
            url:"images/test-thumbnail.png", 
            strip:"images/test-strip.png",
            strip_width:'59700px',
            video_src:"images/test.mp4",
            startTime: 40,
            length:3                        
        },
        {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:3, url:"images/sample_small.jpg"},
        // {itemKind:BG_ITEM_KIND.TRANSITION, length:1, transition:TRANSITION.FADE},
        // {itemKind:BG_ITEM_KIND.IMAGE, length:6, url:"images/car.svg"},
	];	
    this._presetMode = "original";
}

Object.defineProperties(PropertiesManager.prototype, {
	name: {
        get:function() 
        {
            'use strict';
            return this._name;
        },
        set: function(value)
        {
            'use strict';
            this._name = value;
            if(this._assignedObject) {
                this._assignedObject.node_name = value; 
                this.core.displayObjectRenamed(this._assignedObject);
            }
        }
    },
	text: {
        get:function() 
        {
            'use strict';
            return this._text;
        },
        set: function(value)
        {
            'use strict';
            this._text = value;
            if(this._assignedObject) this._assignedObject.text = value; 
            this.refreshDisplay();
        }
    },
	fontSize: {
        get:function() 
        {
            'use strict';
            return this._fontSize;
        },
        set: function(value)
        {
            'use strict';
            this._fontSize = value;
            if(this._assignedObject) this._assignedObject.style.fontSize = value;
            this.refreshStyle();
        }
    },
	fontName: {
        get:function() 
        {
            'use strict';
            return this._fontName;
        },
        set: function(value)
        {
            'use strict';
            this._fontName = value;
        }
    },
	isCutOut: {
        get:function() 
        {
            'use strict';
            return this._isCutOut;
        },
        set: function(value)
        {
            'use strict';
            this._isCutOut = value;
            if(this._isCutOut && this._fillMode === FILLMODE.NONE) value = false;
            if(this._assignedObject) this._assignedObject.style.cutOut = value;
            this.refreshStyle();
        }
    },
	fillMode: {
        get:function() 
        {
            'use strict';
            return this._fillMode;
        },
        set: function(value)
        {
            'use strict';
            this._fillMode = parseInt(value);
            switch(this._fillMode) {
            case FILLMODE.SOLID:
            	if(this._assignedObject) this._assignedObject.style.fill = true;
            	if(this._assignedObject) this._assignedObject.style.gradientFill = false;
            	break;	
            case FILLMODE.GRADIENT:
            	if(this._assignedObject) this._assignedObject.style.fill = true;
            	if(this._assignedObject) this._assignedObject.style.gradientFill = true;
            	break;	
            case FILLMODE.NONE:
            	if(this._assignedObject) this._assignedObject.style.fill = false;
            	if(this._assignedObject) this._assignedObject.style.gradientFill = false;
            	this.isCutOut = false;
            	break;	
            }
            this.refreshStyle();
        }
    },
	fillColor: {
        get:function() 
        {
            'use strict';
            return this._fillColor;
        },
        set: function(value)
        {
            'use strict';
            this._fillColor = value;
            if(this._assignedObject) {
	            this._assignedObject.style.fillColor = value;
	            this.refreshStyle();
        	}
        }
    },
	drawOutline: {
        get:function() 
        {
            'use strict';
            return this._drawOutline;
        },
        set: function(value)
        {
            'use strict';
            this._drawOutline = value;
            this.refreshStyle();
        }
    },
	outlineColor: {
        get:function() 
        {
            'use strict';
            return this._outlineColor;
        },
        set: function(value)
        {
            'use strict';
            this._outlineColor = value;
            if(this._assignedObject) {
	            this._assignedObject.style.strokeColor = value;
	            this.refreshStyle();
	        }
        }
    },
	outlineThickness: {
        get:function() 
        {
            'use strict';
            return this._outlineThickness;
        },
        set: function(value)
        {
            'use strict';
            this._outlineThickness = value;
            if(this._assignedObject) this._assignedObject.style.strokeThickness = value;
            this.refreshStyle();
        }
    },
	dropShadow: {
        get:function() 
        {
            'use strict';
            return this._dropShadow;
        },
        set: function(value)
        {
            'use strict';
            this._dropShadow = value;
            if(this._assignedObject) this._assignedObject.style.dropShadow = value;
            this.refreshStyle();
        }
    },
	dropShadowBlur: {
        get:function() 
        {
            'use strict';
            return this._dropShadowBlur;
        },
        set: function(value)
        {
            'use strict';
            this._dropShadowBlur = value;
            if(this._assignedObject) this._assignedObject.style.dropShadowBlur = value;
            this.refreshStyle();
        }
    },
	dropShadowColor: {
        get:function() 
        {
            'use strict';
            return this._dropShadowColor;
        },
        set: function(value)
        {
            'use strict';
            this._dropShadowColor = value;
            if(this._assignedObject) {
	            this._assignedObject.style.dropShadowColor = value;
	            this.refreshStyle();
	        }
        }
    },
	dropShadowAngle: {
        get:function() 
        {
            'use strict';
            return this._dropShadowAngle;
        },
        set: function(value)
        {
            'use strict';
            this._dropShadowAngle = value;
            if(this._assignedObject) this._assignedObject.style.dropShadowAngleInDeg = value;
            this.refreshStyle();
        }
    },
	dropShadowDistance: {
        get:function() 
        {
            'use strict';
            return this._dropShadowDistance;
        },
        set: function(value)
        {
            'use strict';
            this._dropShadowDistance = value;
            if(this._assignedObject) this._assignedObject.style.dropShadowDistance = value;
            this.refreshStyle();
        }
    },
    gradientEditing: {
        get:function() 
        {
            'use strict';
            return this._gradientEditing;
        },
        set: function(value)
        {
            'use strict';
            this._gradientEditing = value;
            this.core.selectionHandler.setGradientMode(value);
        }
    },
    gradientStyle: {
        get:function() 
        {
            'use strict';
            return this._gradientStyle;
        },
        set: function(value)
        {
            'use strict';
            this._gradientStyle = value;
            if(this._assignedObject) this._assignedObject.style.gradientStyle = value;
            this.refreshStyle();
        }
    },
	size: {
        get:function() 
        {
            'use strict';
            return this._size;
        },
        set: function(value)
        {
            'use strict';
            this._size = value;
        }
    },
    assignedObject: {
        get:function() 
        {
            'use strict';
            return this._assignedObject;
        },
        set: function(value)
        {
            'use strict';
            this.gradientEditing = false;
            this._assignedObject = value;
            this.loadFromObject();
        }
    },
    presetMode: {
        get:function() 
        {
            'use strict';
            return this._presetMode;
        },
        set: function(value)
        {
            'use strict';
            this._presetMode = value;
            if(this._assignedObject) {
                this._assignedObject.presetMode = value;
            }
        }
    },
    tintColor: {
        get:function() 
        {
            'use strict';
            return this._tintColor;
        },
        set: function(value)
        {
            'use strict';
            this._tintColor = value;
            if(this._assignedObject) {
                this._paintTint = value !== '#ffffff';
                this._assignedObject.tint =  parseInt('0x' + value.substring(1, 7));
                this.refreshDisplay();
            }
        }
    },
    paintTint: {
        get:function() 
        {
            'use strict';
            return this._paintTint;
        },
        set: function(value)
        {
            'use strict';
            this._paintTint = value;
            if(this._assignedObject) {
                if(value) {
                    this._assignedObject.tint = parseInt('0x' + this._tintColor.substring(1, 7));
                } else {
                    this._assignedObject.tint = 0xffffff;
                }
            }
            this.refreshDisplay();
        }
    },

});

PropertiesManager.prototype.align = function(algn) {
    'use strict';
    var self = this;
    if(self._assignedObject) {
        self._assignedObject.style.align = algn;
        self.refreshStyle();
    }

};

PropertiesManager.prototype.setGradientEditingTo = function(editing) {
    'use strict';
    var self = this;
    self.gradientEditing = editing;
    self.core.selectionHandler.setGradientMode(editing);
};

PropertiesManager.prototype.refreshDisplay = function() {
    'use strict';
	this.core.manualRefresh();
	this.core.selectionHandler.assignTo(this._assignedObject);
	this.core.manualRefresh();
};

PropertiesManager.prototype.refreshStyle = function() {
    'use strict';
	if(this.drawOutline) {
		if(this.outlineThickness < 1) this.outlineThickness = 1;
		if(this._assignedObject) this._assignedObject.style.strokeThickness = this.outlineThickness;	
	} else {
		if(this._assignedObject) this._assignedObject.style.strokeThickness = 0;
	}
	if(this._assignedObject) this._assignedObject.style = this._assignedObject.style;
	this.refreshDisplay();
};

PropertiesManager.prototype.prepareGradientPicker = function(picker) {
    'use strict';
    var o = this._assignedObject; 
    var colorStops = [];
    for(var idx  = 0; idx < o.style.gradientColors.length;idx++) {
        var colorStop = o.style.gradientColors[idx];
        var colorStopStr = colorStop.color + ' ' + (colorStop.stop * 100) + '%';
        colorStops.push(colorStopStr);
    }
    $(picker).gradientPicker("update_colors",{
        controlPoints: colorStops
    });
};

PropertiesManager.prototype.prepareTxtGradientPicker = function() {
    'use strict';
    this.prepareGradientPicker('#gp_txt_gradient');
};

PropertiesManager.prototype.prepareShpGradientPicker = function() {
    'use strict';
    this.prepareGradientPicker('#gp_shp_gradient');
};

PropertiesManager.prototype.reloadShapePickers = function() {
    'use strict';
    $("#cp_shp_color_fill_solid").setColor(this._fillColor);
    $("#cp_shp_color_outline").setColor(this._outlineColor);
    $("#cp_shp_color_shadow").setColor(this._dropShadowColor);
};

PropertiesManager.prototype.reloadTextPickers = function() {
    'use strict';
    $("#cp_txt_color_fill_solid").setColor(this._fillColor);
    $("#cp_txt_color_outline").setColor(this._outlineColor);
    $("#cp_txt_color_shadow").setColor(this._dropShadowColor);
};
   
PropertiesManager.prototype.loadFromObject = function() {
	'use strict';
	var o = this._assignedObject; 
	if(!o) return;
	switch(o.type) {
	case OBJ_TYPE.BACKGROUND:
		break;
	case OBJ_TYPE.SHAPE:
        this._name = o.node_name;
        this._fillColor = o.style.fillColor;
        this._drawOutline = o.style.strokeThickness > 0;
        this._outlineThickness = o.style.strokeThickness;
        this._outlineColor = o.style.strokeColor;
        if(o.style.fill) {
            if(o.style.gradientFill) {
                this._fillMode = FILLMODE.GRADIENT;
                this.prepareShpGradientPicker();
            } else {
                this._fillMode = FILLMODE.SOLID;
            }
        } else {
            this._fillMode = FILLMODE.NONE;
        }
        this._gradientStyle = o.style.gradientStyle;
        this._dropShadow = o.style.dropShadow;
        this._dropShadowColor = o.style.dropShadowColor;
        this._dropShadowBlur = o.style.dropShadowBlur;
        this._dropShadowAngle = o.style.dropShadowAngleInDeg;
        this._dropShadowDistance = o.style.dropShadowDistance;
        this.reloadShapePickers();
		break;
	case OBJ_TYPE.TEXT:
		this._name = o.node_name;
		this._text = o.text;
		this._fontSize = o.style.fontSize;
		this._fillColor = o.style.fillColor;
		this._drawOutline = o.style.strokeThickness > 0;
		this._outlineThickness = o.style.strokeThickness;
		this._outlineColor = o.style.strokeColor;
		this._isCutOut = o.style.cutOut;
		if(o.style.fill) {
			if(o.style.gradientFill) {
				this._fillMode = FILLMODE.GRADIENT;
                this.prepareTxtGradientPicker();
			} else {
				this._fillMode = FILLMODE.SOLID;
			}
		} else {
			this._fillMode = FILLMODE.NONE;
		}
        this._gradientStyle = o.style.gradientStyle;
		this._dropShadow = o.style.dropShadow;
		this._dropShadowColor = o.style.dropShadowColor;
		this._dropShadowBlur = o.style.dropShadowBlur;
		this._dropShadowAngle = o.style.dropShadowAngleInDeg;
		this._dropShadowDistance = o.style.dropShadowDistance;
        this.reloadTextPickers();
		break;
	case OBJ_TYPE.SPRITE:
        if(!o.presetMode) o.presetMode = 'original';
        this._presetMode = o.presetMode;
        this._name = o.node_name;
        var hex = '0000000'+o.tint.toString(16);
        hex = hex.substr(hex.length - 6,6); 
        // console.log("HEX of "+o.tint+": "+hex);
        this._tintColor = '#' + hex;
        this._paintTint = o.tint !== 0xffffff;
        $("#cp_img_color_tint").setColor(this._tintColor);
		break;
	}
};

PropertiesManager.prototype.removeBackgroundItem = function(index) {
    'use strict';
    var self = this;
    if(self.backgroundItems.length > index) {
        var bgi = self.backgroundItems[index];
        self.backgroundItems.splice(index, 1);
        self.calculateBgiTimes();
        self.core.removeBackgroundItem(bgi);
    }
};

PropertiesManager.prototype.moveBackgroundItemUp = function(index) {
    'use strict';
    if(index > 0) {
        var bgis = Array.from(this.backgroundItems);
        var x = bgis[index-1];
        bgis[index-1] = bgis[index];
        bgis[index] = x;
        this.backgroundItems.splice(0,this.backgroundItems.length);
        for(var i = 0;i < bgis.length;i++) {
            this.backgroundItems.push(bgis[i]);
        }
        this.calculateBgiTimes();
    }
};

PropertiesManager.prototype.moveBackgroundItemDown = function(index) {
    'use strict';
    if(this.backgroundItems.length > 1 && index < this.backgroundItems.length-1) {
        var bgis = Array.from(this.backgroundItems);
        var x = bgis[index];
        bgis[index] = bgis[index+1];
        bgis[index+1] = x;
        this.backgroundItems.splice(0,this.backgroundItems.length);
        for(var i = 0;i < bgis.length;i++) {
            this.backgroundItems.push(bgis[i]);
        }
        this.calculateBgiTimes();
    }
};

PropertiesManager.prototype.upgradeProgress = function(url,msg) {
    'use strict';
    for(var i = 0; i < this.backgroundItems.length;i++) {
        var item = this.backgroundItems[i];
        if(item.itemKind === BG_ITEM_KIND.VIDEO && item.url === url) {
            item.progress = msg.progress;            
            if(msg.progress == 100) {
                item.strip = msg.strip;
                item.video_src = msg.video_src;
                item.startTime = 0;
                item.length = 5;
                item.strip_width = msg.strip_width+'px';
            }
        }
    }
};

PropertiesManager.prototype.calculateBgiTimes = function() {
    'use strict';
    var self = this;
    var ct = 0;
    for (var i = 0; i < self.backgroundItems.length; i++) {
        var bgi = self.backgroundItems[i];
        bgi.startsAt = ct;
        bgi.endsAt = ct + bgi.length;
        ct += bgi.length;
    }
};

PropertiesManager.prototype.addSeparator = function(url, itemkind) {
    'use strict';
    var transition = {
        itemKind:BG_ITEM_KIND.TRANSITION, 
        length: 1, 
        transition:TRANSITION.FADE,
        editing: false
    };
    this.backgroundItems.push(transition);
};

PropertiesManager.prototype.addBackgroundItem = function(url, itemkind) {
    'use strict';
    if(this.backgroundItems.length > 0) {
        var transition = {
            itemKind:BG_ITEM_KIND.TRANSITION, 
            length: 1, 
            transition:TRANSITION.FADE,
            editing: false
        };
        this.backgroundItems.push(transition);
    }
    var item = {
        itemKind:itemkind,//BG_ITEM_KIND.IMAGE, 
        length:3, 
        url:url,
        progress:0,
        editing: false
    };
    this.backgroundItems.push(item);
    this.calculateBgiTimes();
};