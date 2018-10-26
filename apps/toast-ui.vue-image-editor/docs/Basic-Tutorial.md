## Basic
Follow these 3steps to create Toast UI Image Editor in the Vue.

### 1. Load required files
Load first the dependencies, and then load `toastui-vue-image-editor.js`.
```html
<body>
    ...
    <script src="lib/tui-code-snippet.js"></script>
    <script src="lib/fabric.js"></script>
    <script src="lib/tui-image-editor.js"></script>
    <script src="lib/vue.js"></script>
    <script src="lib/toastui-vue-image-editor.js"></script>
    ...
</body>
```

### 2. HTML Markup
ImageEditor needs a division element to render the vue app.

```html
<div id="app"></div>
```

#### Dependency style code
Insert style sheet into html
```html
<head>
   ...
   <link rel="stylesheet" href="./lib/tui-image-editor.css">
</head>
```

### 3. Javascript
The wrapper element of Toast UI Image Editor must have a height value.
```js
const imageEditor = toastui.ImageEditor;

const app = new Vue({
    el: '#app',
    components: {
        'tui-image-editor': imageEditor
    },
    data: {
        useDefaultUI: false,
        options: {
            cssMaxWidth: 700,
            cssMaxHeight: 500
        }
    },
    methods: {
        selectImage: function(event) {
            const file = event.target.files[0];

            this.$refs.editor.invoke('loadImageFromFile', file);
        },
        cropMode: function() {
            this.$refs.editor.invoke('startDrawingMode', 'CROPPER');
        }

    },
    template: `<div style="width: 1000px;height: 800px">
        <input type="file" accept="image/*" v-on:change="selectImage($event)">
        <button type="button" @click="cropMode()">자르기</button>
        <tui-image-editor ref="editor" :include-ui="useDefaultUI" :options="options">
        </tui-image-editor>
    </div>`
});

app.$refs.editor.invoke('loadImageFromURL', './sampleImage.png', 'My sample image')
.then(() => {
    app.$refs.editor.invoke('resizeCanvasDimension', {
        width: 500,
        height: 400
    });
});
```
- If you want to use the UI Provided by default, you can assign `true` to the `includeUi` prop.
```js
data: {
    useDefaultUI: true,
    ...
},
template: `
    ...
    <tui-image-editor ref="editor" :include-ui="useDefaultUI" :options="options">
    </tui-image-editor>
    ...
```

## SFC(*Single File Component*)
Creates an Image Editor as a single file component of Vue.

#### Setting the Entry File
```js
// index.js
import imageEditorApp from './myImageEditorApp';

new Vue({
    el: '#app',
    render: h => h(imageEditorApp)
});
```

#### Creating Components
```js
// myImageEditorApp.vue
<template>
<div class="imageEditorApp">
    <tui-image-editor ref="tuiImageEditor"
                      :include-ui="useDefaultUI"
                      :options="options"
                      @addText="onAddText"
                      @objectMoved="onObjectMoved">
    </tui-image-editor>
</div>
</template>
<script>
import {ImageEditor} from '@toast-ui/vue-image-editor';

export default {
    components: {
        'tui-image-editor': ImageEditor
    },
    data() {
        return {
            useDefaultUI: true,
            options: {
                includeUI: {
                    loadImage: {
                        path: 'sampleImage.png',
                        name: 'SampleImage'
                    },
                    initMenu: 'filter'
                },
                cssMaxWidth: 700,
                cssMaxHeight: 500
            }
        };
    },
    methods: {
        onAddText(pos) {
            ...
        },
        onObjectMoved(props) {
            ...
        }
    }
};
</script>
<style scoped>
.imageEditorApp {
    width: 1000px;
    height: 800px;
}
</style>
```

#### Insert Style Code
```js
// To use the basic UI, the svg files for the icons is required.
import 'tui-image-editor/dist/svg/icon-a.svg';
import 'tui-image-editor/dist/svg/icon-b.svg';
import 'tui-image-editor/dist/svg/icon-c.svg';
import 'tui-image-editor/dist/svg/icon-d.svg';

// Load Style Code
import 'tui-image-editor/dist/tui-image-editor.css';

import {ImageEditor} from '@toast-ui/vue-image-editor';
```

<br>

## More..

See the API page
* API: http://nhnent.github.io/tui.image-editor/latest/
