// Vue.config.debug = true;
Caman.Plugin.register("resize2", function(scale) {
  var ctx;
  var width = Math.ceil(this.canvas.width * scale);
  var height = Math.ceil(this.canvas.height * scale);

  if(this.camanTempCanvas === undefined) {
	  this.camanTempCanvas = document.createElement('canvas');
  }
  this.camanTempCanvas.width = width;
  this.camanTempCanvas.height = height;
  ctx = this.camanTempCanvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, width, height);
  this.resized = true;
  this.canvas.width = width;
  this.canvas.height = height;
	this.width = width;
  this.height = height;
  this.context.clearRect(0, 0, width, height);
  this.context.drawImage(this.camanTempCanvas, 0, 0, width, height, 0, 0, width, height);
	this.reloadCanvasData();
  this.dimensions = {
	width: this.canvas.width,
	height: this.canvas.height
  };
  return this;
});

Caman.Plugin.register("crop2", function(width, height, x, y) {
  var ctx;
  if (x === null) {
	x = 0;
  }
  if (y === null) {
	y = 0;
  }
  if(x < 0) x = 0;
  if(y < 0) y = 0;
  if(width+x > this.canvas.width) width = this.canvas.width - x;
  if(height+y > this.canvas.height) height = this.canvas.height - y;
	console.log('crop to '+x+','+y + ' - '+width+','+height);

  if(this.camanTempCanvas === undefined) {
	  this.camanTempCanvas = document.createElement('canvas');
  }
  this.camanTempCanvas.width = width;
  this.camanTempCanvas.height = height;
  ctx = this.camanTempCanvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
  // this.cropCoordinates = {
  //   x: x,
  //   y: y
  // };
  this.canvas.width = width;
  this.canvas.height = height;
	this.width = width;
  this.height = height;
  // this.context = this.canvas.getContext('2d');
  this.context.clearRect(0, 0, width, height);
  this.context.drawImage(this.camanTempCanvas, 0, 0, width, height, 0, 0, width, height);
	this.reloadCanvasData();
  this.cropped = true;
  this.dimensions = {
	width: this.canvas.width,
	height: this.canvas.height
  };
  return this;
});

Caman.Filter.register("crop2", function() {
  return this.processPlugin("crop2", Array.prototype.slice.call(arguments, 0));
});

Caman.Filter.register("resize2", function() {
  return this.processPlugin("resize2", Array.prototype.slice.call(arguments, 0));
});

