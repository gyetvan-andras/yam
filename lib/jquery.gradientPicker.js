/**
@author Matt Crinklaw-Vogt (tantaman)
*/
(function( $ ) {
	if (!$.event.special.destroyed) {
		$.event.special.destroyed = {
		    remove: function(o) {
		    	if (o.handler) {
		    		o.handler();
		    	}
		    }
		};
	}

	function ctrlPtComparator(l,r) {
		return l.position - r.position;
	}

	function bind(fn, ctx) {
		if (typeof fn.bind === "function") {
			return fn.bind(ctx);
		} else {
			return function() {
				fn.apply(ctx, arguments);
			};
		}
	}

	var pickerWidth = 150;

	var browserPrefix = "";
	var agent = window.navigator.userAgent;
	if (agent.indexOf('WebKit') >= 0)
		browserPrefix = "-webkit-";
	else if (agent.indexOf('Mozilla') >= 0)
		browserPrefix = "-moz-";
	else if (agent.indexOf('Microsoft') >= 0)
		browserPrefix = "-ms-";
	else
		browserPrefix = "";

	function GradientSelection($el, opts) {
		this.$el = $el;
		// this.$el.css("position", "absolute");
		this.opts = opts;

		var $preview = $("<canvas class='gradientPicker-preview'></canvas>");
		this.$el.append($preview);
		var canvas = $preview[0];
		// canvas.width = pickerWidth;//canvas.clientWidth;
		// canvas.height = 20;//canvas.clientHeight;
		// canvas.width = canvas.clientWidth;
		// canvas.height = canvas.clientHeight;
		this.g2d = canvas.getContext("2d");

		var $ctrlPtContainer = $("<div class='gradientPicker-ctrlPts'></div>");
		this.$el.append($ctrlPtContainer);
		this.$ctrlPtContainer = $ctrlPtContainer;

		this.updatePreview = bind(this.updatePreview, this);
		this.controlPoints = [];
		// this.ctrlPtConfig = new ControlPtConfig(this.$el, opts);
		for (var i = 0; i < opts.controlPoints.length; ++i) {
			var ctrlPt = this.createCtrlPt(opts.controlPoints[i]);
			this.controlPoints.push(ctrlPt);
		}

		this.docClicked = bind(this.docClicked, this);
		this.destroyed = bind(this.destroyed, this);
		$(document).bind("click", this.docClicked);
		this.$el.bind("destroyed", this.destroyed);
		this.previewClicked = bind(this.previewClicked, this);
		$preview.click(this.previewClicked);

		this.updatePreview();
	}

	GradientSelection.prototype = {
		docClicked: function() {
			// this.ctrlPtConfig.hide();
		},

		createCtrlPt: function(ctrlPtSetup) {
			return new ControlPoint(this.$ctrlPtContainer, ctrlPtSetup, this.opts.orientation, this);
		},

		destroyed: function() {
			$(document).unbind("click", this.docClicked);
		},

		updateOptions: function(opts) {
			var ctrlPt = null;
			var i = 0;
			for (i = 0; i < this.controlPoints.length; ++i) {
				ctrlPt = this.controlPoints[i];
				ctrlPt.$el.remove();
			}
			$.extend(this.opts, opts);
			this.controlPoints = [];
			for (i = 0; i < opts.controlPoints.length; ++i) {
				ctrlPt = this.createCtrlPt(opts.controlPoints[i]);
				this.controlPoints.push(ctrlPt);
			}
			this.updatePreviewEx(false);
		},

		updatePreview: function() {
			this.updatePreviewEx(true);
		},

		updatePreviewEx: function(withUpdate) {
			var result = [];
			this.controlPoints.sort(ctrlPtComparator);
			var grad;
			if (this.opts.orientation == "horizontal") {
				grad = this.g2d.createLinearGradient(0, 0, this.g2d.canvas.width, 0);
				for (var i = 0; i < this.controlPoints.length; ++i) {
					var pt = this.controlPoints[i];
					grad.addColorStop(pt.position, pt.color);
					result.push({
						position: pt.position,
						color: pt.color
					});
				}
			} else {

			}

			this.g2d.fillStyle = grad;
			this.g2d.fillRect(0, 0, this.g2d.canvas.width, this.g2d.canvas.height);

			if (this.opts.generateStyles && withUpdate) {
				var styles = this._generatePreviewStyles();
				this.opts.change(result, styles);
			}

		},

		removeControlPoint: function(ctrlPt) {
			var cpidx = this.controlPoints.indexOf(ctrlPt);

			if (cpidx != -1) {
				this.controlPoints.splice(cpidx, 1);
				ctrlPt.$el.remove();
			}
		},

		previewClicked: function(evt) {
			evt.stopPropagation();
			var canvas = evt.target;
			var cw = canvas.width;

			var rect = canvas.getBoundingClientRect();
			var x =  evt.clientX - rect.left;
			var y = evt.clientY - rect.top;

			var sx = cw / rect.width;
			x = x * sx;
			// var offset = $(e.target).offset();
			// var x = e.pageX - offset.left;
			// var y = e.pageY - offset.top;

			var imgData = this.g2d.getImageData(x,y,1,1);
			var colorStr = "rgb(" + imgData.data[0] + "," + imgData.data[1] + "," + imgData.data[2] + ")";

			var cp = this.createCtrlPt({
				position: x / this.g2d.canvas.width,
				color: colorStr
			});

			this.controlPoints.push(cp);
			this.controlPoints.sort(ctrlPtComparator);
		},

		_generatePreviewStyles: function() {
			var ret = [];
			for (var i = 0; i < this.controlPoints.length; ++i) {
				var pt = this.controlPoints[i];
				var cs = {};
				cs.stop = pt.position;
				cs.color = pt.color;
				ret.push(cs);
			}
			return ret;
		}
	};

	function ControlPoint($parentEl, initialState, orientation, listener) {
		var self = this;
		this.$el = $("<div class='gradientPicker-ctrlPt'></div>");
		this.$elcp = $("<div></div>");
		$(listener.$el).append(this.$elcp);
		var opts = {};
		opts.cbColorChanged = function(color) {
			self.color = color;
			self.listener.updatePreview();
		};
		opts.cbRemove = function() {
			self.listener.removeControlPoint(self);
			self.listener.updatePreview();
		};
		opts.showRemove = true;
		this.$cp = $.yamcolors(this.$elcp,this.$el.get(0), opts);

		$parentEl.append(this.$el);
		this.$parentEl = $parentEl;
		// this.configView = ctrlPtConfig;

		if (typeof initialState === "string") {
			initialState = initialState.split(" ");
			this.position = parseFloat(initialState[1])/100;
			this.color = initialState[0];
		} else {
			this.position = initialState.position;
			this.color = initialState.color;
		}

		this.listener = listener;
		this.outerWidth = this.$el.outerWidth();

		this.$el.css("background-color", this.color);
		if (orientation == "horizontal") {
			// var pxLeft = pickerWidth*this.position;
			var pw = $parentEl.width();
			var pxLeft = (pw - this.$el.outerWidth()) * (this.position);
			this.$el.css("left", pxLeft);
		} else {
			var pxTop = ($parentEl.height() - this.$el.outerHeight()) * (this.position);
			this.$el.css("top", pxTop);
		}
		
		this.drag = bind(this.drag, this);
		this.stop = bind(this.stop, this);
		this.clicked = bind(this.clicked, this);
		this.$el.draggable({
			axis: (orientation == "horizontal") ? "x" : "y",
			drag: this.drag,
			stop: this.stop,
			// containment: bounds
			containment: $parentEl
		});
		this.$el.css("position", 'absolute');
		// this.$el.click(this.clicked);
	}

	ControlPoint.prototype = {
		drag: function(e, ui) {
			// convert position to a %
			var left = ui.position.left;
			this.position = (left / (this.$parentEl.width() - this.outerWidth));
			this.listener.updatePreview();
		},

		stop: function(e, ui) {
			// this.listener.removeControlPointIfNeeded(this);
			this.listener.updatePreview();
			// this.configView.show(this.$el.position(), this.color, this);
		},

		clicked: function(e) {
			return false;
		},

	};

	var methods = {
		init: function(opts) {
			opts = $.extend({
				controlPoints: ["#FFF 0%", "#000 100%"],
				orientation: "horizontal",
				type: "linear",
				fillDirection: "left",
				generateStyles: true,
				change: function() {}
			}, opts);

			this.each(function() {
				var $this = $(this);
				var gradSel = new GradientSelection($this, opts);
				$this.data("gradientPicker-sel", gradSel);
			});
		},
		update_colors: function(opts) {
			var $this = $(this);
			var gradSel = $this.data("gradientPicker-sel");
			if (gradSel !== null) {
				gradSel.updateOptions(opts);
			}
		},
		update: function(opts) {
			this.each(function() {
				var $this = $(this);
				var gradSel = $this.data("gradientPicker-sel");
				if (gradSel !== null) {
					gradSel.updateOptions(opts);
				}
			});
		}
	};

	$.fn.gradientPicker = function(method, opts) {
		if (typeof method === "string" && method !== "init") {
			methods[method].call(this, opts);
		} else {
			opts = method;
			methods.init.call(this, opts);
		}
	};
})( jQuery );