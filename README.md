# DynamicWallpaperUtil

Using the current location to calculate the solar position to change wallpaper dynamically like macOS. Compatible with Wallpaper Engine.
<br>
Here is core files only.
<br>
Add the "background" folder, put images and timetable in background folder to set wallpaper.

## How to export macOS wallpaper
### Find system wallpaper 
#### at:
    /System/Library/Desktop Pictures
Export the images to png files.<br>
Name as the secquence in HEIC file from 1.png to n.png.

### Export the time rule:
Open HEIC image with Xcode <br>
Press Shift + commad + J <br>
Right click the image from left and select open as Hex <br>
Find keyword "solar" in Hex <br>
#### You should see something like this:
    apple_desktop:solar="..."/> </rdf:RDF> </x:xmpmeta>
Save the context in ... to any text file
#### Open terminal decode the base64 by:
    base64 -D [file] -o [file.plist]
#### Transfer plist to XML:
    plutil -convert xml1 [file.plist]
#### Convert XML to JSON as format below:
    {
      "dict": [
        {
          "a": "10",
          "i": "0",
          "z": "100"
        },
        ...
        {
          "a": "-25",
          "i": "1",
          "z": "290"
        }
      ]
    }
