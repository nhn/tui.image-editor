'use strict';

var View = require('../interface/view'),
    commands = require('../consts').commands;

var template = require('../../template/uploadForm.hbs');

var uploadForm = tui.util.defineClass(View, {
    init: function(parent, uploaderOption) {
        View.call(this, parent);
        this.uploaderOption = uploaderOption;
        this.uploader = null;
    },

    /**
     * upload form name
     */
    name: 'uploadForm',

    /**
     * Template function
     * @type {function}
     */
    template: template,

    /**
     * Template context
     * @type {object}
     */
    templateContext: {
        name: 'uploadForm'
    },

    /**
     * Process after render
     *  - Set upload success event to load image from url
     */
    doAfterRender: function() {
        this.uploader = new tui.component.Uploader(
            this.uploaderOption,
            this.getElement()
        );

        this.uploader.on('success', function(result) {
            var imgFileInfo = result.filelist[0];
            this.postCommand({
                name: commands.LOAD_IMAGE_FROM_URL,
                args: [imgFileInfo.path, imgFileInfo.name]
            });
        }, this);
    }
});

module.exports = uploadForm;
