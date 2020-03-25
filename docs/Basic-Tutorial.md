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

### 4. Menu, Submenu SVG icon setting

In the image below, the red and blue areas are set using the SVG icon.

![svgIcon](https://user-images.githubusercontent.com/35218826/75416627-1ca5e780-5972-11ea-9a55-b179686536de.png)

#### Two ways to set the icon

1. **Use default SVG built** into imageEditor without setting SVG file path (Features added since version v3.9.0).
    * This is the default setting for Image Editor.
    * It's easy to change the color to match the icon state as shown below, but it uses the built-in default shape so you can't change the icon's appearance.
        ```js
        const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
             includeUI: {
                 ...
                 theme: {
                    'menu.normalIcon.color': '#8a8a8a',
                    'menu.activeIcon.color': '#555555',
                    'menu.disabledIcon.color': '#434343',
                    'menu.hoverIcon.color': '#e9e9e9',
                    'submenu.normalIcon.color': '#8a8a8a',
                    'submenu.activeIcon.color': '#e9e9e9',
                 }
                 ...
        });
        ```

2. There is a way to use the **your SVG file** and **set the file location manually**.
    * This is used when you want to completely reconfigure the SVG icon itself rather than the built-in icon.
    * The disadvantage is that the color must be set by modifying the SVG file directly.
    * Need to set the path and name for each icon state as shown below.
        ```js
        const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
             includeUI: {
                 ...
                 theme: {
                    'menu.normalIcon.path': '../dist/svg/icon-d.svg',
                    'menu.normalIcon.name': 'icon-d',
                    'menu.activeIcon.path': '../dist/svg/icon-b.svg',
                    'menu.activeIcon.name': 'icon-b',
                    'menu.disabledIcon.path': '../dist/svg/icon-a.svg',
                    'menu.disabledIcon.name': 'icon-a',
                    'menu.hoverIcon.path': '../dist/svg/icon-c.svg',
                    'menu.hoverIcon.name': 'icon-c',
                    'submenu.normalIcon.path': '../dist/svg/icon-a.svg',
                    'submenu.normalIcon.name': 'icon-a',
                    'submenu.activeIcon.path': '../dist/svg/icon-c.svg',
                    'submenu.activeIcon.name': 'icon-c'
                 }
                 ...
        });
        ```
    * How to get SVG file sample
        * In the project folder where `tui-image-editor` is installed, the file is in the path described below
        ```bash
        // or use cdn (https://uicdn.toast.com/tui-image-editor/latest/svg/icon-a.svg)
        $ cd node_modules/tui-image-editor/dist/svg
        ```
        * Or just get the file via cdn.
            * https://uicdn.toast.com/tui-image-editor/latest/svg/icon-a.svg
            * https://uicdn.toast.com/tui-image-editor/latest/svg/icon-b.svg
            * https://uicdn.toast.com/tui-image-editor/latest/svg/icon-c.svg
            * https://uicdn.toast.com/tui-image-editor/latest/svg/icon-d.svg
        

        * Don't forget to use the icon name setting of the `includeUI.theme` option to match the $ {iconName} part of the file.
        ```svg
        icon-a.svg file
        submenu.activeIcon.name <-> iconName
        ...
        <symbol id="${iconName}-ic-apply" viewBox="0 0 24 24">
            <g fill="none" fill-rule="evenodd">
                <path d="M0 0h24v24H0z"/>
                <path stroke="#434343" d="M4 12.011l5 5L20.011 6"/>
            </g>
        </symbol>
        ...
        ```


### 5. Localization
ImageEditor provide feature to customize all of inscriptions. Look at example.

```js
var locale_ru_RU = { // override default English locale to your custom
    'Crop': 'Обзрезать', // as result default English inscription will be translated into Russian
    'Delete-all': 'Удалить всё'
    // etc...
};
// Image editor
const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
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
