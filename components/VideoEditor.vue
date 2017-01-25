<style>
	.yam-video-wrapper {
		background-color: #444444;
		display: table;
		width:100%;
		height:100%;
		text-align:center;
		padding:25px;
	}

	.yam-video-panel {
		margin: auto;
		padding:15px;
		width: 1050px;
		/*height: 400px;*/
		background-color: white;
		border-radius: 5px;
		display: table;
		text-align:center;
		float: center;
	}

	.yam-video-player {
		border: 1px solid #BFBFBF;
		border-radius: 5px;
		background-color: #7F7F7F;
	}

	.yam-video-player-controls {
		font-size: 48px;
	}

	.yam-video-strip-wrapper {
		border: 1px solid #BFBFBF;
		border-radius: 5px;
		background-color: #7F7F7F;
		margin: auto;
		width: 1022px;
		text-align:center;
		padding-top: 20px;
		padding-left: 10px;
		padding-right: 10px;
		padding-bottom: 20px;
		/*display: table;*/
	}

	.yam-video-strip-scroller {
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.yam-video-stat {
		font-size: 24px;
		color: white;
	}

	.yam-video-strip-handlers {
		width: 100%;
		display: table;
		text-align:left;
		position: relative;
	}

	.yam-video-begin {
		position: absolute;
		top: 0px;
		left: 0px;
		font-size: 18px;
	    color:#FF7F00;
	}

	.yam-video-position {
		position: absolute;
		top: -18px;
		left: -9px;
		font-size: 18px;
	    color:#FF7F00;
	}

	.yam-video-end {
		position: absolute;
		top: 0px;
		left: 990px;
		font-size: 18px;
	    color:#FF7F00;
	}	
</style>

<template>
	<div class="modal-mask" v-show="show" transition="modal">
		<div v-cloak class="modal-wrapper">
			<div class="yam-video-panel">
				<video class="yam-video-player" id="vp" preload="auto" width="1022" height="500">
				  <source src="images/test.mp4" type='video/mp4'>
				</video>
				<div class="yam-video-player-controls">
					<i id="play" class="fa fa-play-circle-o"></i>
					<i id="pause" class="fa fa-pause-circle-o"></i>
				</div>
				<div id="strip-wrapper" class="yam-video-strip-wrapper">
					<div class="yam-video-strip-handlers"> 
						<i id="video-pos" class="yam-video-position fa fa-chevron-down"></i>
					</div>
					<div id="strip-scroller" class="yam-video-strip-scroller">
						<img src="images/test-strip.png">
					</div>
					<div id="strip-handlers" class="yam-video-strip-handlers"> 
						<i id="video-begin" class="yam-video-begin fa fa-step-backward"></i>
						<!-- <i id="video-pos" class="yam-video-position fa fa-chevron-down"></i> -->
						<i id="video-end" class="yam-video-end fa fa-step-forward"></i>
					</div>
				</div>
			</div>

			<div>
		 	  <div id='stat' class="yam-video-stat">....</div>
			</div>
		</div>
	</div>
</template>

<script>
	module.exports = {
		replace: true,
		props: {
			show: {
				type: Boolean,
				required: true,
				twoWay: true    
			}
		},
		created: function() {
			var thiz = this;
			this.$watch('show', function () {
				thiz.$root.modalOpen = thiz.show;
			});
		},
		methods: {
		}

	}	
</script>
