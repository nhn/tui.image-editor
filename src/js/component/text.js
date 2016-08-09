/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Text module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var defaultStyles = {
    fill: '#000000',
    left: 0,
    top: 0,
    padding: 20
};
var resetStyles = {
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

        /**
         * Selected state
         * @type {boolean}
         */
        this._isSelected = false;

        /**
         * Selected text object
         * @type {object}
         */
        this._selectedObj = {};

        /**
         * Listeners for fabric event
         * @type {object}
         */
        this._listeners = null;
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.TEXT,

    /**
     * Start input text mode
     * @param {object} listeners - Callback functions of fabric event
     */
    start: function(listeners) {
        var canvas = this.getCanvas();

        this._listeners = listeners;

        canvas.selection = false;
        canvas.defaultCursor = 'text';

        canvas.forEachObject(function(obj) {
            if (!obj.isType('text')) {
                obj.evented = false;
            }
        });

        canvas.on({
            'mouse:down': this._listeners.mousedown,
            'object:selected': this._listeners.select,
            'before:selection:cleared': this._listeners.selectClear
        });
    },

    /**
     * End input text mode
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.selection = true;
        canvas.defaultCursor = 'default';

        canvas.forEachObject(function(obj) {
            if (!obj.isType('text')) {
                obj.evented = true;
            }
        });

        canvas.deactivateAllWithDispatch(); // action for undo stack

        canvas.off({
            'mouse:down': this._listeners.mousedown,
            'object:selected': this._listeners.select,
            'before:selection:cleared': this._listeners.selectClear
        });
    },

    /**
     * Add new text on canvas image
     * @param {string} text - Initial input text
     * @param {object} options - Options for generating text
     *     @param {object} [options.styles] Initial styles
     *         @param {string} [options.styles.fill] Color
     *         @param {string} [options.styles.fontFamily] Font type for text
     *         @param {number} [options.styles.fontSize] Size
     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [options.position] - Initial position
     */
    add: function(text, options) {
        var canvas = this.getCanvas();
        var styles = this._defaultStyles;
        var newText;

        this._setInitPos(options.position);

        if (options.styles) {
            styles = tui.util.extend(options.styles, styles);
        }

        newText = new fabric.Text(text, styles);

        newText.set(consts.fObjectOptions.SELECTION_STYLE);

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
                styleObj[key] = resetStyles[key] || '';
            }
        }, this);

        activeObj.set(styleObj);

        this.getCanvas().renderAll();
    },

    /**
     * Set infos of the current selected object
     * @param {fabric.Text} obj - Current selected text object
     * @param {boolean} state - State of selecting
     */
    setSelectedInfo: function(obj, state) {
        this._selectedObj = obj;
        this._isSelected = state;
    },

    /**
     * Whether before selected object is deselected or not
     * @returns {boolean} State of selecting
     */
    isBeforeDeselect: function() {
        return !this._isSelected;
    },

    /**
     * Get current selected text object
     * @returns {fabric.Text} Current selected text object
     */
    getSelectedObj: function() {
        return this._selectedObj;
    },

    /**
     * Set initial position on canvas image
     * @param {{x: number, y: number}} [position] - Selected position
     * @private
     */
    _setInitPos: function(position) {
        position = position || this.getCanvasImage().getCenterPoint();

        this._defaultStyles.left = position.x;
        this._defaultStyles.top = position.y;
    }
});

module.exports = Text;
