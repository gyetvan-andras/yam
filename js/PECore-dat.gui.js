
PECore.prototype.updateGuiControllers = function() {
	'use strict';
	for(var idx = 0; idx < this.controllers.length;idx++) {
		this.controllers[idx].updateDisplay();
	}
};

PECore.prototype.registerGuiController = function(controller) {
	'use strict';
	this.controllers.push(controller);
	return controller;
};

PECore.prototype.setupDatGui = function() {
	'use strict';
	var self = this;
	// if(!self.app.isExpertMode) return;
	if(this.activeTarget && this.activeTarget !== this.objectLayer) {
		if(this.gui) {
			this.guiContainer.removeChild(this.gui.domElement);
			delete(this.gui);
		}
		this.rootStageGuiLoaded = false;
		this.controllers = [];
		this.gui = new dat.GUI({ autoPlace: false,showClose:false });
		this.guiContainer.appendChild(this.gui.domElement);

		var pf = this.gui.addFolder('Position');
			this.registerGuiController(pf.add(this.activeTarget, 'x',-200,1024).setDisplayName('X')).onChange(function(value) {
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
			this.registerGuiController(pf.add(this.activeTarget, 'y',-200,1024).setDisplayName('Y')).onChange(function(value) {
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
		var ppf = this.gui.addFolder('Pivot');
			this.registerGuiController(ppf.add(this.activeTarget.pivot, 'x',-200,1024).setDisplayName('PX')).onChange(function(value) {
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
			this.registerGuiController(ppf.add(this.activeTarget.pivot, 'y',-200,1024).setDisplayName('PY')).onChange(function(value) {
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});

		var skwf = this.gui.addFolder('Skew');
			this.registerGuiController(skwf.add(this.activeTarget.skew, 'x',0,1,0.1).setDisplayName('SKX')).onChange(function(value) {
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
			this.registerGuiController(skwf.add(this.activeTarget.skew, 'y',0,1,0.1).setDisplayName('SKY')).onChange(function(value) {
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});


		var sf = this.gui.addFolder('Size');
			this.registerGuiController(sf.add(this.activeTarget, 'width',10,800).setDisplayName('Width')).onChange(function(value) {
				if(self.yamProperties.keepAspect) {
					self.activeTarget.scale.y = self.activeTarget.scale.x;
					self.updateGuiControllers();
				}
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
			this.registerGuiController(sf.add(this.activeTarget, 'height',10,600).setDisplayName('Height')).onChange(function(value) {
				if(self.yamProperties.keepAspect) {
					self.activeTarget.scale.x = self.activeTarget.scale.y;
					self.updateGuiControllers();
				}
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});

		var scf = this.gui.addFolder('Scale');
			this.registerGuiController(scf.add(this.activeTarget.scale, 'x',-10,10,0.01).setDisplayName('Horizontal')).onChange(function(value) {
				if(self.yamProperties.keepAspect) {
					self.activeTarget.scale.y = self.activeTarget.scale.x;
					self.updateGuiControllers();
				}
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
			this.registerGuiController(scf.add(this.activeTarget.scale, 'y',-10,10,0.01).setDisplayName('Vertical')).onChange(function(value) {
				if(self.yamProperties.keepAspect) {
					self.activeTarget.scale.x = self.activeTarget.scale.y;
					self.updateGuiControllers();
				}
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});

		// pf.open();
		// ppf.open();
		// sf.open();
		// scf.open();

		this.registerGuiController(this.gui.add(this.activeTarget, 'rotationInDeg',0,360).setDisplayName('Rotation')).onChange(function(value) {
			self.selectionHandler.assignTo(self.activeTarget);
			self.manualRefresh();
		});

		this.gui.add(this.activeTarget, 'alpha',0,1,0.01).setDisplayName('Opacity').onChange(function(value) {
			self.manualRefresh();
		});

		// if(this.activeTarget.tint) {
		// 	this.gui.addColor(this.activeTarget, 'tint').setDisplayName('Tint').onChange(function(value) {
		// 		self.manualRefresh();
		// 	});
		// }
		var shdf;
		//SHAPE PROPERTIES
		if(this.activeTarget.type == OBJ_TYPE.SHAPE) {
			var shpf = this.gui.addFolder('Style');
				// shpf.add(this.activeTarget.style,'fill').setDisplayName('Fill').onChange(function(value) {
				// 	self.activeTarget.style = self.activeTarget.style;
				// 	self.manualRefresh();
				// });
				// shpf.addColor(this.activeTarget.style,'fillColor').setDisplayName('Fill color').onChange(function(value) {
				// 	self.activeTarget.style = self.activeTarget.style;
				// 	self.manualRefresh();
				// });
				// shpf.addColor(this.activeTarget.style,'strokeColor').setDisplayName('Stroke color').onChange(function(value) {
				// 	self.activeTarget.style = self.activeTarget.style;
				// 	self.manualRefresh();
				// });
				shpf.add(this.activeTarget.style,'strokeThickness',0,100,1).setDisplayName('Stroke Thickness').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				// var gradf = shpf.addFolder('Gradient Fill');
				// 	gradf.add(this.activeTarget.style,'gradientFill').setDisplayName('Use gradient fill').onChange(function(value) {
				// 		self.activeTarget.style = self.activeTarget.style;
				// 		self.manualRefresh();
				// 	});
				// 	gradf.add(this.activeTarget.style,'gradientStyle',{ Linear: SHAPEFX.LINEAR, Radial: SHAPEFX.RADIAL }).setDisplayName('Gradient type').onChange(function(value) {
				// 		self.activeTarget.style.gradientStyle = parseInt(value);
				// 		self.activeTarget.style = self.activeTarget.style;
				// 		self.selectionHandler.assignTo(self.activeTarget);
				// 		self.manualRefresh();
				// 	});

				// 	gradf.add(this,'editGradient').setDisplayName('Gradient Colors').onChange(function(value) {
				// 		self.manualRefresh();
				// 	});
				shpf.open();
			shdf = shpf.addFolder('Shadow');
				shdf.add(this.activeTarget.style,'dropShadow').setDisplayName('Drop').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				shdf.add(this.activeTarget.style,'dropShadowBlur',4,256,1).setDisplayName('Blur').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				shdf.addColor(this.activeTarget.style,'dropShadowColor').setDisplayName('Color').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
				});
				shdf.add(this.activeTarget.style,'dropShadowAngleInDeg',0,360,1).setDisplayName('Angle').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				shdf.add(this.activeTarget.style,'dropShadowDistance',0,256,1).setDisplayName('Distance').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				// shdf.open();
		}
		//TEXT PROPERTIES
		if(this.activeTarget.type == OBJ_TYPE.TEXT) {
			this.gui.add(this.activeTarget,'text').setDisplayName('Text').onChange(function(value) {
				self.manualRefresh();
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});

			// var fntf = this.gui.addFolder('Font');
			// 	fntf.add(this,'editTextFont').setDisplayName('Family');
			// 	fntf.add(this.activeTarget.style,'fontSize',6,1024,1).setDisplayName('Size').onChange(function(value) {
			// 		self.activeTarget.style = self.activeTarget.style;
			// 		self.manualRefresh();
			// 		self.selectionHandler.assignTo(self.activeTarget);
			// 		self.manualRefresh();
			// 	});

			var txtf = this.gui.addFolder('Style');
				// txtf.add(this.activeTarget.style,'fill').setDisplayName('Fill').onChange(function(value) {
				// 	self.activeTarget.style = self.activeTarget.style;
				// 	self.manualRefresh();
				// });
				// txtf.addColor(this.activeTarget.style,'fillColor').setDisplayName('Fill color').onChange(function(value) {
				// 	self.activeTarget.style = self.activeTarget.style;
				// 	self.manualRefresh();
				// });
				// txtf.addColor(this.activeTarget.style,'strokeColor').setDisplayName('Stroke color').onChange(function(value) {
				// 	self.activeTarget.style = self.activeTarget.style;
				// 	self.manualRefresh();
				// });
				txtf.add(this.activeTarget.style,'strokeThickness',0,100,1).setDisplayName('Stroke Thickness').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});

			var padf = txtf.addFolder('Padding');
				padf.add(this.activeTarget.style,'xPadding',0,100,1).setDisplayName('Horizontal').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				padf.add(this.activeTarget.style,'yPadding',0,100,1).setDisplayName('Vertical').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});

			shdf = txtf.addFolder('Shadow');
				shdf.add(this.activeTarget.style,'dropShadow').setDisplayName('Drop').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				shdf.add(this.activeTarget.style,'dropShadowBlur',4,256,1).setDisplayName('Blur').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				shdf.addColor(this.activeTarget.style,'dropShadowColor').setDisplayName('Color').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
				});
				shdf.add(this.activeTarget.style,'dropShadowAngleInDeg',0,360,1).setDisplayName('Angle').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
				shdf.add(this.activeTarget.style,'dropShadowDistance',0,256,1).setDisplayName('Distance').onChange(function(value) {
					self.activeTarget.style = self.activeTarget.style;
					self.manualRefresh();
					self.selectionHandler.assignTo(self.activeTarget);
					self.manualRefresh();
				});
			txtf.add(this.activeTarget.style,'cutOut').setDisplayName('Cut Out').onChange(function(value) {
				self.activeTarget.style = self.activeTarget.style;
				self.manualRefresh();
				self.selectionHandler.assignTo(self.activeTarget);
				self.manualRefresh();
			});
			// fntf.open();
			txtf.open();
			// shdf.open();
		}
		if(this.activeTarget.texturePath) {
			this.gui.add(this, 'editTexture').setDisplayName('Edit Image...');
		}
		this.gui.add(this.activeTarget, 'locked').setDisplayName('Locked').onChange(function(value) {
			if(value) {
				self.activeTarget = undefined;
				self.selectionHandler.assignTo(this.activeTarget);
				self.setupDatGui();
				self.manualRefresh();
			}
		});
		this.gui.add(this.yamProperties, 'keepAspect').setDisplayName('Keep aspect');
		this.gui.add(this, 'deleteSelectedTarget').setDisplayName('Delete');

	} else {
		if(this.rootStageGuiLoaded) return;
		if(this.gui) {
			this.guiContainer.removeChild(this.gui.domElement);
			delete(this.gui);
		}
		this.rootStageGuiLoaded = true;
		this.controllers = [];
		this.gui = new dat.GUI({ autoPlace: false,showClose:false });
		this.guiContainer.appendChild(this.gui.domElement);

		this.registerGuiController(this.gui.add(this.yamProperties, 'name').setDisplayName('Name'));
		this.registerGuiController(this.gui.add(this.yamProperties, 'desc').setDisplayName('Description'));

		var ssf = this.gui.addFolder('Scene Size');
		
		this.registerGuiController(ssf.add(this.stageRect, 'width',320,800).setDisplayName('Width')).onChange(function(value) {
			self.yamProperties.frameWidth = value;
			self.manualRefresh();
		});
		this.registerGuiController(ssf.add(this.stageRect, 'height',240,600).setDisplayName('Height')).onChange(function(value) {
			self.yamProperties.frameHeight = value;
			self.manualRefresh();
		});
		this.registerGuiController(this.gui.addColor(this.stageRect, 'bgColor').setDisplayName('Background')).onChange(function(value) {
			self.manualRefresh();
		});
		this.gui.add(this.stageRect, 'transparent').setDisplayName('Transparent').onChange(function(value) {
			self.manualRefresh();
		});
		// var spf = this.gui.addFolder('Stage Position');
		// this.registerGuiController(spf.add(this.scrollableStage.position, 'x',-200,1024).setDisplayName('X')).onChange(function(value) {
		// 	// self.hudLayer.position.x = -self.scrollableStage.position.x;
		// 	self.manualRefresh();
		// });
		// this.registerGuiController(spf.add(this.scrollableStage.position, 'y',-200,1024).setDisplayName('Y')).onChange(function(value) {
		// 	// self.hudLayer.position.y = -self.scrollableStage.position.y;
		// 	self.manualRefresh();
		// });
		this.registerGuiController(this.gui.add(this.yamProperties, 'keepAspect').setDisplayName('Keep aspect'));
	}
};
