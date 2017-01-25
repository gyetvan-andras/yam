Vue.component('publish', {
	replace: true,
	template: '#publish-template',
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true    
		}
	},
	data: function() {
		return {
			percent: 10,
			previewRenderer: null,
			holder: null,
			owner: null,
			ready: false,
			player: null,
			yam: null,
			session: null
		};
	},
	ready: function() {
		'use strict';
		this.holder = document.getElementById('publish_preview');
		var self = this;
		self.ready = false;
		self.$watch('show', function () {
			self.$root.modalOpen = self.show;
			if(self.show) {
				var core = self.$root.core; 

				self.player = new PlayerEngine(self.holder);

				yamGet("api/publish/start",function(res) {
				// $.get( "api/publish/start?token=secret", function(res) {
					self.session = res.session;
					self.yam = null;
					self.sprites = core.collectSprites();
					processNextSprite();

				    function fail(err) {
				    	console.log("FAILED to publish YAM");
				    	console.dir(err);
				    }

					function spritesProcessed() {
						self.yam = JSON.parse(core.save());
					    self.bgiVideos = [];
						for(var i = 0; i < self.yam.backgroundItems.length; i++) {
							var bgi = self.yam.backgroundItems[i];
							if(bgi.itemKind === BG_ITEM_KIND.VIDEO) {
								self.bgiVideos.push(bgi);
							}
						}
						processNextBgiVideo();
					}

					function processNextSprite() {
						var obj = self.sprites.pop();
						if(obj) {
							var texi = null;
							switch(obj.type) {
								case OBJ_TYPE.TEXT:
									texi = obj.texture;
									break;	
								case OBJ_TYPE.SHAPE:
									texi = obj.texture;
									break;	
								case OBJ_TYPE.SPRITE:
									// console.log(obj.node_name+" presetMode:"+obj.presetMode);
									if(obj.presetMode && obj.presetMode !== "original") texi = obj.texture;
									break;	
							}
							if(texi) {
								var bt = texi.baseTexture;
								var src = bt.source;
								var data = null;
								if(src instanceof HTMLCanvasElement) {
									data = src.toDataURL('png');
								} else if(src instanceof Image) {
									data = src.src;
								}
								console.log("Texture source of "+obj.node_name);
								console.dir(data);
								yamPost("api/publish/texture",{session: self.session,texture_content: data},function(res) {
								// $.post( "api/publish/texture?token=secret", {session: self.session, texture_content: data}, function(res) {
									console.log(obj.node_name+" -> "+res.path);
									obj.texturePath = res.path;
									processNextSprite();
								})
								.fail(fail); 
							} else {
								processNextSprite();
							}
						} else {
							spritesProcessed();
						}
					}
					function bgiVideosProcessed() {
						self.player.loadYam(self.yam);	
						// createRenderer(self.yam);
					}
					function processNextBgiVideo() {
						var bgi = self.bgiVideos.pop();
						if(bgi) {
							var idx = self.bgiVideos.length + 1;
						    var filename = bgi.video_src;
						    var prefix = 'bgi'+idx;
						    var start = bgi.startTime;
						    var duration = bgi.length;
							yamPost("api/publish/frames",
							// $.post( "api/publish/frames?token=secret", 
							{ 
								session: self.session, 
							    filename: filename,
							    prefix: prefix,
							    start: start,
							    duration:duration
							}, function(res) {
								bgi.frames = res;
								processNextBgiVideo();
							})
							.fail(fail); 
						} else {
							bgiVideosProcessed();
						}
					}
					// processNextBgiVideo();
				})
				.fail(function() {
				});
			} else {
				// createjs.Ticker.removeEventListener("tick", self.handleTick);
				self.player.destroy();
				self.player = null;
			}
		});

	},
	methods: {
		// handleTick: function(event) {
		// 	'use strict';
		// 	if(this.player.ready) {
		// 		this.previewRenderer.render(this.player.objectLayer);
		// 	}
		// },
		doOK: function() {
			'use strict';
			var self = this;
			self.player.stop();
			var yamstr = JSON.stringify(self.yam,function(key, value) {
				if(key === "prevSprite") {
					return undefined;
				} else if(key === "nextSprite") {
					return undefined;
				} else if(key === "displayObject") {
					return undefined;
				} else {
					return value;			
				}
			},'\t');	
			yamPost("api/publish/yam",{ session:self.session, yam_content: yamstr },function(res) {
			// $.post( "api/publish/yam?token=secret", { session:self.session, yam_content: yamstr }, function(res) {
				console.log("Successfull published to:"+res.path);
			} )
			.fail(function(err) {
				console.log("FAILED to update YAM! - "+err);
			}); 
			self.show = false;
		},
		doCancel: function() {
			'use strict';
			this.show = false;
		}
	}
});
