Vue.component('templates', {
	template: '#templates-template',
	props: {
		type: {
			type: Number,
			required: true,
		}
	},
	data: function() {
    return {
			templates: [],
			loaded_once:false
		};
	},
	created: function() {
		var self = this;
	},
	ready: function() {
		var self = this;
		if(!self.loaded_once) {
			self.fetchData();
			self.loaded_once = true;
		}
	},
	methods: {
		fetchData: function() {
	    	var self = this;
	    	var url = "api/templates/"+self.type;
        	yamGet(url,function(data) {
				console.log(url+" - SUCCESS");
				self.templates = data;
			})
			.fail(function() {
				console.log(url+" - FAIL");
			});
	  	},
	  	addTemplate: function(template) {
	  		this.$root.addTemplateToStage(template);
	  	}
	}
});

PECore.prototype.addTemplateToStage = function(template) {
	'use strict';
	var self = this;
	var tmpl = JSON.parse(template.content);
	PECore.spritesToApplyPreset = [];
  	PECore.textFxsToUpdate = [];

  	this.JSON2object(tmpl,null,function(o) {
		function resetObject(oo) {
			oo.node_id = undefined;
			// oo.node_name = null;
			if(oo.presetMode) oo.presetMode = "original";
		    for (var i = 0, j = oo.children.length; i < j; ++i) {
		    	resetObject(oo.children[i]);
		    }
		}
		resetObject(o);
		function applyPreset(sprite) {
			if(sprite) {
				self.applyPresetToSprite(sprite.presetMode,null,sprite, function() {
					applyPreset(PECore.spritesToApplyPreset.pop());
				});
			}
		}
		applyPreset(PECore.spritesToApplyPreset.pop());
		var parent = null;
		if(self.activeTarget) {
			parent = self.activeTarget;
		} else {
			parent = self.objectLayer;
			o.position.x = self.yamProperties.frameWidth/2;
			o.position.y = self.yamProperties.frameHeight/2;
		}

		parent.addChild(o);

		function addToTree(p, child) {
			self.addChildNodeTo(p,child);
		    for (var i = 0, j = child.children.length; i < j; ++i) {
		    	addToTree(child,child.children[i]);
		    }
		}
		addToTree(parent,o);
		self.manualRefresh();
	});
	// console.log("ADD TEMPLATE ");
	// console.dir(template);
};