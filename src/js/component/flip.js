/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image flip module
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * Flip
 * @class Flip
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Flip = tui.util.defineClass(Component, /** @lends Flip.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.FLIP,

    /**
     * Get current flip settings
     * @returns {{flipX: Boolean, flipY: Boolean}}
     */
    getCurrentSetting: function() {
        var canvasImage = this.getCanvasImage();

        return {
            flipX: canvasImage.flipX,
            flipY: canvasImage.flipY
        };
    },

    /**
     * Set flipX, flipY
     * @param {{flipX: ?Boolean, flipY: ?Boolean}} newSetting - Flip setting
     * @returns {jQuery.Deferred}
     */
    set: function(newSetting) {
        var setting = this.getCurrentSetting();
        var jqDefer = $.Deferred();
        var isChangingFlipX = (setting.flipX !== !!newSetting.flipX);
        var isChangingFlipY = (setting.flipY !== !!newSetting.flipY);
        var angle;

        if (!isChangingFlipX && !isChangingFlipY) {
            return jqDefer.reject();
        }

        if (isChangingFlipX) {
            angle = this._negateAngle();
        }
        if (isChangingFlipY) {
            angle = this._negateAngle();
        }
        tui.util.extend(setting, newSetting);
        this.setImageProperties(setting, true);

        return jqDefer.resolve(setting, angle);
    },

    /**
     * Negate angle for flip
     * @returns {number} Negated angle
     * @private
     */
    _negateAngle: function() {
        var canvasImage = this.getCanvasImage();
        var angle = parseFloat(canvasImage.angle * -1); // parseFloat for -0 to 0

        canvasImage.setAngle(angle);

        return angle;
    },

    /**
     * Reset flip settings
     * @returns {jQuery.Deferred}
     */
    reset: function() {
        return this.set({
            flipX: false,
            flipY: false
        });
    },

    /**
     * Flip x
     * @returns {jQuery.Deferred}
     */
    flipX: function() {
        var angle = this._negateAngle();

        this.toggleImageProperties(['flipX'], true);

        return $.Deferred().resolve(this.getCurrentSetting(), angle);
    },

    /**
     * Flip y
     * @returns {jQuery.Deferred}
     */
    flipY: function() {
        var angle = this._negateAngle();

        this.toggleImageProperties(['flipY'], true);

        return $.Deferred().resolve(this.getCurrentSetting(), angle);
    }
});

module.exports = Flip;
