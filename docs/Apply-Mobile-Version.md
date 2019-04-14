# How to apply the mobile version.

## Image editor How to apply a mobile device

- Some settings are required to use Image Editor components on mobile devices.
- Please refer to the [sample page](http://nhn.github.io/tui.image-editor/latest/tutorial-example03-mobile.html) first to check the UI configuration and operation.
 
#### Step 1. Include the dependency file on the page. (PC version same)

```html
<script src="libs/code-snippet.min.js"></script>
<script src="libs/jquery.min.js"></script>
<script src="libs/fabric.min.js"></script>
<script src="js/image-editor.js"></script>
```

#### Step 2. `body` Add markup to the tag to create an image editor. (PC version same)

```html
<div class="tui-image-editor">
    <canvas></canvas>
</div>
```

#### Step 3. `head` Add a meta tag for setting the viewport to the tag.

```html
<meta name="viewport" content="width=device-width, user-scalable=no">
```

#### Step 4. Create an image editor by setting option values for mobile device optimization.

```js
// Create image editor
var imageEditor = new tui.component.ImageEditor('.tui-image-editor canvas', {
    cssMaxWidth: document.documentElement.clientWidth,
    cssMaxHeight: document.documentElement.clientHeight,
    selectionStyle: {
        cornerSize: 50,
        rotatingPointOffset: 100
    }
});
```

- `cssMaxWidth`, `cssMaxHeight` :
  * Sets maximum `width` and` height` values in the canvas area.
  * Do not set it to a fixed value like the PC version because the value changes depending on the mobile device to be connected.
- `selectionStyle` :
  * Selection style setting options that are displayed when an object such as an icon, text, etc. is selected.
  * If the corner size is small, it is difficult to resize and rotate, so set the selection style.
  * The selection style options are the same as those provided by `fabric.js` and can be set with the following option values: ([Reference](http://fabricjs.com/customization))
  
```js
var options = {
    //...
    selectionStyle: {
        borderColor: 'red', // Selection line color
        cornerColor: 'green', // Selection corner color
        cornerSize: 6, // Selection corner size
        rotatingPointOffset: 100, // Distance from selection area to rotation corner
        transparentCorners: false // Selection corner Transparency
    }
};
```
![2016-08-18 4 52 29](https://cloud.githubusercontent.com/assets/18183560/17766120/86f7c3fc-6564-11e6-86d7-554e8e946843.png)


#### Step 5. Add a CSS file and markup for UI configuration. (PC version same)

```html
<link type="text/css" href="css/service-mobile.css" rel="stylesheet">
```
>
The CSS file is used on the sample page and should only refer to the UI configuration,
It is recommended to customize image, CSS, and markup files when applying the service.


#### Step 6. Apply the image editor API to the UI

- API : [http://nhn.github.io/tui.image-editor/latest/](http://nhn.github.io/tui.image-editor/latest/)
- Sample Page : [http://nhn.github.io/tui.image-editor/latest/tutorial-example03-mobile.html](http://nhn.github.io/tui.image-editor/latest/tutorial-example01-includeUi.html)

![all_feature_small](https://cloud.githubusercontent.com/assets/18183560/17803706/034ea17c-6633-11e6-914d-6602d12888f9.gif)
![text_feature_small](https://cloud.githubusercontent.com/assets/18183560/17803707/03530636-6633-11e6-8c03-cd5523716b9b.gif)

