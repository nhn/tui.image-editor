<template>
    <div>
        <h1>🍞🎨 TOAST UI Image Editor + Vue</h1>
        <div class="imageEditorApp">
            <tui-image-editor ref="tuiImageEditor"
                              :include-ui="useDefaultUI"
                              :options="options"
                              @addText="onAddText"
                              @objectMoved="onObjectMoved">
            </tui-image-editor>
        </div>
    </div>
</template>
<script>
// To use the default UI, the svg files for the icons is required.
import 'tui-image-editor/dist/svg/icon-a.svg';
import 'tui-image-editor/dist/svg/icon-b.svg';
import 'tui-image-editor/dist/svg/icon-c.svg';
import 'tui-image-editor/dist/svg/icon-d.svg';

// Load Style Code
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

import {ImageEditor} from '../src/index';

export default {
    components: {
        'tui-image-editor': ImageEditor
    },
    data() {
        return {
            useDefaultUI: true,
            options: {
                includeUI: {
                    initMenu: 'filter'
                },
                cssMaxWidth: 700,
                cssMaxHeight: 500
            }
        };
    },
    methods: {
        onAddText(res) {
            console.group('addText');
            console.log('Client Position : ', res.clientPosition);
            console.log('Origin Position : ', res.originPosition);
            console.groupEnd();
        },
        onObjectMoved(res) {
            console.group('objectMoved');
            console.log('Left : ', res.left);
            console.log('Top : ', res.top);
            console.groupEnd();
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
