Vue.component('shape-properties', {
	template: '#shape-properties-template',
	props: {
			pm: {
				type: Object,
				required: true,
			}
	},
	ready: function() {

		var thiz = this;
		$("#cp_shp_color_fill_solid").yamcolors_wo("#shp_color_fill_solid",{cbColorChanged:function(color) {
			thiz.pm.fillColor = color;
		}});
		$("#cp_shp_color_outline").yamcolors_wo("#shp_color_outline",{cbColorChanged:function(color) {
			thiz.pm.outlineColor = color;
		}});
		$("#cp_shp_color_shadow").yamcolors_wo("#shp_color_shadow",{cbColorChanged:function(color) {
			thiz.pm.dropShadowColor = color;
		}});
		$('#gp_shp_gradient').gradientPicker({
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
});