Vue.component('imageeditor', {
	template: '#imageeditor-template',
	methods: {
		saveImage: function() {
			this.$root.saveImage();
		},
		executeThis: function(filter_name,param) {
			if(filter_name == 'reset') {
				this.customParamters = {
					brightness:0,
					contrast:0,
					vibrance:0,
					saturation:0,
					exposure:0,
					hue:0,
					sepia:0,
					gamma:0,
					noise:0,
					clip:0,
					sharpen:0,
					stackBlur:0,
					threshold:0,
					posterize:0
				};
			}
			if(filter_name == 'startCrop') {
				this.cropIsOn = true;
			} else if(filter_name == 'stopCrop') {
				this.cropIsOn = false;
			} else if(filter_name == 'doCrop') {
				this.cropIsOn = false;
			}
			this.$root.executeFilter(filter_name,param);
		}
	},
	props: {
			showImageEditor: {
				type: Boolean,
				required: true,
				twoWay: true    
			},
			imagePath: {
				type: String,
				required: true,
				twoWay: true 
			}
	},
	data: function() {
		return {
			scale: 1,
			cropIsOn: false,
			effects: [
					{name:'edgeEnhance',								label:'Edge Enhance', 					style:'preset-col45', param:null},
					{name:'edgeDetect',									label:'Edge Detect', 					style:'preset-col45', param:null},
					{name:'emboss',										label:'Emboss', 						style:'preset-col45', param:null},
					// {name: '##'},
					{name:'boxBlur',									label:"Box Blur", 						style:'preset-col100', param:null},
					{name:'heavyRadialBlur',							label:"Heavy Radial Blur", 				style:'preset-col100', param:null},
					{name:'gaussianBlur', 								label:"Gaussian Blur", 					style:'preset-col100', param:null},
					{name:'motionBlur', 								label:"Motion Blur", 					style:'preset-col100', param:null},
					// {name: '##'},
					{name:'dither', param:"floyd-steinberg", 			label:"Dither: Floyd-Steinberg", 		style:'preset-col100'},
					{name:'dither', param:"jarvis-judice-ninke", 		label:"Dither: Jarvis-Judice-Ninke", 	style:'preset-col100'},
					{name:'dither', param:"stucki", 					label:"Dither: Stucki", 				style:'preset-col100'},
					{name:'dither', param:"atkinson", 					label:"Dither: Atkinson", 				style:'preset-col100'},
					{name:'dither', param:"burkes", 					label:"Dither: Burkes", 				style:'preset-col100'},
					{name:'dither', param:"sierra", 					label:"Dither: Sierra", 				style:'preset-col100'},
					{name:'dither', param:"two-row-sierra", 			label:"Dither: Two-row Sierra", 		style:'preset-col100'},
					{name:'dither', param:"sierra-lite", 				label:"Dither: Sierra-lite", 			style:'preset-col100'},
			],
			presets: [
				{name:'vintage'				,label:'Vintage'},
				{name:'lomo'				,label:'Lomo'},
				{name:'clarity'				,label:'Clarity'},
				{name:'sinCity'				,label:'Sin City'},
				{name:'sunrise'				,label:'Sunrise'},
				{name:'crossProcess'		,label:'Cross Process'},
				{name:'orangePeel'			,label:'Orange Peel'},
				{name:'love'				,label:'Love'},
				{name:'grungy'				,label:'Grungy'},
				{name:'jarques'				,label:'Jarques'},
				{name:'pinhole'				,label:'Pinhole'},
				{name:'oldBoot'				,label:'Old Boot'},
				{name:'glowingSun'			,label:'Glowing Sun'},
				{name:'hazyDays'			,label:'Hazy Days'},
				{name:'herMajesty'			,label:'Her Majesty'},
				{name:'nostalgia'			,label:'Nostalgia'},
				{name:'hemingway'			,label:'Hemingway'},
				{name:'year1977'			,label:'1977'},
				{name:'brannan'				,label:'Branman'},
				{name:'gotham'				,label:'Gotham'},
				{name:'hefe'				,label:'Hefe'},
				{name:'lordkelvin'			,label:'Lord Kelvin'},
				{name:'nashville'			,label:'Nashville'},
				{name:'xpro'				,label:'xpro'},
			],
			controls: [
				{style: 'range',		name: 'brightness', 	label:'brightness',	min:-100, max: 100, step:1},
				{style: 'range',		name: 'contrast', 		label:'contrast', 	min:-100, max: 100, step:1},
				{style: 'range',		name: 'vibrance', 		label:'vibrance', 	min:-100, max: 100, step:1},
				{style: 'range',		name: 'saturation', 	label:'saturation', min:-100, max: 100, step:1},
				{style: 'range',		name: 'exposure', 		label:'exposure', 	min:-100, max: 100, step:1},
				{style: 'range',		name: 'threshold', 		label:'threshold',	min:0, max: 255, step:1},
				{style: 'range',		name: 'hue', 			label:'hue', 		min:0, max: 100, step:1},
				{style: 'range',		name: 'sepia', 			label:'sepia', 		min:0, max: 100, step:1},
				{style: 'range',		name: 'gamma', 			label:'gamma', 		min:0, max: 10, step:0.1},
				{style: 'range',		name: 'noise', 			label:'noise', 		min:0, max: 100, step:1},
				{style: 'range',		name: 'clip', 			label:'clip', 		min:0, max: 100, step:1},
				{style: 'range',		name: 'sharpen', 		label:'sharpen', 	min:0, max: 100, step:1},
				{style: 'range',		name: 'stackBlur', 		label:'stackBlur', 	min:0, max: 20, step:1},
				{style: 'range',		name: 'posterize', 		label:'posterize', 	min:0, max: 64, step:1},
				{style: 'options',	name: 'blur',					label:"blur",  options: [
						{name:'boxBlur', 					label:"box"},
						{name:'heavyRadialBlur', 	label:"heavy radial"},
						{name:'gaussianBlur', 		label:"gaussian"},
						{name:'motionBlur', 			label:"motion"},
					]
				},
				{style: 'options',	name: 'dither',					label:"dither",  options: [
						{name:'floyd-steinberg', 			label:"floyd-steinberg"},
						{name:'jarvis-judice-ninke', 	label:"jarvis-judice-ninke"},
						{name:'stucki', 							label:"stucki"},
						{name:'atkinson', 						label:"atkinson"},
						{name:'burkes', 							label:"burkes"},
						{name:'sierra', 							label:"sierra"},
						{name:'two-row-sierra', 			label:"two-row-sierra"},
						{name:'sierra-lite', 					label:"sierra-lite"},
					]
				}
			],
			//compoundBlur: tiltShift,radialBlur

			customParamters: {
				brightness:0,
				contrast:0,
				vibrance:0,
				saturation:0,
				exposure:0,
				hue:0,
				sepia:0,
				gamma:0,
				noise:0,
				clip:0,
				sharpen:0,
				stackBlur:0,
				threshold:0,
				posterize:0
			}
		};
	},
	created: function() {
		var thiz = this;
		var presets = thiz.presets;
		// for(var idx = 0; idx < presets.length;idx++) {
		// 	var p = presets[idx];
		// 	p.id = Math.random();
		// }
		// this.$watch('imagePath', function () {
		// 	// var effects = thiz.effects;
		// 	// thiz.effects = [];
		// 	// thiz.effects = effects;

		// 	// var presets = thiz.presets;
		// 	// for(var idx = 0; idx < presets.length;idx++) {
		// 	// 	var p = presets[idx];
		// 	// 	p.id = Math.random();
		// 	// }
		// 	// thiz.presets = [];
		// 	// thiz.presets = presets;
		// 	// setTimeout(Caman.DOMUpdated(),0);
		// 	// Caman.DOMUpdated();
		// 	// console.log('imagePath:'+thiz.imagePath);
		// });
		this.$watch('showImageEditor', function () {
			thiz.scaleUW = this.$watch('scale', function () {
				if(thiz.do_not_watch) return;
				thiz.$root.scaleImage(thiz.scale);
			});
			if(thiz.showImageEditor) {
				thiz.customParamters = {
					brightness:0,
					contrast:0,
					vibrance:0,
					saturation:0,
					exposure:0,
					hue:0,
					sepia:0,
					gamma:0,
					noise:0,
					clip:0,
					sharpen:0,
					stackBlur:0,
					threshold:0,
					posterize:0
				};
				thiz.scale = 1;
				thiz.customUW = this.$watch('customParamters',function() {
					if(thiz.do_not_watch) return;
					thiz.$root.customChanged(this.customParamters);
				}, {deep: true});
			} else {
				thiz.customUW();
			}
			thiz.$root.modalOpen = thiz.showImageEditor;
		});
	},
});

