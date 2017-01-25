Vue.component('assetlist', {
	template: '#assetlist-template',
	props: {
		// show: {
		// 	type: Boolean,
		// 	required: true,
		// 	twoWay: true    
		// },
		// selectedGroup: 'Groups',
		// groups: [],
		// assets: [],
		// searchText: ''
	},
	data: function() {
    return {
			selectedGroup: 'Groups',
			groups: [],
			assets: [],
			searchText: '',
			loaded_once:false
		};
	},
	created: function() {
		var self = this;
		// this.$watch('show', function () {
  // 			if(self.show) {
  // 				if(!self.loaded_once) {
  // 					self.fetchData();
  // 					self.loaded_once = true;
  // 				}
  // 			}
  // 			self.$root.modalOpen = self.show;
		// });
	},
	ready: function() {
		var self = this;
		if(!self.loaded_once) {
			self.fetchData();
			self.loaded_once = true;
		}
	},
	methods: {
		search: function() {
	    	var self = this;
        	yamGet("api/search_assets/"+self.searchText,function(data) {
			// $.get( "api/search_assets/"+self.searchText+"?token=secret", function(data) {
				console.log("api/search_assets/"+self.searchText+" - SUCCESS");
				self.assets = data;
			})
			.fail(function() {
				console.log("api/search_assets/"+self.searchText+" - FAIL");
			});
		},
		fetchData: function() {
	    	var self = this;
        	yamGet("api/assets",function(data) {
			// $.get( "api/assets?token=secret", function(data) {
				console.log('api/assets - SUCCESS');
				self.groups = data;
				var first = self.groups[0].id;
				self.selectedGroup = self.groups[0].name;
	        	yamGet("api/assets/"+first,function(data) {
				// $.get( "api/assets/"+first+"?token=secret", function(data) {
					self.assets = data;
				})
				.fail(function() {
					console.log("api/assets"+first+" - FAIL");
				});
			})
			.fail(function() {
				console.log('api/assets - FAIL');
			});
	  	},
	  	loadGroup: function(group) {
	    	var self = this;
			self.selectedGroup = group.name;
        	yamGet("api/assets/"+group.id,function(data) {
			// $.get( "api/assets/"+group.id+"?token=secret", function(data) {
				self.assets = data;
			})
			.fail(function() {
				console.log("api/assets"+group+" - FAIL");
			});
	  	},
	  	addAsset: function(asset) {
	  		this.$root.addAssetToStage(asset);
	  		this.show = false;
	  	}
	}
});

PECore.prototype.addAssetToStage = function(asset) {
	'use strict';
	var self = this;
	switch(asset.type) {
		case ASSET_TYPE.IMAGE:
			var sticker_path = asset.url;
			var sticker_texture = PIXI.Texture.fromImage(sticker_path);//resources.svg.data);
			sticker_texture.on('update', function() {
				self.manualRefresh();
			});
			var sticker = self.createSprite(sticker_texture,sticker_path);
			if(self.activeTarget) {
				sticker.position.x = 0;
				sticker.position.y = 0;
				self.activeTarget.addChild(sticker);
				self.addChildNodeTo(self.activeTarget,sticker);
			} else {
				self.objectLayer.addChild(sticker);
				self.addChildNodeTo(self.objectLayer,sticker);
				// sticker.mask = self.mask;
			}
			break;
		case ASSET_TYPE.SOUND:
			break;
		case ASSET_TYPE.PARTICLE:
			break;
		case ASSET_TYPE.ANIMATION:
			break;
		case ASSET_TYPE.VIDEO:
			break;
		case ASSET_TYPE.BIT:
			break;
	}
	self.manualRefresh();
};