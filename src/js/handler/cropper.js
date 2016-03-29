'use strict';
var Component = require('../interface/component'),
    commands = require('../consts').commands;

/**
 * Cropper components
 * @extends {Component}
 * @class Cropper
 */
var Cropper = tui.util.defineClass(Component, /* @lends Cropper.prototype */{
    init: function(parent) {
        this.setParent(parent);
        this.registerActions();
    },

    registerActions: function() {
        this.registerAction(commands.ON_CROP_START, this.onCropStart, this);
    },

    onCropStart: function() {
        console.log('crop start');
    }
});

module.exports = Cropper;