PECore.prototype.renderImageEditor = function() {
	this.imageEditorRenderer.render(this.camanRootContainer);
};

PECore.prototype.scaleImage = function(scale) {
	this.camanSprite.scale.x = scale;
	this.camanSprite.scale.y = scale;
	this.updateImageScroller();
	this.renderImageEditor();
};

PECore.prototype.applyCustomFilters = function(params) {
	var self = this;
	self.app.isProgressVisible = true;
	setTimeout(function() {
		Caman(self.camanCanvas,function() {
			this.revert(false);
			var current = this;
			for(var filter_name in params) {
				var val = parseInt(params[filter_name]);
				if(val !== 0) {
					current = current[filter_name].call(this,val);
				}
			}
			this.render(function() {
				self.refreshCamanTexture();
				self.app.isProgressVisible = false;
			});
		});
	},10);
};

PECore.prototype.resetCropRectPos = function() {
		this.cropRect.position.x = 960/2;
		this.cropRect.position.y = 615/2;
};

PECore.prototype.executeFilter = function(filter_name,param) {
	// 'use strict';
	var self = this;
	if(filter_name == 'reset') {
		this.loadImage();
	} else if(filter_name == 'startCrop') {
		self.resetCropRectPos();
		self.cropSelectionHandler.setVisible(true);
	} else if(filter_name == 'stopCrop') {
		self.cropSelectionHandler.setVisible(false);
	} else if(filter_name == 'doCrop') {
		self.app.isProgressVisible = true;
		setTimeout(function() {
		  var w = self.camanCanvas.width;
		  var h = self.camanCanvas.height;
		  var cx1 = self.cropRect.points[0].x;
		  var cy1 = self.cropRect.points[0].y;
		  var cx2 = self.cropRect.points[0].x;
		  var cy2 = self.cropRect.points[0].y;
		  for(var idx = 0; idx < 4;idx++) {
			var p = self.cropRect.points[idx];//{x:self.cropRect.points[idx].x,y:self.cropRect.points[idx].y};
			if(p.x < cx1) cx1 = p.x;
			if(p.y < cy1) cy1 = p.y;
			if(p.x > cx2) cx2 = p.x;
			if(p.y > cy2) cy2 = p.y;
			}
			var cw = cx2 - cx1;
			var ch = cy2 - cy1;
			var p1 = new PIXI.Point(cx1,cy1);
			var p2 = new PIXI.Point(cx2,cy2);
			p1 = self.camanSprite.toLocal(p1,self.cropRect);
			p2 = self.camanSprite.toLocal(p2,self.cropRect);

			cx1 = Math.ceil(p1.x + w/2);
			cy1 = Math.ceil(p1.y + h/2);
			cw = Math.ceil(p2.x - p1.x);
			ch = Math.ceil(p2.y - p1.y);
			Caman(self.camanCanvas,function() {
				this.crop2(cw,ch,cx1,cy1);
				this.render(function() {
					self.refreshCamanTexture();
					self.cropSelectionHandler.setVisible(false);
					self.updateImageScroller();
					self.app.isProgressVisible = false;
				});
			});
		},10);
	} else {
		self.app.isProgressVisible = true;
		setTimeout(function() {
			Caman(self.camanCanvas,function() {
				if(filter_name == 'motionBlur') {
					this.motionBlur(45);
				} else {
					if(param) {
						this[filter_name].call(this,param);
					} else {
						this[filter_name].call(this);
					}
				}
				this.render(function() {
					self.refreshCamanTexture();
					self.app.isProgressVisible = false;
				});
			});
		},10);
	}
};

