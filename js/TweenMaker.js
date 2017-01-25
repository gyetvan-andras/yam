var easeInfo = [
	{type: createjs.Ease.backIn, label: "backIn"},
	{type: createjs.Ease.backInOut, label: "backInOut"},
	{type: createjs.Ease.backOut, label: "backOut"},
	{type: createjs.Ease.bounceIn, label: "bounceIn"},
	{type: createjs.Ease.bounceInOut, label: "bounceInOut"},
	{type: createjs.Ease.bounceOut, label: "bounceOut"},
	{type: createjs.Ease.circIn, label: "circIn"},
	{type: createjs.Ease.circInOut, label: "circInOut"},
	{type: createjs.Ease.circOut, label: "circOut"},
	{type: createjs.Ease.cubicIn, label: "cubicIn"},
	{type: createjs.Ease.cubicInOut, label: "cubicInOut"},
	{type: createjs.Ease.cubicOut, label: "cubicOut"},
	{type: createjs.Ease.elasticIn, label: "elasticIn"},
	{type: createjs.Ease.elasticInOut, label: "elasticInOut"},
	{type: createjs.Ease.elasticOut, label: "elasticOut"},
	{type: createjs.Ease.linear, label: "linear/none"},
	{type: createjs.Ease.quadIn, label: "quadIn"},
	{type: createjs.Ease.quadInOut, label: "quadInOut"},
	{type: createjs.Ease.quadOut, label: "quadOut"},
	{type: createjs.Ease.quartIn, label: "quartIn"},
	{type: createjs.Ease.quartInOut, label: "quartInOut"},
	{type: createjs.Ease.quartOut, label: "quartOut"},
	{type: createjs.Ease.quintIn, label: "quintIn"},
	{type: createjs.Ease.quintInOut, label: "quintInOut"},
	{type: createjs.Ease.quintOut, label: "quintOut"},
	{type: createjs.Ease.sineIn, label: "sineIn"},
	{type: createjs.Ease.sineInOut, label: "sineInOut"},
	{type: createjs.Ease.sineOut, label: "sineOut"}
];

function TweenWrapper(target) {
	'use strict';
	this.target = target;
	this._fake = 0;
	if(target) {
		this.tinter = new PETweenableColor(target, 'tint');
		this.tintQueue = [];
		this.tintIndex = -1;
		this._tintProgress = 0;
	}
}

TweenWrapper.prototype.setTintProgress = function(tp) {
	'use strict';
	this._tintProgress = tp;
	var newProgress = tp % 1;
	var newTintIndex = Math.floor(tp);
	if(newTintIndex != this.tintIndex) {
		// console.log("New tint index of "+tp+" is "+newTintIndex+" queue:"+this.tintQueue.length);
		if(newTintIndex >= this.tintQueue.length) {
			newTintIndex = this.tintQueue.length - 1;
			newProgress = 1;
		}
		var tints = this.tintQueue[newTintIndex];
		this.tinter.startColor = tints.from;
		this.tinter.endColor = tints.to;
		this.tintIndex = newTintIndex;
	}
	this.tinter.progress = newProgress;
};

TweenWrapper.prototype.pushTintColor = function(fromTint, toTint) {
	'use strict';
	this.tintQueue.push({from:fromTint, to:toTint});
};

Object.defineProperties(TweenWrapper.prototype, {
	fake: {
		get: function () {
			return this._fake;
		},
		set: function(value) {
			this._fake = value;
		}
	},
	x: {
		get: function () {
			return this.target.x;
		},
		set: function(value) {
			this.target.x = value;
		}
	},
	y: {
		get: function () {
			return this.target.y;
		},
		set: function(value) {
			this.target.y = value;
		}
	},
	sx: {
		get: function () {
			return this.target.scale.x;
		},
		set: function(value) {
			this.target.scale.x = value;
		}
	},
	sy: {
		get: function () {
			return this.target.scale.y;
		},
		set: function(value) {
			this.target.scale.y = value;
		}
	},
	rid: {
		get: function () {
			return this.target.rotationInDeg;
		},
		set: function(value) {
			this.target.rotationInDeg = value;
		}
	},
	a: {
		get: function () {
			return this.target.alpha;
		},
		set: function(value) {
			this.target.alpha = value;
		}
	},
	tintProgress: {
		get: function () {
			return this._tintProgress;
		},
		set: function(value) {
			this.setTintProgress(value);
		}
	}
});

function TweenItem(target, type) {
	var self = this;
	this.target = target;
	this._type = type;
}

Object.defineProperties(TweenItem.prototype, {
	start: {
		get: function () {
			return this._start;
		},
		set: function(value) {
			this._start = value;
		}
	},
	level: {
		get: function() {
			return this._level;
		},
		set: function(value) {
			this._level = value;
		}
	},
	length: {
		get: function () {
			return this._length;
		},
		set: function(value) {
			this._length = value;
		}
	},
	end: {
		get: function() {
			return this.start + this.length;
		}
	},
    type: {
        get: function () {
            return this._type;
        },
        set: function (value) {
			this._type = value;
        }
    }
});


