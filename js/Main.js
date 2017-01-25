(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqczYvTWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gdmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbi8vIHZhciB5dGRsID0gcmVxdWlyZSgneXRkbC1jb3JlJyk7XG5cbi8vIGZ1bmN0aW9uIGdldFZpZGVvSW5mbygpIHtcbi8vIFx0eXRkbC5nZXRJbmZvKCdodHRwOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9THoxY1ZueUZ6dkknLGZ1bmN0aW9uKGVyciwgaW5mbykge1xuLy8gXHRcdGlmKGVycikge1xuLy8gXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcbi8vIFx0XHR9IGVsc2Uge1xuLy8gXHRcdFx0Y29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoaW5mbyxudWxsLDIpKTtcbi8vIFx0XHR9XG4vLyBcdH0pO1xuLy8gfVxuXG4vLyBnZXRWaWRlb0luZm8oKTtcblxuLy8gdmFyIFZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xuLy8gdmFyIHZ1ZSA9IHJlcXVpcmUoJ3Z1ZScpO1xuLy8gdmFyIFZpZGVvRWRpdG9yID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9WaWRlb0VkaXRvci52dWUnKTtcbi8vIFZ1ZS5jb21wb25lbnQoJ3ZpZGVvZWRpdG9yJyxWaWRlb0VkaXRvcik7XG5cbi8vIFZ1ZS5jb25maWcuZGVidWcgPSB0cnVlO1xuXG52YXIgeWFtRWRpdG9yID0gbmV3IFBFQ29yZSgpO1xueWFtRWRpdG9yLmluaXRpYWxpemUoKTtcbmlmKGVkaXRvcl9tb2RlID09PSBcIm5ld1wiKSB7XG5cdHlhbUVkaXRvci5sb2FkU2FtcGxlRGF0YSgpO1xufVxuXG55YW1FZGl0b3IubG9hZEhpZXJhcmNoeVRyZWUoKTtcbnlhbUVkaXRvci5pbml0VVgoKTtcbnlhbUVkaXRvci5tYW51YWxSZWZyZXNoKCk7XG55YW1FZGl0b3IucmVzaXplQ2FudmFzZXMoKTtcblxuaWYoZWRpdG9yX21vZGUgPT09IFwiZWRpdFwiKSB7XG5cdHlhbUdldChcIi9hcGkveWFtcy9cIit5YW1faWQsZnVuY3Rpb24oZGF0YSkge1xuXHRcdGNvbnNvbGUubG9nKCdhcGkveWFtcyAtIFNVQ0NFU1MnKTtcbiAgXHRcdHlhbUVkaXRvci5sb2FkWWFtKGRhdGEpO1xuXHR9KVxuXHQuZmFpbChmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnYXBpL3lhbXMvJyt5YW1faWQrJyAtIEZBSUwnKTtcblx0fSk7XG59XG5cbi8vICQoJ1tkYXRhLXRvZ2dsZT1cInBvcG92ZXJcIl0nKS5wb3BvdmVyKCk7XG4vLyAkKCdhLnNob3ctcG9wLWRyb3Bkb3duJykud2VidWlQb3BvdmVyKCdkZXN0cm95Jykud2VidWlQb3BvdmVyKHtwYWRkaW5nOnRydWV9KTtcbi8ve3BhZGRpbmc6MCxzdHlsZTonaW52ZXJzZSd9KTtcbiJdfQ==
