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
    },

    name: consts.componentNames.FREE_DRAWING,

    start: function() {
        this.getCanvas().isDrawingMode = true;
    },

    onAddDrawing: function() {

    },

    end: function() {
        this.getCanvas().isDrawingMode = false;
    }
});

module.exports = FreeDrawing;
