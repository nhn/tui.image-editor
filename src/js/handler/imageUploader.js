'use strict';
var Component = require('../interface/component');

var ImageUploader = tui.util.defineClass(Component, {
    init: function(parent) {
        this.setParent(parent);
    }
});

module.exports = ImageUploader;
