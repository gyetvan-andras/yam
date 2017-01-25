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
6. embedding: when an animation is published then it can be embedded to any other web page. 

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

1. checkout **editor_ux_reorg** branch from the repo
2. cd ./yam/yam_editor
3. mkdir uploads; mkdir published; mkdir yam_templates
4. node server/init_yam_db.js
5. node server.js

