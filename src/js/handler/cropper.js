'use strict';
var Component = require('../interface/component'),
    Cropzone = require('../extension/cropzone'),
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
        var canvas = this.getCanvas(),
            cropZone = new Cropzone({
                left: 10,
                top: 10,
                fill: 'transparent',
                width: 100,
                height: 100,
                hasBorders: false,
                hasRotatingPoint: false,
                cornerColor: 'black',
                cornerSize: 10
            });
        canvas.add(cropZone);
        canvas.setActiveObject(canvas.item(0));
    }
});

module.exports = Cropper;
