/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add filter module
 */
'use strict';

var Component = require('../interface/component');
var Mask = require('../extension/mask');
var consts = require('../consts');

/**
 * Filter
 * @class Filter
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Filter = tui.util.defineClass(Component, /** @lends Filter.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.FILTER,

    add: function(type, options) {
        var jqDefer = $.Deferred();
        var filter = this._createFilter(type, options);
        var sourceImg = this._getSourceImage();
        var canvas = this.getCanvas();

        if (!filter) {
            jqDefer.reject();
        }

        sourceImg.filters.push(filter);

        this.apply(function() {
            canvas.renderAll();
            jqDefer.resolve(type, 'add');
        });

        return jqDefer;
    },

    remove: function(type) {
        var jqDefer = $.Deferred();
        var sourceImg = this._getSourceImage();
        var canvas = this.getCanvas();

        if (!sourceImg.filters.length) {
            jqDefer.reject();
        }

        sourceImg.filters.pop();

        this.apply(function() {
            canvas.renderAll();
            jqDefer.resolve(type, 'remove');
        });

        return jqDefer;
    },

    apply: function(callback) {
        this._getSourceImage().applyFilters(callback);
    },

    _getSourceImage: function() {
        return this.getCanvasImage();
    },

    _createFilter: function(type, options) {
        var filterObj;

        switch (type) {
            case 'mask':
                filterObj = new Mask(options);
                break;
            case 'grayscale':
                filterObj = new fabric.Image.filters.Grayscale();
                break;
            default:
                filterObj = null;
        }

        return filterObj;
    }
});

module.exports = Filter;