PECore.prototype.applyPresetToSprite = function(preset_name,param,sprite,cb) {
	var self = this;
	var target = sprite ? sprite : self.activeTarget;
	var with_progress = sprite ? false : true;
	if(target.preset_name) {
		if(target.preset_name === preset_name) {
			return;
		}
	}
	target.preset_name = preset_name;
	if(with_progress) self.app.isProgressVisible = true;
	self._loadImage(target, self.camanCanvas,self.camanCtx, false, function(imgurl) {
		setTimeout(function() {
			Caman(self.camanCanvas,function() {
				if(preset_name !== "original") {
					if(preset_name == 'motionBlur') {
						this.motionBlur(45);
					} else {
						if(param) {
							this[preset_name].call(this,param);
						} else {
							this[preset_name].call(this);
						}
					}
				}
				this.render(function() {
					setTimeout(function() {
						var imgurl = self.camanCanvas.toDataURL('png');
						var img = new Image();
						img.src = imgurl;

						var base = new PIXI.BaseTexture(img),
						    texture = new PIXI.Texture(base);

						target.texture = texture;
						if(with_progress) self.app.isProgressVisible = false;
						texture.on('update', function() {
							self.manualRefresh();
						});
						self.manualRefresh();
						if(cb) cb();
					},0);
				});
			});
		},0);
	});
};

PECore.prototype.refreshCamanTexture = function() {
	var self = this;
	var texture = self.camanTexture;

	texture.baseTexture.hasLoaded = true;
	texture.baseTexture.resolution = 1;
	var w = self.camanCanvas.width;
	var h = self.camanCanvas.height;
	texture.baseTexture.width = w;
	texture.baseTexture.height = h;

	texture.baseTexture.emit('update',  texture.baseTexture);

	setTimeout(function() {
		var pts = [];
		pts.push({x:-w/2,y:-h/2});
		pts.push({x:w/2,y:-h/2});
		pts.push({x:w/2,y:h/2});
		pts.push({x:-w/2,y:h/2});
		self.cropRect.points = pts;
		self.cropSelectionHandler.updateSelectionHandles();
	},0);

};

