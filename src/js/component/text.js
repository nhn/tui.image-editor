'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');
var defaultStyles = {
    fill: '#000000',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'left',
    left: 0,
    top: 0,
    padding: 20,
    originX: 'center',
    originY: 'center'
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
     * @param {object} [setting] Options for generating text
     *     @param {string} [setting.text] Initial text
     *     @param {object} [setting.styles] Initial styles
     *         @param {string} [setting.styles.fill] Color
     *         @param {string} [setting.styles.fontFamily] Font type for text
     *         @param {number} [setting.styles.fontSize] Size
     *         @param {string} [setting.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [setting.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [setting.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [setting.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [setting.position] - Initial position
     */
    add: function(setting) {
        var canvas = this.getCanvas();
        var text = '';
        var styles = this._defaultStyles;
        var newText;

        if (setting) {
            text = setting.text || '';
            styles = setting.styles || tui.util.extend(styles, setting.styles);

            if (setting.position) {
                this._setInitPos(setting.position);
            }
        } else {
            this._setInitPos();
        }

        newText = new fabric.Text(text, styles);

        canvas.add(newText);

        if (!canvas.getActiveObject()) {
            canvas.setActiveObject(newText);
        }
    },

    /**
     * Change text of activate object on canvas image
     * @param {string} text - Chaging text
     */
    change: function(text) {
        var canvas = this.getCanvas();
        var activeObj = canvas.getActiveObject();

        if (!activeObj || !activeObj.selectable) {
            return;
        }

        activeObj.set('text', text);

        canvas.renderAll();
    },

    /**
     * Set style
     * @param {object} styleObj - Initial styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     */
    setStyle: function(styleObj) {
        var canvas = this.getCanvas();
        var activeObj = canvas.getActiveObject();

        if (!activeObj || !activeObj.selectable) {
            return;
        }

        tui.util.forEach(styleObj, function(val, key) {
            if (activeObj[key] === val) {
                styleObj[key] = defaultStyles[key] || '';
            }
        }, this);

        activeObj.set(styleObj);

        canvas.renderAll();
    },

    /**
     * Set initial position on canvas image
     * @param {{x: number, y: number}} [position] [description]
     */
    _setInitPos: function(position) {
        var centerPos, originX, originY;

        if (position) {
            originX = position.x;
            originY = position.y;
        } else {
            centerPos = this.getCanvasImage().getCenterPoint();
            originX = centerPos.x;
            originY = centerPos.y;
        }

        this._defaultStyles.left = originX;
        this._defaultStyles.top = originY;
    }
});

module.exports = Text;
