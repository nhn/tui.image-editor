/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add icon module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var pathMap = {
    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' +
            'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
};

/**
 * Icon
 * @class Icon
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Icon = tui.util.defineClass(Component, /** @lends Icon.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Default icon color
         * @type {string}
         */
        this._oColor = '#000000';

        /**
         * Path value of each icon type
         * @type {object}
         */
        this._pathMap = pathMap;
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.ICON,

    /**
     * Add icon
     * @param {string} type - Icon type
     */
    add: function(type) {
        var canvas = this.getCanvas();
        var centerPos = this.getCanvasImage().getCenterPoint();
        var path = this._pathMap[type];
        var icon;

        if (!path) {
            return;
        }

        icon = this._createIcon(path);

        icon.set(consts.fObjectOptions.SELECTION_STYLE);
        icon.set({
            fill: this._oColor,
            left: centerPos.x,
            top: centerPos.y,
            type: 'icon'
        });

        canvas.add(icon).setActiveObject(icon);
    },

    /**
     * Register icon paths
     * @param {{key: string, value: string}} pathInfos - Path infos
     */
    registerPaths: function(pathInfos) {
        tui.util.forEach(pathInfos, function(path, type) {
            this._pathMap[type] = path;
        }, this);
    },

    /**
     * Set icon object color
     * @param {strign} color - Color to set
     * @param {fabric.Path}[obj] - Current activated path object
     */
    setColor: function(color, obj) {
        this._oColor = color;

        if (obj && obj.get('type') === 'icon') {
            obj.setFill(this._oColor);
            this.getCanvas().renderAll();
        }
    },

    /**
     * Create icon object
     * @param {string} path - Path value to create icon
     * @returns {fabric.Path} Path object
     */
    _createIcon: function(path) {
        return new fabric.Path(path);
    }
});

module.exports = Icon;