PECore.prototype.initCaman = function() {
	'use strict';
	this.camanCanvas = document.createElement('canvas');
	this.camanCanvas.id = 'imageeditor-canvas-id';
	this.camanCtx = this.camanCanvas.getContext('2d');
	this.camanTexture = PIXI.Texture.fromCanvas(this.camanCanvas);
};

PECore.prototype.editTexture = function() {
	'use strict';
	var self = this;
	if(self.imageEditorRenderer === undefined) {
		this.imageEditorRenderer = new PIXI.CanvasRenderer(
			960,
			615,
			{
				antialias:true,
				preserveDrawingBuffer:true,
				transparent:true
			}
		);

		this.imageEditorRenderer.backgroundColor = 0x3e3a3a;
		var holder = document.getElementById('image_editor_canvas_holder');
		holder.appendChild(this.imageEditorRenderer.view);

		// this.camanCanvas = document.createElement('canvas');
		// this.camanCanvas.id = 'imageeditor-canvas-id';
		// this.camanCtx = this.camanCanvas.getContext('2d');
		// this.camanTexture = PIXI.Texture.fromCanvas(this.camanCanvas);

		this.camanRootContainer = new PIXI.Container();
		this.camanContainer = new PIXI.Container();

		this.camanRootContainer.addChild(this.camanContainer);
		// this.camanContainer.position.x = 250;
		// this.camanContainer.position.y = 250;

		this.camanSprite = this.createSprite(this.camanTexture);
		this.camanSprite.anchor.x = 0.5;
		this.camanSprite.anchor.y = 0.5;
		this.camanSprite.position.x = 960/2;
		this.camanSprite.position.y = 615/2;

		this.camanContainer.addChild(this.camanSprite);

		this.cropRect = new ShapeFx();
		this.cropRect.position.x = 960/2;
		this.cropRect.position.y = 615/2;
		this.cropRect.alpha = 0;

		this.camanContainer.addChild(this.cropRect);

		var s = this.cropRect.style;
		s.fill = false;
		s.dropShadow = false;
		this.cropRect.kind = SHAPEFX.RECT;
		this.cropRect.style = s;
		var pts = [];
		pts.push({x:-960/2,y:-615/2});
		pts.push({x:960/2,y:-615/2});
		pts.push({x:960/2,y:615/2});
		pts.push({x:-960/2,y:615/2});

		this.cropRect.points = pts;
	

		// this.camanSprite.addChild(this.cropRect);

		// this.camanContainer.addChild(this.camanSprite);

		this.cropSelectionHandler = new PEImageEditorSelectionHandler(self,self.camanContainer);
		this.cropSelectionHandler.assignTo(this.cropRect);
		this.cropSelectionHandler.setVisible(false);

		var mouseTracker = new PIXI.Graphics();
		mouseTracker.hitArea = new PIXI.Rectangle(-960/2,-615/2,960,615);
		mouseTracker.position.x = 960/2;
		mouseTracker.position.y = 615/2;

		this.camanContainer.addChild(mouseTracker);

		//function Scrollbars(root,target,w,h, xmin,xmax,ymin,ymax) {
		this.imageScroller = new Scrollbars(this.camanRootContainer,this.camanContainer,960,615,-1024,1024,-1024,1024, function() {
			self.renderImageEditor();
		});
		this.imageEditorRenderer.view.onmousewheel = function(ev){
			self.imageScroller.wheelBy(ev.wheelDeltaX,ev.wheelDeltaY);
			return false;
		};

		mouseTracker.interactive = true;

		mouseTracker.on('mousedown', function(event) {
			if(self.app.isImageEditorVisible) self.cropSelectionHandler.onMouseDown(event);
		});
		mouseTracker.on('mousemove', function(event) {
			if(self.app.isImageEditorVisible) self.cropSelectionHandler.onMouseMove(event);
		});
		mouseTracker.on('mouseup', function(event) {
			if(self.app.isImageEditorVisible) self.cropSelectionHandler.onMouseUp(event);
		});		
	}

	this.app.isImageEditorVisible = true;
	this.loadImage();
};

