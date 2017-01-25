function splitVariant(variant) {
	var weight = '400';
	var style = 'normal';
	if(variant === 'italic') {
		style = 'italic';
	} else if(variant.endsWith('italic')) {
		style = 'italic';
		var idx = variant.indexOf('italic');
		weight = variant.slice(0,idx);
	} else {
		if(variant === 'regular') {
			weight = '400';
		} else {
			weight = variant;
		}
	}
	return {weight:weight, style:style};
}

Vue.filter('spaceless', function (value) {
	if(value) return value.replace(/ /g, '+');
	else return '';
});

Vue.filter('fontname', function (value) {
	return value.name || value.family;
});

Vue.filter('fontsample', function (value) {
	return value.sample || "AaBbCc 012";
});

Vue.filter('cssurl', function (variants) {
	if(variants) return ':'+variants.join(',');
	return '';
});

Vue.filter('fontstyle', function (variant) {
	if(variant) {
		var vp = splitVariant(variant);
		// console.log('font-style: '+vp.style+'; font-weight: '+vp.weight+';');
		return 'font-style: '+vp.style+'; font-weight: '+vp.weight+';';
	} else {
		return '';
	}
});

Vue.component('fontselector', {
	replace: true,
	template: '#fontselector-template',
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true    
		}
	},
	data: function() {
		return {
			loaded_once:false,
			fontsArray: [],
			filterKey:'',
			fontsBrowsing:true,
			selectedGroup: 0,
			selectedFont:{variants:[]}
		};
	},

	created: function() {
		'use strict';
		var thiz = this;
		this.$watch('show', function () {
			thiz.$root.modalOpen = thiz.show;
			if(thiz.show) {
				if(!thiz.loaded_once) {
					thiz.fetchFonts();
					thiz.loaded_once = true;
				} else {
					thiz.navigateToFont();
				}
			}
		});
	},
	methods: {
		fetchFonts: function() {
			// 'use strict';
			var thiz = this;
			var jqxhr = $.get( "/api/fontS?token=secret", function(data) {
				thiz.fontsArray = data;
				console.dir(data);
				setTimeout(function() {
					thiz.navigateToFont();
				},0);
			})
			.fail(function() {
				console.log('getting fonts - FAIL');
			});
		},
		navigateToFont: function() {
			'use strict';
			console.log("Navigate to font");
			var self = this;
			if(this.$root.selectedFontFamily && this.$root.selectedFontFamily.length > 0) {
				for(var idx in self.fontsArray) {
					for(var idx2 in self.fontsArray[idx].items) {
						var font = self.fontsArray[idx].items[idx2];
						if(font.family == this.$root.selectedFontFamily) {
							self.selectedGroup = idx;
							this.selectedFont = font;
							this.fontsBrowsing = false;
							break;
						}
					}
				}
			}
		},
	}
});

Vue.component('fontgrid', {
	replace: true,
	template: '#fontgrid-template',
	props: {
		fonts: {
			type: Array,
			required: true
		},
		isGoogle: {
			type: Boolean,
			required: true
		},
		filterKey: {
			type: String,
			required: true
		},
		fontsBrowsing: {
			type: Boolean,
			required: true,
			twoWay: true
		},
		selectedFont: {
			type: Object,
			required: true
		}
	},
	data: function() {
		return {
			perPage: 28,
			page:0,
			pageCount:0,
			// selectedFont:{variants:[]}
		};
	},
	computed: {
		filteredRows: function() {
			// 'use strict';
			return this.$options.filters.filterBy(this.fonts, this.filterKey, 'family');
		},
		currentPage: function() {
			// 'use strict';
			return this.filteredRows.slice(Math.max(this.page, 0) * this.perPage, Math.max(this.page + 1, 1) * this.perPage);
		}
	},
	created: function() {
		// 'use strict';
		var thiz = this;
		// thiz.filterKey = '';
		// if(!thiz.loaded_once) {
		// 	thiz.fetchFonts();
		// 	thiz.loaded_once = true;
		// } else {
		// 	thiz.navigateToFont();
		// }
	},
	compiled: function() {
		this.$watch(function() {
			this.pageCount = Math.ceil(this.filteredRows.length / this.perPage);
		});
	},
	methods: {
		// navigateToFont: function() {
		// 	// 'use strict';
		// 	if(this.$root.selectedFontFamily && this.$root.selectedFontFamily.length > 0) {
		// 		for(var idx in this.fonts) {
		// 			var font = this.fonts[idx];
		// 			if(font.family == this.$root.selectedFontFamily) {
		// 				this.selectedFont = font;
		// 				this.fontsBrowsing = false;
		// 				break;
		// 			}
		// 		}
		// 	}
		// },
		selectFont: function(font,variant) {
			// 'use strict';
			console.log("selectFont:");
			console.dir(font);
			console.log(variant);
			this.$parent.$root.setTextFont(font,variant);
			this.$parent.show = false;
		},
		showFont : function(font) {
			// 'use strict';
			this.selectedFont = font;
			this.fontsBrowsing = false;
		},
		// fetchFonts: function() {
		// 	// 'use strict';
		// 	var thiz = this;
		// 	var jqxhr = $.get( "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyD2RboBTkPWFIp0BskJ-p_AWSMVlM9ttsc", function(data) {
		// 		data.items.sort(function(f1,f2){
		// 			return f1.family.toLowerCase().localeCompare(f2.family.toLowerCase());
		// 		});
		// 		thiz.fonts = data.items;
		// 		setTimeout(function() {
		// 			thiz.navigateToFont();
		// 		},0);
		// 	})
		// 	.fail(function() {
		// 		console.log('getting fonts - FAIL');
		// 	});
		// },
		isCurrent: function(index) {
			// 'use strict';
			return index === this.page;
		},
		next: function() {
			// 'use strict';
			if(this.page < this.pageCount - 1) {
				this.page++;
			}
		},
		prev: function() {
			'use strict';
			if(this.page > 0) {
				this.page--;
			}
		}
	}
});

