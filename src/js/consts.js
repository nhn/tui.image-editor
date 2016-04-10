'use strict';

var CLASSNAME_PREFIX = 'tui-image-editor';
var viewNames = {
    MAIN: 'main',
    MENU: 'menu',
    SUB_MENU: 'subMenu',
    CANVAS: 'canvas'
};

module.exports = {
    CLASSNAME_PREFIX: CLASSNAME_PREFIX,

    viewNames: viewNames,

    viewClassNames: (function() {
        var classNames = {};
        tui.util.forEach(viewNames, function(value, key) {
            classNames[key] = CLASSNAME_PREFIX + '-' + value;
        });

        return classNames;
    })(),

    componentNames: {
        MAIN: 'main',
        IMAGE_LOADER: 'imageLoader',
        CROPPER: 'cropper'
    },

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};
