# Mobile version: image load & save issues

## Load Image

#### Issue
- You can load photos directly from your mobile device into the image editor, but images with too high a resolution are not suitable for use.
- For an action that includes a mouse gesture, such as cropping and drawing in the image editor, the action is determined by the aspect ratio relative to the original image size, so the higher the resolution, the less usable.
- Maximum resolution per device
 * iPhone : `3264 * 2448`
 * Galaxy4 : `4128 * 3096` (High resolution) / `3264 * 2448` (Normal) / `2048 * 1152` (Low resolution)
- The appropriate image size for usability is `3264 * 2448`. If you receive a file upload event when loading an image taken at high resolution on your Android device, do the following.

#### How to handle high-resolution image uploads
```html
<input type="file" accept="image/*" id="input-image-file">
```
```js
var MAX_RESOLUTION = 3264 * 2448;

$('input-image-file').on('change', function(event) {
    var file;
    var img;
    var resolution;

    if (!supportingFileAPI) {
        alert('This browser does not support file-api');
    }

    file = event.target.files[0];

    if (file) {
        img = new Image();

        img.onload = function() {
            resolution = this.width * this.height;

            if (resolution <= MAX_RESOLUTION) {
                imageEditor.loadImageFromFile(file);
            } else {
                alert('Loaded image\'s resolution is too large!\nRecommended resolution is 3264 * 2448!');
            }

            URL.revokeObjectURL(file);
        };

        img.src = URL.createObjectURL(file);
    }
});
```

## Save Image

#### Issue
- Saving an edited image does not appear in the current sample page, but the actual service must send the file to the server to save the image.
- Uses Ajax communication.

#### How to Save a Server Image

Step 1. Import image data to be saved in the image editor.
```js
var dataURL = imageEditor.toDataURL();
```

Step 2. `base64` encoded image data is Ajax communicated and sent to the server.
```js
$.ajax({
    type: 'POST',
    url: serverUrl,
    data: {
       imgBase64: dataURL // Data from Step 1.
    }
}).done(function() {
    console.log('saved!');
});
```

Step 3.  The server processes the received data and stores it.
- [Using Java](https://sangupta.com/tech/saving-html5-canvas-to-java-server.html)
- [Using Php](http://permadi.com/2010/10/html5-saving-canvas-image-data-using-php-and-ajax/)
