# Image Editor
Canvas image editor

![image](https://cloud.githubusercontent.com/assets/26706716/26335518/84f041e2-3fa7-11e7-8892-155a95c6d5c3.png)

## Feature
* Load image to canvas
* Undo/Redo (With shortcut)
* Crop
* Flip
* Rotation
* Free Drawing
* Line drawing
* Shape
* Icon
* Text
* Mask Filter
* Image Filter

## Documentation
* API: [http://nhnent.github.io/tui.image-editor/latest/](http://nhnent.github.io/tui.image-editor/latest/)
* Tutorial: [https://github.com/nhnent/tui.image-editor/wiki/Tutorial](https://github.com/nhnent/tui.image-editor/wiki/Tutorial)
* Examples: [http://nhnent.github.io/tui.image-editor/latest/tutorial-example01-basic.html](http://nhnent.github.io/tui.image-editor/latest/tutorial-example01-basic.html)

## Dependency
* [fabric.js: ~1.6.7](https://github.com/kangax/fabric.js/releases/tag/v1.6.7)
* [tui.code-snippet: 1.2.5](https://github.com/nhnent/tui.code-snippet/releases/tag/v1.2.5)

## Tested Browsers
* Browser:
   * IE9 ~ IE11
   * Edge
   * Chrome
   * Firefox
   * Safari
* Mobile test environment
   * iOS 9.3.x
   * Android 4.4.x

## Usage
### Use `npm`

Install the latest version using `npm` command:

```
$ npm install tui-image-editor --save
```

or want to install the each version:

```
$ npm install tui-image-editor@<version> --save
```

To access as module format in your code:

```javascript
var ImageEditor = require('tui-image-editor');
var instance = new ImageEditor('.tui-image-editor', {
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

### Use `bower`
Install the latest version using `bower` command:

```
$ bower install tui-image-editor
```

or want to install the each version:

```
$ bower install tui-image-editor#<tag>
```

To access as namespace format in your code:

```javascript
var imageEditor = new tui.ImageEditor('.tui-image-editor', {
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

### Download
* [Download bundle files from `dist` folder](https://github.com/nhnent/tui.image-editor/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.image-editor/releases)

## License
[MIT LICENSE](https://github.com/nhnent/tui.image-editor/blob/master/LICENSE)
