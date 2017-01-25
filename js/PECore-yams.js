Vue.component('yamlist', {
	template: '#yamlist-template',
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true    
		},
		yams: []
	},
	created: function() {
		var thiz = this;
		this.$watch('show', function () {
  			if(thiz.show) thiz.fetchData();
  			thiz.$root.modalOpen = thiz.show;
		});
	},
	methods: {
		fetchData: function() {
	    var thiz = this;
	    	yamGet("api/yams",function(data) {
			// $.get( "api/yams?token=secret", function(data) {
				console.log('api/yams - SUCCESS');
				thiz.yams = data;
			})
			.fail(function() {
				console.log('api/yams - FAIL');
			});
	  	},
	  	loadYam: function(id) {
			var thiz = this;
			yamGet("api/yams/"+id,function(data) {
			// $.get( "api/yams/"+id+"?token=secret", function(data) {
				console.log('api/yams - SUCCESS');
		  		thiz.$root.loadYam(data);
		  		thiz.show = false;
			})
			.fail(function() {
				console.log('api/yams/'+id+' - FAIL');
			});
	  	}
	}
});

Vue.component('yamcreator', {
	template: '#new-yam-template',
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true    
		},
	},
	created: function() {
		var thiz = this;
		this.$watch('show', function () {
  			thiz.$root.modalOpen = thiz.show;
		});
	},
});

PECore.prototype.createNewYam = function() {
	// body...
};

