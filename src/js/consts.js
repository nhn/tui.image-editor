'use strict';

module.exports = {
    CLASSNAME_PREFIX: 'tui-image-editor',

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader),

    commands: {
        SET_CANVAS_ELEMENT: 'setCanvasElement',
        SET_CANVAS_IMAGE: 'setCanvasImage',
        LOAD_IMAGE_FROM_URL: 'loadImageFromUrl',
        LOAD_IMAGE_FROM_FILE: 'loadImageFromFile',
        ON_LOAD_IMAGE: 'onLoadImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping'
    }
};
