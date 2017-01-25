Vue.component('text-properties', {
	template: '#text-properties-template',
	props: {
			pm: {
				type: Object,
				required: true,
			}
	},
	ready: function() {

		var thiz = this;
		$("#cp_txt_color_fill_solid").yamcolors_wo("#txt_color_fill_solid",{cbColorChanged:function(color) {
			thiz.pm.fillColor = color;
		}});
		$("#cp_txt_color_outline").yamcolors_wo("#txt_color_outline",{cbColorChanged:function(color) {
			thiz.pm.outlineColor = color;
		}});
		$("#cp_txt_color_shadow").yamcolors_wo("#txt_color_shadow",{cbColorChanged:function(color) {
			thiz.pm.dropShadowColor = color;
		}});
		$('#gp_txt_gradient').gradientPicker({
			change: function(points, gradientColors) {
			    'use strict';
			    if(thiz.pm.assignedObject) {
					var style = thiz.pm.assignedObject.style;
					style.gradientColors = gradientColors;
					thiz.pm.assignedObject.style = style;
				}
			},
			// controlPoints: ['#ffffff 0%','#000000 100%']
		});
	},
	methods: {
		editTextFont: function() {
			this.$root.editTextFont();
		},
		align: function(algn) {
			if(this.pm.assignedObject) {
				this.pm.align(algn);
			}
		}
	}
});
