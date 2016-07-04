/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add icon module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var defaultOptions = {
    borderColor: 'red',
    cornerColor: 'green',
    cornerSize: 10,
    transparentCorners: false,
    scaleX: 3,
    scaleY: 3,
    originX: 'center',
    originY: 'center'
};
var arrowIconOptions = {
    head: {
        width: 40,
        height: 20,
        left: 60,
        top: -10,
        angle: 90
    },
    body: {
        width: 40,
        height: 20,
        left: 0,
        top: 0
    }
};
var cancelIconOptions = {
    leftBar: {
        width: 10,
        height: 50,
        angle: 45,
        originX: 'center',
        originY: 'center'
    },
    rightBar: {
        width: 10,
        height: 50,
        angle: -45,
        originX: 'center',
        originY: 'center'
    }
};
var renderIconFuctionMap = {
    arrow: '_createArrowIcon',
    cancel: '_createCancelIcon'
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
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.ICON,

    /**
     * Add icon
     * @param {string} type - Icon type
     * @param {number} [angle] - Icon render angle
     */
    add: function(type, angle) {
        var canvas = this.getCanvas();
        var centerPos = this.getCanvasImage().getCenterPoint();
        var icon = this[renderIconFuctionMap[type]]();

        icon.set(tui.util.extend(defaultOptions, {
            angle: angle || 0,
            fill: this._oColor,
            left: centerPos.x,
            top: centerPos.y
        }));

        canvas.add(icon).setActiveObject(icon);
    },

    /**
     * Set current icon color
     * @param {string} color - Selected color
     */
    setColor: function(color) {
        this._oColor = color;
    },

    /**
     * Create arrow shape icon
     * @returns {fabric.Group} Grouping object
     */
    _createArrowIcon: function() {
        var head = new fabric.Triangle(arrowIconOptions.head);
        var body = new fabric.Rect(arrowIconOptions.body);

        return new fabric.Group([head, body]);
    },

    /**
     * Create cancel mark icon
     * @returns {fabric.Group} Grouping object
     */
    _createCancelIcon: function() {
        var leftBar = new fabric.Rect(cancelIconOptions.leftBar);
        var rightBar = new fabric.Rect(cancelIconOptions.rightBar);

        return new fabric.Group([leftBar, rightBar]);
    }
});

module.exports = Icon;
