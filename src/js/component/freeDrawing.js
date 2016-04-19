/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Free drawing module, Set brush
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * FreeDrawing
 * @class FreeDrawing
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var FreeDrawing = tui.util.defineClass(Component, /** @lends FreeDrawing.prototype */{
    init: function(parent) {
        this.setParent(parent);
        this.onAddDrawing = $.proxy(this.onAddDrawing, this);
    },

    name: consts.componentNames.FREE_DRAWING,

    start: function() {
        var canvas = this.getCanvas();
        var brush;

        canvas.isDrawingMode = true;
        brush = canvas.freeDrawingBrush;
        brush.width = 10;
        brush.color = 'rgba(0, 0, 0, 0.5)';

        //@todo: Move to imageEditor class
        canvas.on('path:created', this.onAddDrawing);
    },

    //@todo: Move to imageEditor class
    onAddDrawing: function(obj) {
        var path = obj.path;

        path.set({
            rotatingPointOffset: 30,
            borderColor: 'red',
            transparentCorners: false,
            cornerColor: 'green',
            cornerSize: 6
        });
    },

    end: function() {
        var canvas = this.getCanvas();

        //@todo: Move to imageEditor class
        canvas.off('path:created', this.onAddDrawing);
        canvas.isDrawingMode = false;
    }
});

module.exports = FreeDrawing;
