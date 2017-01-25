
Vue.filter('toDateString', function (value) {
  return new Date(value).toDateString();
});

PECore.prototype.setupPropertiesPanle = function() {
	'use strict';
	var self = this;
	if(this.activeTarget && this.activeTarget !== this.objectLayer) {//display object
		switch(this.activeTarget.type) {
		case OBJ_TYPE.BACKGROUND:
			self.app.propertyMode = 'background';
			break;
		case OBJ_TYPE.SHAPE:
			self.app.propertyMode = 'shape';
			break;
		case OBJ_TYPE.TEXT:
			self.app.propertyMode = 'text';
			break;
		case OBJ_TYPE.SPRITE:
			self.app.propertyMode = 'image';
			break;
		}
	} else {//background
		self.app.propertyMode = 'background';
	}
	setTimeout(function() {
		self.app.propertiesManager.assignedObject = self.activeTarget;
	},0);
};

PECore.prototype.createVueApp = function() {
	'use strict';
	var self = this;
	this.newAction = function(type) {
		self.animationManager.newItem(type, self.activeTarget);
	};


	this.app = new Vue({
		el: '#app',
		data: {
			timeline_actions:timeline_actions,
			selectedImagePath:"images/sample_small.jpg",
			isTargetSelected: false,
			isLayersVisible: true,
			isTimelineVisible: false,
			modalOpen: false,
			isImageEditorVisible: null,
			isVideoEditorVisible: false,
			isYamListVisible: false,
			isAssetListVisible:false,
			isFontListVisible:false,
			selectedFontFamily:null,
			isProgressVisible: false,
			isShapesVisible: false,
			isNewYamCreatorVisible: false,
			isExpertMode: false,
			propertyMode: 'background',
			timelineVisible: false,
			propertiesManager: null,
			selectedBackgroundItem: {video_src:"", url:"", strip:""},
			isYamOptionsVisible: false,
			isShowingAllBgi: false,
			yamProperties: null,
			isYamPublisherVisible: false,
			core: null,
		},
		created: function() {
			this.core = self;
			this.yamProperties = this.core.yamProperties;
			// var self = this;
			this.isImageEditorVisible = false;
			this.propertiesManager = new PropertiesManager(this.core);
			this.$watch('yamProperties.frameWidth', function () {
				this.core.stageRect.setDimension(this.yamProperties.frameWidth,this.yamProperties.frameHeight);
				this.core.manualRefresh();
			});
			this.$watch('yamProperties.frameHeight', function () {
				this.core.stageRect.setDimension(this.yamProperties.frameWidth,this.yamProperties.frameHeight);
				this.core.manualRefresh();
			});
			this.$watch('isTimelineVisible', function () {
				var self = this;
      			self.animationManager.setVisible(self.isTimelineVisible);
    		});
		},
			
		methods: {
			showAllBgi: function() {
				this.isShowingAllBgi = true;
				self.showAllBgi();
			},
			applyPresetToSprite: function(preset_name) {
				self.applyPresetToSprite(preset_name);
			},

			switchTimeline: function() {
				this.timelineVisible = !this.timelineVisible;
				setTimeout(function() {
					self.resizeCanvases();
				}, 0);
			},
			switchExpertMode: function() {
				this.isExpertMode = !this.isExpertMode;
			},
			createNewYam: function() {

			},
			editTexture: function() {
				self.editTexture();
			},
			saveFrame: function() {
				// var frame = self.renderer.view.toDataURL();
				window.open(self.renderer.view.toDataURL('png'), "");
  			},
			saveImage: function() {
				self.saveImage();
				this.isImageEditorVisible = false;
			},
			scaleImage: function(scale) {
				self.scaleImage(scale);
			},
			customChanged: function(params) {
				self.applyCustomFilters(params);
			},
			selectFontByFamily: function(family) {
				this.selectedFontFamily = family;
				this.isFontListVisible = true;
			},
			setTextFont: function(font,variant) {
				self.useTextFont(font.family, variant);
				// setTimeout(function() {
				// },10);
			},
			executeFilter: function(filter_name,param) {
				self.executeFilter(filter_name,param);
			},
			doTimelineAction: function(index) {
				self.newAction(this.timeline_actions[index].action);
			},
			showHideTimeline: function(evt) {
				this.isTimelineVisible = !this.isTimelineVisible;
				var button = evt.target;
				var visible = this.isTimelineVisible;
				if(visible) {
					if(!button.classList.contains('is-selected') ) {
			        	button.classList.add('is-selected');
		            }
		        } else {
					if( button.classList.contains('is-selected') ) {
		                button.classList.remove('is-selected');
			        }
		        }
			},
			showHideLayers: function(evt) {
				this.isLayersVisible = !this.isLayersVisible;
				var button = evt.target;
				var visible = this.isLayersVisible;
				if(visible) {
					if(!button.classList.contains('is-selected') ) {
			        	button.classList.add('is-selected');
		            }
		        } else {
					if( button.classList.contains('is-selected') ) {
		                button.classList.remove('is-selected');
			        }
		        }
			},
			playPause: function(evt) {
				self.paused = !self.paused;
				this.isShowingAllBgi = false;
				var button = evt.target;
				var visible = !self.paused;
				if(visible) {
					if(!button.classList.contains('is-selected') ) {
			        	button.classList.add('is-selected');
		            }
		        } else {
					if( button.classList.contains('is-selected') ) {
		                button.classList.remove('is-selected');
			        }
		        }
		    },
			saveYam: function() {
				self.uploadYam();
			},
			loadYam: function(yam) {
				self.loadYam(yam);
			},
			addAssetToStage: function(asset) {
				self.addAssetToStage(asset);
			},
			addTemplateToStage: function(template) {
				self.addTemplateToStage(template);
			},
			newText: function() {
				self.newText();
			},
			newShape: function(shape_name) {
				self.newShape(shape_name);
			},
			editTextFont: function() {
				self.editTextFont();
			},
			dumpTemplate: function() {
				self.dumpTemplate();
			},
			sendBack: function() {
				self.sendToBackDisplayObject(self.activeTarget);
			},
			bringToFront: function() {
				self.bringToFrontDisplayObject(self.activeTarget);
			},
			deleteObject: function() {
				self.deleteSelectedTarget();
			},
			editGradient: function(val) {
				self.selectionHandler.setGradientMode(val);
			},
			toggleFullscreen: function() {
				function isDocumentInFullScreenMode(theDoc) {
					return ((theDoc.fullscreenElement && theDoc.fullscreenElement !== null) ||
      					theDoc.mozFullScreen || theDoc.webkitIsFullScreen);
				}

				function toggleFullscreen(target) {
					if(target.requestFullScreen) {
						target.requestFullScreen();
					} else if(target.webkitRequestFullScreen ) {
						target.webkitRequestFullScreen();
					} else if(target.mozRequestFullScreen) {
						target.mozRequestFullScreen();
					}
				}

				function cancelFullscreen(doc) {
					if(doc.cancelFullScreen) {
						doc.cancelFullScreen();
					} else if(doc.webkitCancelFullScreen ) {
						doc.webkitCancelFullScreen();
					} else if(doc.mozCancelFullScreen) {
						doc.mozCancelFullScreen();
					}
				}
				
				// var doc = document;
				// var inFullscreen = false;

				// inFullscreen = isDocumentInFullScreenMode(doc);
				// if(inFullscreen) {
				// 	cancelFullscreen(doc);
				// } else {
				// 	toggleFullscreen(doc.getElementById("app"));
				// }

				var parentWindow = window.parent;
				var doc = window.parent.document;
				var ifr = doc.getElementById("yam_editor_iframe");
				var inFullscreen = false;

				if(!ifr) {
					doc = document;
					ifr = doc.getElementById("app");
				}
				inFullscreen = isDocumentInFullScreenMode(doc);
				if(inFullscreen) {
					cancelFullscreen(doc);
				} else {
					toggleFullscreen(ifr);
				}
			}
		}
	});
	this.app.core = this;
};