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

    /**
     * Add filter to source image (a specific filter is added on fabric.js)
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {jQuery.Deferred}
     */
    add: function(type, options) {
        var jqDefer = $.Deferred();
        var filter = this._createFilter(type, options);
        var sourceImg = this._getSourceImage();
        var canvas = this.getCanvas();

        if (!filter) {
            jqDefer.reject();
        }

        sourceImg.filters.push(filter);

        this._apply(sourceImg, function() {
            canvas.renderAll();
            jqDefer.resolve(type, 'add');
        });

        return jqDefer;
    },

    /**
     * Remove filter to source image
     * @param {string} type - Filter type
     * @returns {jQuery.Deferred}
     */
    remove: function(type) {
        var jqDefer = $.Deferred();
        var sourceImg = this._getSourceImage();
        var canvas = this.getCanvas();

        if (!sourceImg.filters.length) {
            jqDefer.reject();
        }

        sourceImg.filters.pop();

        this._apply(sourceImg, function() {
            canvas.renderAll();
            jqDefer.resolve(type, 'remove');
        });

        return jqDefer;
    },

    /**
     * Apply filter
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {function} callback - Executed function after applying filter
     * @private
     */
    _apply: function(sourceImg, callback) {
        sourceImg.applyFilters(callback);
    },

    /**
     * Get source image on canvas
     * @returns {fabric.Image} Current source image on canvas
     * @private
     */
    _getSourceImage: function() {
        return this.getCanvasImage();
    },

    /**
     * Create filter instance
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {object} Fabric object of filter
     * @private
     */
    _createFilter: function(type, options) {
        var filterObj;

        switch (type) {
            case 'mask':
                filterObj = new Mask(options);
                break;
            case 'removeWhite':
                filterObj = new fabric.Image.filters.RemoveWhite(options);
                break;
            default:
                filterObj = null;
        }

        return filterObj;
    }
});

module.exports = Filter;
