Vue.component('background-properties', {
	template: '#background-properties-template',
	props: {
			pm: {
				type: Object,
				required: true,
			}
	},
	created: function() {
		var thiz = this;
	},
	ready: function() {
		// $('a.show-pop-dropdown').webuiPopover('destroy').webuiPopover({padding:true});

		var thiz = this;
	    var ul = $('#upload ul');
	    var socket = io();

	    $('#drop a').click(function(){
	        // Simulate a click on the file input button
	        // to show the file browser dialog
	        $(this).parent().find('input').click();
	    });

	    // Initialize the jQuery File Upload plugin
	    $('#upload').fileupload({
	    	url: createCRUDRequest("/api/uploads"),
	        // This element will accept file drag/drop uploading
	        dropZone: $('#drop'),
	        timeout: 60*10*1000,
			// multipart: false,
			maxChunkSize: 512*1024,
			formData: function (form,options) {
				var slot = options.files[0].slot;
				// console.dir(options);
				var ret = form.serializeArray();
				// console.log("FormData");

				ret.push({name: "slot", value: slot});
				// console.dir(ret);
				return ret;
			},
           	// This function is called when a file is added to the queue;
	        // either via the browse button, or via drag/drop:
	        add: function (e, data) {
	        	console.log("ADD");
				var self = this;
	        	var file = data.files[0];
	        	var dta = data;
	        	// yamGet = function(url,cb,qry_params) {
	        	yamGet("api/uploads/newslot",function(slot) {
					// console.dir(data);
		        	file.slot = slot.slot;
		        	if(file.type.startsWith('video') || file.type.startsWith('image')) {
			        	var uid = 'u_'+Date.now();
			        	dta.li_uid = uid;
			            var tpl = $('<li id="'+uid+'" class="working"><input type="text" value="0" data-width="48" data-height="48"'+
			                ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');

			            // Append the file name and file size
			            tpl.find('p').text(file.name)
			                         .append('<i>' + formatFileSize(file.size) + '</i>');

			            // Add the HTML to the UL element
			            dta.context = tpl.appendTo(ul);

			            // Initialize the knob plugin
			            tpl.find('input').knob();

			            // Listen for clicks on the cancel icon
			            tpl.find('span').click(function(){

			                if(tpl.hasClass('working')){
			                    jqXHR.abort();
			                }

			                tpl.fadeOut(function(){
			                    tpl.remove();
			                });

			            });

			            // Automatically upload the file once it is added to the queue
			            var jqXHR = dta.submit();
		        	}
	        	}, {filename:file.name,type:file.type});
	        },

	        progress: function(e, data){
	            // Calculate the completion percentage of the upload
	            var progress = parseInt(data.loaded / data.total * 100, 10);

	            // Update the hidden input field and trigger a change
	            // so that the jQuery knob plugin knows to update the dial
	            data.context.find('input').val(progress).change();

	            if(progress == 100){
	                data.context.removeClass('working');
	            }
	        },

	        fail:function(e, data){
	            // Something has gone wrong!
	            console.dir(e);
	            console.dir(data);
	            data.context.find('input').val(0).change();
	            data.context.addClass('error');
	        },
	        done: function (e, data) {
				var file = data.files[0];
				yamGet("api/uploads/process/"+file.slot,function(result) {
	        	// $.get( "api/uploads/process/"+file.slot+"?token=secret", function(result) {
		        	socket.on(result,function(msg) {
		        		thiz.pm.upgradeProgress(result,msg);
		        	});
		        	var itemkind = BG_ITEM_KIND.IMAGE;
		        	if(file.type.startsWith('video')) {
		        		itemkind = BG_ITEM_KIND.VIDEO;
		        	}

		        	thiz.addBackgroundItem(result,itemkind);
					var tpl = $('#'+data.li_uid);
					tpl.fadeOut(function(){
						tpl.remove();
					});
				})
				.fail(function() {
				});
	        },
	    });


	    // Prevent the default action when a file is dropped on the window
	    $(document).on('drop dragover', function (e) {
	        e.preventDefault();
	    });

	    // Helper function that formats the file sizes
	    function formatFileSize(bytes) {
	        if (typeof bytes !== 'number') {
	            return '';
	        }

	        if (bytes >= 1000000000) {
	            return (bytes / 1000000000).toFixed(2) + ' GB';
	        }

	        if (bytes >= 1000000) {
	            return (bytes / 1000000).toFixed(2) + ' MB';
	        }

	        return (bytes / 1000).toFixed(2) + ' KB';
	    }
	},
	methods: {
		addSeparator: function() {
			this.pm.addSeparator();
		},
		addBackgroundItem: function(url,itemkind) {
			this.pm.addBackgroundItem(url,itemkind);
		},
		removeBackgroundItem: function(index) {
			this.pm.removeBackgroundItem(index);
		},
		moveBackgroundItemUp: function(index) {
			this.pm.moveBackgroundItemUp(index);
		},
		moveBackgroundItemDown: function(index) {
			this.pm.moveBackgroundItemDown(index);
		},
		editVideo: function(index) {
			// isVideoEditorVisible
			this.$root.selectedBackgroundItem = this.pm.backgroundItems[index];
			this.$root.isVideoEditorVisible = true;
		}
	},
});
