/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Text module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');
var util = require('../util');

var defaultStyles = {
    fill: '#000000',
    left: 0,
    top: 0
};
var resetStyles = {
    fill: '#000000',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'left',
    textDecoraiton: ''
};

var TEXTAREA_CLASSNAME = 'tui-image-eidtor-textarea';
var TEXTAREA_STYLES = util.makeStyleText({
    position: 'absolute',
    display: 'none',
    padding: 0,
    border: '1px dashed red',
    overflow: 'hidden',
    resize: 'none',
    outline: 'none',
    'border-radius': 0,
    'background-color': 'transparent',
    'vertical-align': 'baseline',
    '-webkit-appearance': 'none',
    'z-index': 99999
});
var EXTRA_PIXEL = {
    width: 25,
    height: 10
};
var KEYUP_CODE = 13;
var DBCLICK_TIME = 500;

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

        /**
         * Textarea element for editing
         * @type {HTMLElement}
         */
        this._textarea = null;

        /**
         * Ratio of current canvas
         * @type {number}
         */
        this._ratio = 1;

        /**
         * Last click time
         * @type {Date}
         */
        this._lastClickTime = new Date().getTime();
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
            'before:selection:cleared': this._listeners.selectClear,
            'object:scaling': this._onFabricScaling
        });

        this._createTextarea();

        this._setCanvasRatio();
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
            'before:selection:cleared': this._listeners.selectClear,
            'object:scaling': this._onFabricScaling
        });

        this._removeTextarea();
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

        newText.on({
            mouseup: tui.util.bind(this._onFabricMouseUp, this)
        });

        canvas.add(newText);

        if (!canvas.getActiveObject()) {
            canvas.setActiveObject(newText);
        }
    },

    /**
     * Change text of activate object on canvas image
     * @param {object} activeObj - Current selected text object
     * @param {string} text - Changed text
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
    },

    /**
     * Set ratio value of canvas
     */
    _setCanvasRatio: function() {
        var canvasElement = this.getCanvasElement();
        var cssWidth = canvasElement.getBoundingClientRect().width;
        var originWidth = canvasElement.width;
        var ratio = originWidth / cssWidth;

        this._ratio = ratio;
    },

    /**
     * Get ratio value of canvas
     * @returns {number} Ratio value
     */
    _getCanvasRatio: function() {
        return this._ratio;
    },

    /**
     * Create textarea element on canvas container
     */
    _createTextarea: function() {
        var container = this.getCanvasElement().parentNode;
        var textarea = document.createElement('textarea');

        textarea.className = TEXTAREA_CLASSNAME;
        textarea.setAttribute('style', TEXTAREA_STYLES);

        container.appendChild(textarea);

        this._textarea = textarea;

        fabric.util.addListener(textarea, 'keyup', tui.util.bind(this._onKeyUp, this));
        fabric.util.addListener(textarea, 'blur', tui.util.bind(this._onBlur, this));
    },

    /**
     * Remove textarea element on canvas container
     */
    _removeTextarea: function() {
        var container = this.getCanvasElement().parentNode;
        var textarea = container.querySelector('textarea');

        container.removeChild(textarea);

        this._textarea = null;

        fabric.util.removeListener(textarea, 'keyup', this._onKeyUp);
        fabric.util.removeListener(textarea, 'blur', this._onBlur);
    },

    /**
     * Keyup event handler
     * @param {KeyEvent} event - Keyup event on element
     */
    _onKeyUp: function(event) {
        var ratio = this._getCanvasRatio();
        var textareaStyle = this._textarea.style;
        var obj = this.getSelectedObj();
        var originPos = obj.oCoords.tl;

        obj.setText(this._textarea.value);

        if (event.keyCode === KEYUP_CODE) {
            textareaStyle.height = (obj.getHeight() + EXTRA_PIXEL.height) / ratio + 'px';
        } else {
            textareaStyle.width = (obj.getWidth() + EXTRA_PIXEL.width) / ratio + 'px';
        }

        textareaStyle.left = originPos.x / ratio + 'px';
        textareaStyle.top = originPos.y / ratio + 'px';
    },

    /**
     * Blur event handler
     */
    _onBlur: function() {
        var obj = this.getSelectedObj();

        this._textarea.style.display = 'none';

        this.getCanvas().add(obj);
    },

    /**
     * Fabric scaling event handler
     * @param {fabric.Event} fEvent - Current scaling event on selected object
     */
    _onFabricScaling: function(fEvent) {
        var obj = fEvent.target;
        var scalingSize = obj.getFontSize() * obj.getScaleY();

        obj.setFontSize(scalingSize);
        obj.setScaleX(1);
        obj.setScaleY(1);
    },

    /**
     * Fabric mouseup event handler
     * @param {fabric.Event} fEvent - Current mousedown event on selected object
     */
    _onFabricMouseUp: function(fEvent) {
        var newClickTime = new Date().getTime();

        if (this._isDoubleClick(newClickTime)) {
            //this._changeToEditingMode(fEvent.target);
            //this._listeners.dbclick(); // fire dbclick event
        }

        this._lastClickTime = newClickTime;
    },

    /**
     * Get state of firing double click event
     * @param {Date} newClickTime - Current clicked time
     * @returns {boolean} Whether double clicked or not
     */
    _isDoubleClick: function(newClickTime) {
        return (newClickTime - this._lastClickTime < DBCLICK_TIME);
    },

    /**
     * Change state of text object for editing
     * @param {fabric.Text} obj - Text object fired event
     */
    _changeToEditingMode: function(obj) {
        var ratio = this._getCanvasRatio();
        var textareaStyle = this._textarea.style;

        obj.remove();

        this._selectedObj = obj;

        this._textarea.value = obj.getText();

        textareaStyle.display = 'block';
        textareaStyle.left = obj.oCoords.tl.x / ratio + 'px';
        textareaStyle.top = obj.oCoords.tl.y / ratio + 'px';
        textareaStyle.width = (obj.getWidth() + EXTRA_PIXEL.width) / ratio + 'px';
        textareaStyle.height = obj.getHeight() / ratio + 'px';
        textareaStyle.transform = 'rotate(' + obj.getAngle() + 'deg)';

        textareaStyle['font-size'] = obj.getFontSize() / ratio + 'px';
        textareaStyle['font-family'] = obj.getFontFamily();
        textareaStyle['font-style'] = obj.getFontStyle();
        textareaStyle['font-weight'] = obj.getFontWeight();
        textareaStyle['text-align'] = obj.getTextAlign();
        textareaStyle['line-height'] = obj.getLineHeight();
        textareaStyle['transform-origin'] = 'left top';

        this._textarea.focus();
    }
});

module.exports = Text;
