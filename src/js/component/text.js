/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Text module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');
var defaultStyles = {
    borderColor: 'red',
    cornerColor: 'green',
    cornerSize: 10,
    transparentCorners: false,
    fill: '#000000',
    left: 0,
    top: 0,
    padding: 20,
    originX: 'center',
    originY: 'center'
};
var RESET_STYLES = {
    fill: '#000000',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'left',
    textDecoraiton: ''
};

/**
 * Text
 * @class Text
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Text = tui.util.defineClass(Component, /** @lends Text.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Default text style
         * @type {object}
         */
        this._defaultStyles = defaultStyles;
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.TEXT,

    /**
     * Add new text on canvas image
     * @param {string} text - Initial input text
     * @param {object} settings - Options for generating text
     *     @param {object} [settings.styles] Initial styles
     *         @param {string} [settings.styles.fill] Color
     *         @param {string} [settings.styles.fontFamily] Font type for text
     *         @param {number} [settings.styles.fontSize] Size
     *         @param {string} [settings.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [settings.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [settings.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [settings.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [setting.position] - Initial position
     */
    add: function(text, settings) {
        var canvas = this.getCanvas();
        var styles = this._defaultStyles;
        var newText;

        if (settings.styles) {
            styles = tui.util.extend(settings.styles, styles);
        }

        this._setInitPos(settings.position);

        newText = new fabric.Text(text, styles);

        canvas.add(newText);

        if (!canvas.getActiveObject()) {
            canvas.setActiveObject(newText);
        }
    },

    /**
     * Change text of activate object on canvas image
     * @param {object} activeObj - Current selected text object
     * @param {string} text - Chaging text
     */
    change: function(activeObj, text) {
        activeObj.set('text', text);

        this.getCanvas().renderAll();
    },

    /**
     * Set style
     * @param {object} activeObj - Current selected text object
     * @param {object} styleObj - Initial styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     */
    setStyle: function(activeObj, styleObj) {
        tui.util.forEach(styleObj, function(val, key) {
            if (activeObj[key] === val) {
                styleObj[key] = RESET_STYLES[key] || '';
            }
        }, this);

        activeObj.set(styleObj);

        this.getCanvas().renderAll();
    },

    /**
     * Set initial position on canvas image
     * @param {{x: number, y: number}} [position] - Selected position
     */
    _setInitPos: function(position) {
        position = position || this.getCanvasImage().getCenterPoint();

        this._defaultStyles.left = position.x;
        this._defaultStyles.top = position.y;
    }
});

module.exports = Text;
