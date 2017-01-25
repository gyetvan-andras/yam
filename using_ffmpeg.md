
#Install ffmpeg on OSX with MacPorts
```
sudo port install ffmpeg +gpl +postproc +lame +theora +libogg +vorbis +nonfree
```
#Extract and Resize frames PNG
```
ffmpeg -i video.avi -vf "fps=1,scale=200:-1" out%d.png
```
#Extract and Resize frames JPG
```
ffmpeg -i video.avi -vf "fps=1,scale=200:-1" -q:v 1 out%d.jpg
```
#Create video from extracted frames
```
ffmpeg -r 10 -start_number 1 -i out%d.png -vcodec mpeg4 video_out.avi
```
#Convert video to WebM format
```
ffmpeg -i input.move -c:v libvpx -crf 10 -b:v 1M -c:a libvorbis output.webm
```
#Convert video to .mp4 (AAC) format
```
ffmpeg -i input.mov -c:v libx264 -preset medium -c:a libfdk_aac -b:a 128k output.mp4
```