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

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};
