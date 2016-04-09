'use strict';

module.exports = {
    CLASSNAME_PREFIX: 'tui-image-editor',

    viewNames: { // it will be element-classname
        MAIN: 'main',
        MENU: 'menu',
        SUB_MENU: 'subMenu',
        CANVAS: 'canvas'
    },

    componentNames: {
        MAIN: 'main',
        IMAGE_LOADER: 'imageLoader',
        CROPPER: 'cropper'
    },

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_IMAGE: 'clearImage',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};