function TweenMaker() {
	this.items = [];
}

TweenMaker.prototype.layoutItems = function() {
	'use strict';
	var levels = this.getItemLayers();
	for(var l = 0; l < levels.length;l++) {
		var level = levels[l];
		for(var idx = 0; idx < level.length; idx++) {
			level[idx].level = l;
		}
	}

};

TweenMaker.prototype.getEase = function(name) {
	'use strict';
	var ret = createjs.Ease.linear;
	for(var idx = 0; idx < easeInfo.length;idx++) {
		if(easeInfo[idx].label == name) {
			ret = easeInfo[idx].type;
		}
	}
	return ret;
};

TweenMaker.prototype.extractItemsPerTargetFromArray = function(items) {
	'use strict';
	var ret = {};
	for(var idx = 0; idx < items.length;idx++) {
		var item = items[idx];
		var target = item.target;
		if(!ret[target.node_id]) {
			ret[target.node_id] = [];
		}
		ret[target.node_id].push(item);
	}
	return ret;
};

TweenMaker.prototype.getItemLayers = function() {
	var levels = [];

	function doesItFitTo(level_idx, item) {
		var level = levels[level_idx];
		if(level.length <= 0) return true;
		var last = level[level.length - 1];
		return last.end <= item.start;
	}
	var perTarget = this.extractItemsPerTargetFromArray(this.items);
	var targetIds = Object.keys(perTarget);
	var last_level = 0;
	for(var tidx = 0; tidx < targetIds.length; tidx++) {
		// console.log("Level #"+l+": "+targetIds[idx]);
		var items = perTarget[targetIds[tidx]];
		items.sort(function(a,b) {
			if(a.type == b.type) {
				if(a.start == b.start) {
					if(a.length == b.length) {
						return a.node_id - b.node_id;
					} else {
						return a.length - b.length;
					}
				} else {
					return a.start - b.start;
				}
			} else {
				return a.type - b.type;
			}
		});
		levels[last_level] = [];
		startLevel = last_level;
		for(var idx = 0; idx < items.length;idx++) {
			var itm = items[idx];
			var needToAddNewlevel = true;
			for(var l = startLevel;l <= last_level;l++) {
				if(doesItFitTo(l,itm)) {
					levels[l].push(itm);
					needToAddNewlevel = false;
					break;
				}
			}
			if(needToAddNewlevel) {
				last_level++;
				levels[last_level] = [];
				levels[last_level].push(itm);
			}
		}
		last_level++;
		// levels[last_level] = [];
	}
	return levels;
	
};

TweenMaker.prototype.createTweens = function(needFake) {
	'use strict';
	// this.restoreAllTargetProperties();

	var self = this;
	createjs.Tween.removeAllTweens();
	var tweens = [];

	if(needFake) {
		var fakeTarget = new TweenWrapper(null);
		var fakeTween = new createjs.Tween.get(fakeTarget).to({fake:100},TL_CONST.MAX_LENGTH_IN_SEC*1000);
		tweens.push(fakeTween);
	}
	var levels = this.getItemLayers();
	for(var l = 0; l < levels.length;l++) {
		var level = levels[l];
		var perTarget = this.extractItemsPerTargetFromArray(level);
		var targetIds = Object.keys(perTarget);
		for(var idx = 0; idx < targetIds.length; idx++) {
			// console.log("Level #"+l+": "+targetIds[idx]);
			var items = perTarget[targetIds[idx]];
			var target = items[0].target;
			var tweenTarget = new TweenWrapper(target);
			var tween = new createjs.Tween.get(tweenTarget);
			var prevEnd = 0;
			var tintIndex = 0;
			var prevTint = target.tint;
			for(var t = 0; t < items.length;t++) {
				var item = items[t];
				var wait = item.start - prevEnd;
				if(wait > 0) tween = tween.wait(wait);
				prevEnd = item.start + item.length;
				var ease = this.getEase(item.params.tween);
				switch(item.type) {
				case PA_TYPE.MOVE: //x,y
					tween = tween.to({x:item.params.x, y: item.params.y}, item.length, ease);
					break;
				case PA_TYPE.SCALE://x,y
					tween = tween.to({sx:item.params.sx, sy: item.params.sy}, item.length, ease);
					break;
				case PA_TYPE.ROTATE://degree
					tween = tween.to({rid:item.params.rotate}, item.length, ease);
					break;
				case PA_TYPE.TINT://endColor
					tweenTarget.pushTintColor(prevTint,item.params.tint);
					prevTint = item.params.tint;
					tintIndex++;
					tween = tween.to({tintProgress:tintIndex}, item.length, ease);
					break;
				case PA_TYPE.CHANGE_TEXTURE://texture
					break;
				case PA_TYPE.OPACITY://endOpacity
					tween = tween.to({a:item.params.opacity}, item.length, ease);
					break;
				}
			}
			tweens.push(tween);
		}
	}
	return tweens;

};