PECore.prototype.loadImage = function() {
	'use strict';
	var self = this;
	self._loadImage(self.activeTarget, self.camanCanvas,self.camanCtx, true, function(imgurl) {
		setTimeout(function() {
			self.app.selectedImagePath = imgurl;
		},0);
		self.updateImageScroller();
		self.refreshCamanTexture();
	});
};

PECore.prototype._loadImage = function(target, canvas, ctx, withResize, cb) {
	// 'use strict';
	var self = this;
	var texturePath = target.texturePath;

	var img = new Image();
	img.crossOrigin = '';
	img.src = texturePath;

	function dataArray(length) {
		if ((window.Uint8Array !== null)) {
			return new Uint8Array(length);
		}
		return new Array(length);
	}

	img.onload = function() {
		var w,h =0;
		w = img.width;
		h = img.height;
		//create scaled down for previews - BEGIN
		var imgurl;
		if(withResize) {
			if(w > 180) {
				var sw = w;
				var sh = h;
				sw = 180;
				sh = h/(w/180);
				canvas.width = sw;
				canvas.height = sh;
				ctx.clearRect(0, 0, sw, sh);
				ctx.drawImage(img, 0, 0, sw,sh);
				// imgurl = canvas.toDataURL('png');
				//create scaled down for previews - END
			}
		}
		imgurl = canvas.toDataURL('png');

		canvas.width = w;
		canvas.height = h;

		ctx.clearRect(0, 0, w, h);
		ctx.drawImage(img, 0, 0, w,h);

		// window.open(imgurl, "");

		Caman(canvas,function() {
			'use strict';
			this.originalWidth = this.preScaledWidth = this.width = w;
			this.originalHeight = this.preScaledHeight = this.height = h;
			this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			this.pixelData = this.imageData.data;
			this.initializedPixelData = dataArray(this.pixelData.length);
			this.originalPixelData = dataArray(this.pixelData.length);
			var _ref = this.pixelData;
			var i, _i, _len = 0;
			var pixel;
			for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
				pixel = _ref[i];
				this.initializedPixelData[i] = pixel;
				this.originalPixelData[i] = pixel;
			}
			this.dimensions = {
				width: w,
				height: h
			};
			this.reloadCanvasData();
			this.render(function() {
				if(cb) cb(imgurl);
				// self.updateImageScroller();
				// self.refreshCamanTexture();
			} );
		});
	};
};

/**
	Saves an asset for the user
	The request body must contain the following parameters:
	req.body.asset_meta - meta information for the asset
	{
		name:string     -- name
		type:numeric    -- type of the asset. For values see below
	}
	req.body.asset_content - the content of the asset base64 coded

	The call will result the saved assets URL (relative to the server root)
	The asset will be available in the usr's assets group
*/
// router.post('/assets', function (req, res, next) {

PECore.prototype.saveImage = function() {
	var self = this;
	var meta = JSON.stringify({name:'edited', type:0});
	var content = self.camanCanvas.toDataURL();
	yamPost("api/assets",{ asset_meta: meta, asset_content: content },function(res) {
	// $.post( "api/assets?token=secret", { asset_meta: meta, asset_content: content }, function(res) {
		self.activeTarget.texturePath = res.path;
		var sticker_path = res.path;
		var sticker_texture = PIXI.Texture.fromImage(sticker_path);//resources.svg.data);
		self.activeTarget.texture = sticker_texture;
		sticker_texture.on('update', function() {
			self.manualRefresh();
		});
		self.manualRefresh();
	})
	.fail(function(res) {
		console.log('save image api/assets - FAIL');
	});
};


PECore.prototype.updateImageScroller = function() {
	var self = this;
	var w = self.camanCanvas.width * self.camanSprite.scale.x;
	var h = self.camanCanvas.height  * self.camanSprite.scale.y;
	console.log('scale to:'+w+','+h);
  self.imageScroller.updateSettings(self.camanRootContainer,self.camanContainer,960,615,-w/2,w/2,-h/2,h/2);
};
