## Basic
Follow these 3steps to create image-editor.

### 1. Load required files
Load first the dependencies, and then load `image-editor.js` or `image-editor.min.js`.
```html
<script src="libs/code-snippet.min.js"></script>
<script src="libs/jquery.min.js"></script>
<script src="libs/fabric.min.js"></script>
<script src="js/image-editor.js"></script>
```

### 2. HTML Markup
ImageEditor needs a division element having a canvas element.<br>
And **the division element must have own (css)height.**
```html
<!-- This division element needs the css height -->
<div id="my-image-editor" style="height: 800px">
    <canvas></canvas>
</div>
```

### 3. Javascript
ImageEditor constructor needs two parameters.
* The canvas element selector
* Css max width & Css max height
  * Set the max width according to the size of your page.
  * The max height should be same the height of the division element (in this example, `#my-image-editor`).
```js
// Create image editor
var imageEditor = new tui.component.ImageEditor('#my-image-editor canvas', {
    cssMaxWidth: 1000, // Component default value: 1000
    cssMaxHeight: 800  // Component default value: 800
});

// Load image
imageEditor.loadImageFromURL('img/sampleImage.jpg', 'My sample image')
```

<br>

### 4. Localization
ImageEditor provide feature to customize all of inscriptions. Look at example.

```js
var locale_ru_RU = { // override default English locale to your custom
    'Crop': 'Обзрезать', // as result default English inscription will be translated into Russian
    'Delete-all': 'Удалить всё'
    // etc...
};
// Image editor
var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
     includeUI: {
         loadImage: {
             path: 'img/sampleImage.jpg',
             name: 'SampleImage'
         },
         locale: locale_ru_RU, // key-value object with localization
         theme: blackTheme, // or whiteTheme
         initMenu: 'filter',
         menuBarPosition: 'bottom'
     },
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```
<br>

Full inscriptions list who can be replaced to custom ones:
* 3:2
* 4:3
* 5:4
* 7:5
* 16:9
* Apply
* Arrow
* Arrow-2
* Arrow-3
* Blend
* Blur
* Bold 
* Brightness
* Bubble
* Cancel
* Center 
* Circle 
* Color
* Color Filter
* Crop
* Custom 
* Custom icon
* Delete
* Delete-all
* Distance
* Download
* Draw
* Emboss
* Fill
* Filter
* Flip
* Flip X
* Flip Y
* Free
* Grayscale
* Heart
* Icon
* Invert
* Italic 
* Left 
* Load
* Load Mask Image 
* Location
* Mask
* Multiply
* Noise
* Pixelate
* Polygon
* Range
* Rectangle 
* Redo
* Remove White
* Reset
* Right 
* Rotate
* Sepia
* Sepia2
* Shape
* Sharpen
* Square 
* Star-1
* Star-2
* Straight
* Stroke
* Text
* Text size
* Threshold
* Tint
* Triangle 
* Underline 
* Undo
* Value

## More..

See the API page and the sample page
* API: http://nhn.github.io/tui.image-editor/latest/
* Sample: http://nhn.github.io/tui.image-editor/latest/tutorial-example01-includeUi.html
