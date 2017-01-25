// var fs = require('fs');
// var ytdl = require('ytdl-core');

// function getVideoInfo() {
// 	ytdl.getInfo('http://www.youtube.com/watch?v=Lz1cVnyFzvI',function(err, info) {
// 		if(err) {
// 			console.log(err);
// 		} else {
// 			console.log(JSON.stringify(info,null,2));
// 		}
// 	});
// }

// getVideoInfo();

// var Vue = require('vue');
// var vue = require('vue');
// var VideoEditor = require('../components/VideoEditor.vue');
// Vue.component('videoeditor',VideoEditor);

// Vue.config.debug = true;

// dynamic js loading
// var js = ["scripts/jquery.dimensions.js", "scripts/shadedborder.js", "scripts/jqmodal.js", "scripts/main.js"];
// for (var i = 0, l = js.length; i < l; i++) {
// 	document.getElementsByTagName("head")[0].innerHTML += ("<script src=\"" + js[i] + "\"></scr" + "ipt>");
// }

var yamEditor = new PECore();
yamEditor.initialize();
if(editor_mode === "new") {
	yamEditor.loadSampleData();
}

yamEditor.loadHierarchyTree();
yamEditor.initUX();
yamEditor.manualRefresh();
yamEditor.resizeCanvases();

if(editor_mode === "edit") {
	yamGet("/api/yams/"+yam_id,function(data) {
		console.log('api/yams - SUCCESS');
  		yamEditor.loadYam(data);
	})
	.fail(function() {
		console.log('api/yams/'+yam_id+' - FAIL');
	});
}

// $('[data-toggle="popover"]').popover();
// $('a.show-pop-dropdown').webuiPopover('destroy').webuiPopover({padding:true});
//{padding:0,style:'inverse'});