PECore.prototype.editTextFont = function() {
	'use strict';
	var self = this;
	// self.activeTarget;
	self.app.selectFontByFamily(self.activeTarget.style.fontFamily);
};

PECore.prototype.useTextFont = function(fontFamily, variant, target) {
	'use strict';
	var self = this;
	var text = target || self.activeTarget;
	var vp = splitVariant(variant);
	var fontName = fontFamily;
	var fontWeight = ':'+variant;
	text.style.googleFont = true;
	text.style.googleFontFamily = fontFamily;
	text.style.googleFontVariant = variant;
	var style = text.style;
	style.fontFamily = fontName;
	// if(vp.weight == 'regular') vp.weight = '400';
	style.fontWeight = vp.weight;
	style.fontStyle = vp.style;
	text.style = style;
	PECore.textFxsToUpdate.push(text);

	self.manualRefresh();
	self.selectionHandler.assignTo(text);
	self.manualRefresh();
};

PECore.fontCache = [];
PECore.textFxsToUpdate = [];

PECore.prototype.setTextFont = function(fontFamily, variant, target) {
	'use strict';
	var self = this;

	if(PECore.fontCache.indexOf(fontFamily+variant) == -1) {
		PECore.fontCache.push(fontFamily+variant);
		var vp = splitVariant(variant);
			var fontName = fontFamily;
			var fontWeight = ':'+variant;
			WebFont.load({
				google: {
				  families: [fontName+fontWeight]
				},
				active: function() { // - This event is triggered when the fonts have rendered.
					// console.log('WebFont:active');
					for(var idx in PECore.textFxsToUpdate) {
						var textFx = PECore.textFxsToUpdate[idx];
						textFx.style = textFx.style;
					}
					self.useTextFont(fontFamily, variant, target);
				},
				loading: function() { 			// - This event is triggered when all fonts have been requested.
					console.log('WebFont:loading');
				},
				inactive: function() {			// - This event is triggered when the browser does not support linked fonts or if none of the fonts could be loaded.
					console.log('WebFont:inactive');
				},
				fontloading: function() {		// - This event is triggered once for each font that's loaded.
					console.log('WebFont:fontloading');
				},
				fontactive: function() {		// - This event is triggered once for each font that renders.
					console.log('WebFont:fontactive');
				},
				fontinactive: function() {	//- This event is triggered if the font can't be loaded.		
					console.log('WebFont:fontinactive');
				}
			});
	} else {
		self.useTextFont(fontFamily, variant, target);
	}

};

PECore.prototype.newText = function() {
	'use strict';
	var self = this;
	var fontName = 'HanWangKanTang';
	var fontSize = 32;
	var text = new TextFx('Hello!\nThis is a TextFx');
	text.anchor.x = 0.5;
	text.anchor.y = 0.5;
	text.locked = false;
	// text.position.x = 400;
	// text.position.y = 200;
	var style = text.style;
	style.fontFamily = fontName;
	style.fontWeight = 400;
	style.fontStyle = 'normal';
	style.fontSize = fontSize;
	style.fillColor = 0xffffff;
	text.style = style;

	text.type = OBJ_TYPE.TEXT;

	if(self.activeTarget) {
		self.activeTarget.addChild(text);
		self.addChildNodeTo(self.activeTarget,text);
	} else {
		text.position.x = self.yamProperties.frameWidth/2;
		text.position.y = self.yamProperties.frameHeight/2;
		self.objectLayer.addChild(text);
		self.addChildNodeTo(self.objectLayer,text);
	}
	self.manualRefresh();
};