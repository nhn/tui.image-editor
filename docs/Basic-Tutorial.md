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

## More..

See the API page and the sample page
* API: http://nhnent.github.io/tui.image-editor/latest/
* Sample: http://nhnent.github.io/tui.image-editor/latest/tutorial-example03-theme.html
