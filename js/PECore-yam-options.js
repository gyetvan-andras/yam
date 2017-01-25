Vue.component('yamoptions', {
	template: '#options-template',
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true    
		},
		opt: {
			type: Object,
			required: true,
			twoWay: true    
		}
	},
	data: function() {
	    return {
	    	sizes: [
				// {class: "", title:"240p", w:240, h:100},
				{class: "", title:"360p", w:480, h:360},
				{class: "", title:"480p", w:858, h:480},
				{class: "", title:"720p", w:1280, h:720},
				// {class: "divider", title:""},
				{class: "", title:"1080p", w:1920, h:1080},
				// {class: "", title:"1440p", w:240, h:100},
				// {class: "", title:"2160p", w:240, h:100},
				{class: "divider", title:""},
				{class: "", title:"Google+ Cover", w:1080, h:608},
				{class: "", title:"Google+ Profile", w:250, h:250},	
				{class: "dropdown-submenu", title:"Google Ads", items: [
					{class: "", title:"Medium Rectangle", w:300, h:255},
					{class: "", title:"Large Rectangle", w:336, h:280},
					{class: "", title:"Leaderboard", w:729, h:90},
					{class: "", title:"Half Page", w:300, h:600},
					{class: "", title:"Large Mobile Banner", w:320, h:100}
				] },
				{class: "divider", title:""},
				{class: "", title:"Facebook Cover", w:851, h:315},
				{class: "", title:"Facebook Profile", w:180, h:180},
				{class: "divider", title:""},
				{class: "", title:"Twitter Header", w:1500, h:500},
				{class: "", title:"Twitter Profile", w:400, h:400},
				{class: "", title:"Tweeted Image", w:1024, h:1024},
				{class: "divider", title:""},
				{class: "", title:"Instagram Profile", w:180, h:180},
				{class: "", title:"Instagram Photo", w:1080, h:1080},
				{class: "divider", title:""},
				{class: "", title:"Custom", w:240, h:100}
	    	],
	    	selectedSize: null
		};
	},
	created: function() {
		var self = this;
		this.selectedSize = this.sizes[this.sizes.length - 1];
		this.$watch('show', function () {
  			self.$root.modalOpen = self.show;
		});
	},
	ready: function() {
		var self = this;
	},
	methods: {
		setSelectedSize: function(idx,subs) {
			if(subs) {
				this.selectedSize = subs.items[idx];
			} else {
				this.selectedSize = this.sizes[idx];
			}
			// this.selectedSize = this.sizes[idx];
			this.opt.frameWidth = this.selectedSize.w;
			this.opt.frameHeight = this.selectedSize.h;
		}
	}
});
