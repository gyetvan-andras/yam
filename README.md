# yam
A proof of concept HTML5 Animation editor. 

# WARNING :)
Be aware that this repo contains some large test data, for example a test mp4 and some image. You've been warned :D

## Description
YAM is a browser based animation editor with support for video and key frame based animations, implemented in HTML5 and JavaScript. YAM is Yet (another) Animation Manager.

Using YAM the user is able to create animations, then include them in any web page, including mobile web.

The editor contains the following features:

1. video background: it is possible to add video files as background, there is a built in editor to select snippets from a video file. 
2. image editor: user is able to resize/rotate/crop images. Also there are several filter effects to apply.
3. text effects: the editor includes a text effect editor to add special fill, outline and shadow effects (gradient and cut-out modes) to and there is a wide variety of font faces including Chinese, Japanese and Hieroglyphic fonts.
4. key frame based animation: the editor supports key frame based animation editing. Any item (image, shape, text) can be moved, scaled, rotated. There are options to tint and fade items too. The animation timing can be controlled by tweens.
5. shapes: basic shapes can be added to the animation, including: line, triangle, rectangle and circle. Similarly to the text effects, shapes can have special fill, outline and drop shadow properties.
6. embedding: when an animation is published, then it can be embedded to any other web page. Embedding should look like the following snippets:
```html
<div style="width:100%; height:550px;">
	<iframe width="100%" height="100%" frameborder="0" src="player/17c668ab-2a7c-412e-9d7f-0c707f0ef61e"></iframe>
</div>
```
##Showcase
[https://img.youtube.com/vi/50dGjxvQiRU/0.jpg](https://www.youtube.com/watch?v=50dGjxvQiRU)
[https://img.youtube.com/vi/jOHqsurtkvo/0.jpg](https://www.youtube.com/watch?v=jOHqsurtkvo)
[https://img.youtube.com/vi/3S2YGOT7id8/0.jpg](https://www.youtube.com/watch?v=3S2YGOT7id8)

<p align="center">
	<img src="doc/sample.png" alt="Sample">
	<p align="center">
		<em>MLCalendarView in NSPopover</em>
	</p>
</p>

<p align="center">
[<img src="https://img.youtube.com/vi/50dGjxvQiRU/0.jpg"](https://www.youtube.com/watch?v=50dGjxvQiRU)
	<p align="center">
		<em>(Image Editor)</em>
	</p>
</p>

<p align="center">
[<img src="https://img.youtube.com/vi/jOHqsurtkvo/0.jpg"](https://www.youtube.com/watch?v=jOHqsurtkvo)
	<p align="center">
		<em>(TextFx)</em>
	</p>
</p>

<p align="center">
[<img src="https://img.youtube.com/vi/3S2YGOT7id8/0.jpg"](https://www.youtube.com/watch?v=3S2YGOT7id8)
	<p align="center">
		<em>(Animation Editor)</em>
	</p>
</p>

## Installation

To process video files YAM Server requires the following tools to operate:
#fonts
##Ubuntu
```
sudo apt-get install fontconfig
```
#ffmpeg
##Ubuntu
```
sudo add-apt-repository ppa:kirillshkrogalev/ffmpeg-next
sudo apt-get update
sudo apt-get install ffmpeg
```
##OSX
```
sudo port install ffmpeg +gpl +postproc +lame +theora +libogg +vorbis +nonfree
```
#GraphicsMagick
##Ubuntu
```
sudo apt-get install graphicsmagick
```
##OSX
```
sudo port install graphicsmagick
```
##Steps needed to deploy a YAM from the scratch

1. checkout the repo
2. cd yam
3. npm i
4. mkdir uploads; mkdir published; mkdir yam_templates
5. node server/init_yam_db.js
6. node server.js

