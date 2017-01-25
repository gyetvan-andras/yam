Vue.component('image-properties', {
	template: '#image-properties-template',
	props: {
			pm: {
				type: Object,
				required: true,
			}
	},
	data: function() {
		return {
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
		};
	},
	methods: {
		editTexture: function() {
			this.$root.editTexture();
		},
		applyPreset: function(preset) {
			this.pm.presetMode = preset;
		}

	},
	created: function() {
		var thiz = this;
		thiz.$watch('pm.presetMode', function (newVal, oldVal) {
			if(newVal === oldVal) return;
			thiz.$root.applyPresetToSprite(newVal);
			// thiz.$log('pm.presetMode');
		});
	},
	ready: function() {

		var thiz = this;
		$("#cp_img_color_tint").yamcolors_wo("#img_color_tint",{cbColorChanged:function(color) {
			thiz.pm.tintColor = color;
		}});
	}
});
