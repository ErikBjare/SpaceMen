Space Men
===================
A space adventure.

# About

Decided to try out the Phaser framework and do a small game with a chat implemented with Websockets. Game uses the Phaser framework, chatserver is written in Go using Websockets.

The performance of canvas was disappointing and since my video drivers don't support WebGL this project will probably be abandoned for now. The background is pretty cool though, and the faked depth will probably be used in a future project.

## Code

Details about code goes here!

## Design

Details about design goes here!

### Space background

The entire background exists in `images/space.xcf`, open it in Gimp and export to pngs on a layer-by-layer basis without the black background.
The top layer (#4) should have few, larger stars. The third layer (#3) should have fewer medium-sized stars. The second layer should have small, and a larger amount of stars. The bottom/first layer should have [billions and billions](http://courseweb.lis.illinois.edu/~wade7/Animation/BILLIONS-FINAL.gif) of stars, small as they are in the far distance.
If anyone comes up with or knows of a formula regarding the size/depth ratio to maximize realism, PLEASE TELL US!
