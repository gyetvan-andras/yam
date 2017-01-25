
Vue.filter('round_length', function(l) {
	return Math.round(l * 10) / 10;
});

Vue.component('videoeditor', {
	template: '#video-editor-template',
	replace: true,
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true    
		},
		bgi: {
			type: Object,
			required: true,
		}
	},
	data: function() {
		return {
			startTime: 0,
			endTime: 10,
			vp: null,
			stat: null,
			scroller: null,
			img: null,
			handlers: null,
			vb: null,
			ve: null,
			vpos: null,
			play: null,
			pause: null,
			initialize: true,
			showVideo: false
		};
	},
	created: function() {
		'use strict';
		var self = this;
		this.$watch('show', function () {
			self.$root.modalOpen = self.show;
			if(self.show && self.bgi) {
				self.startTime = self.bgi.startTime;
				self.endTime = self.bgi.startTime + self.bgi.length;
				self.showVideo = true;
				Vue.nextTick(function () {
					self.setupVideoPlayer();
					self.updateControlPositions();
  				});
				// setTimeout(function() {
				// },0);
			} else {
				self.vp = null;
				self.showVideo = false;
			}
		});
		// this.$watch('bgi', function () {
			// if(self.bgi) {
			// 	console.log("bgi changed");
			// 	self.startTime = self.bgi.startTime;
			// 	self.endTime = self.bgi.startTime + self.bgi.length;
			// 	setTimeout(function() {
			// 		self.updateControlPositions();
			// 	},10);
			// }
		// });
	},
	ready: function() {
		setTimeout(this.setupUI(),0);
	},
	methods: {
		doCancel: function() {
			'use strict';
			this.stopPlay();
			this.show = false;
		},
		doOK: function() {
			'use strict';
			this.stopPlay();
			this.bgi.startTime = this.startTime;
			this.bgi.length = this.endTime - this.startTime;
			this.show = false;
		},
		updateControlPositions: function() {
			'use strict';
			var self = this;
			self.initialize = true;

			if(!self.img.complete) {
				setTimeout(function() {
					self.updateControlPositions();
				},10);
				return;
			}

			var buf = self.vp.seekable;//self.vp.buffered;
			// console.log("range.length:"+buf.length);
			// console.log("duration:"+self.vp.duration);
			// console.dir(buf);
			if(buf.length > 0) {
				// console.log("range.start:"+buf.start(buf.length-1));
				// console.log("range.end:"+buf.end(buf.length-1));
				var length = buf.end(buf.length-1);
				if(length < self.vp.duration) {
					setTimeout(function() {
						self.updateControlPositions();
					},100);
					return;
				}
			} else {
				setTimeout(function() {
					self.updateControlPositions();
				},100);
				return;
			}
			// var avail = vp.seekable;
			//check for  available video!!!

			var bp = this.startTime * 100;
			var ep = (this.endTime * 100) - this.ve.outerWidth(true);
			var cp = bp - 9;
			var scrollX = 0;
			if(ep > 1000) {
				scrollX = ep - 1000;
				bp -= scrollX;
				ep -= scrollX+this.ve.outerWidth(true);
				cp -= scrollX;
				this.scroller.scrollLeft(scrollX);
			}
			this.vpos.css("left",cp+"px");		
			this.vb.css("left",bp+"px");		
			this.ve.css("left",ep+"px");
			setTimeout(function() {
				self.vp.currentTime = self.startTime;
				self.initialize = false;
			},100);
		},
		startPlay: function () {
			'use strict';
			this.vp.play();
			this.play.hide();
			this.pause.show();
		},

		stopPlay: function() {
			'use strict';
			this.vp.pause();
			this.play.show();
			this.pause.hide();
		},

		setupPlayer: function(start, end) {
			'use strict';
			this.stopPlay();
			this.startTime = start;
			this.endTime = end;
			this.vp.currentTime = start;
			this.setCurrentPosition(start);
		},
		getPosition: function(e,isEnd) {
			'use strict';
			var pos = parseInt(e.css("left"),10);
			if(isEnd) {
				pos += e.outerWidth(true);
			}
			var scrollX = this.scroller.scrollLeft();
			pos += scrollX;
			return pos/100;
		},	
		setCurrentPosition: function(pos) {
			'use strict';
			var scrollX = this.scroller.scrollLeft();
			pos *= 100;
			pos -= scrollX;
			pos -= 9;

			this.vpos.css("left",pos+"px");			
		},
		setPosition: function(pos, isEnd) {
			'use strict';
			this.stopPlay();
			if(isEnd) {
				this.endTime = pos;
			} else {
				this.startTime = pos;
			}
			this.setCurrentPosition(pos);
			this.vp.currentTime = pos;
		},
		setupVideoPlayer: function() {
			'use strict';
			var self = this;
			self.vp = document.getElementById('vp');
			self.vp.addEventListener("timeupdate", function( event ) {
				self.stat.innerHTML = self.vp.currentTime;
				if(self.vp.currentTime > self.endTime) {
					self.vp.currentTime = self.startTime;
				}
				if(!self.vp.paused) {
					self.setCurrentPosition(self.vp.currentTime);
				}
			});
		},
		setupUI: function() {
			'use strict';
			var self = this;
			self.startTime = 0;
			self.endTime = 10;
			// self.vp = document.getElementById('vp');
			self.stat = document.getElementById('stat');
			self.scroller = $("#strip-scroller");
			self.handlers = $("#yam-video-strip-handlers");
			self.vb = $( "#video-begin");
			self.ve = $( "#video-end");
			self.vpos = $( "#video-pos");
			self.play = $("#play");
			self.pause = $("#pause");
			self.img = document.getElementById('strip-img');
			self.pause.hide();

			self.scroller.on('scroll', function(e) {
				if(self.initialize) return;
				// console.log('scrolls');
				var pb = self.getPosition(self.vb,false);
				var pe = self.getPosition(self.ve,true);
				self.setupPlayer(pb,pe);
	        });
			self.vb.draggable({ axis: "x", containment: "#strip-handlers",
				drag: function( event, ui) {
					var pos = self.getPosition(self.vb,false);
					self.setPosition(pos,false);
				},
				stop: function( event, ui) {
					var pos = self.getPosition(self.vb,false);
					self.setPosition(pos,false);
				}
			});
			self.ve.draggable({ axis: "x", containment: "#strip-handlers",
				drag: function( event, ui) {
					var pos = self.getPosition(self.ve,true);
					self.setPosition(pos,true);
				},
				stop: function( event, ui) {
					var pos = self.getPosition(self.vb,false);
					self.setPosition(pos,false);
				}
			});
			// self.vp.addEventListener("timeupdate", function( event ) {
			// 	self.stat.innerHTML = self.vp.currentTime;
			// 	if(self.vp.currentTime > self.endTime) {
			// 		self.vp.currentTime = self.startTime;
			// 	}
			// 	if(!self.vp.paused) {
			// 		self.setCurrentPosition(self.vp.currentTime);
			// 	}
			// });

			self.play.click(function(){
				self.startPlay();
			});
			self.pause.click(function(){
				self.stopPlay();
			});
		}
	}

});

