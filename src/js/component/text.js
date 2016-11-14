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
var browser = tui.util.browser;

var TEXTAREA_CLASSNAME = 'tui-image-eidtor-textarea';
var TEXTAREA_STYLES = util.makeStyleText({
    position: 'absolute',
    padding: 0,
    display: 'none',
    border: '1px dotted red',
    overflow: 'hidden',
    resize: 'none',
    outline: 'none',
    'border-radius': 0,
    'background-color': 'transparent',
    '-webkit-appearance': 'none',
    'z-index': 9999,
    'white-space': 'pre'
});
var EXTRA_PIXEL_LINEHEIGHT = 0.1;
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
         * Editing text object
         * @type {object}
         */
        this._editingObj = {};

        /**
         * Listeners for fabric event
         * @type {object}
         */
        this._listeners = {};

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
        this._lastClickTime = (new Date()).getTime();

        /**
         * Text object infos before editing
         * @type {Object}
         */
        this._editingObjInfos = {};

        /**
         * Previous state of editing
         * @type {boolean}
         */
        this.isPrevEditing = false;
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

        this._setEventEachObject(false);

        canvas.on({
            'mouse:down': this._listeners.mousedown,
            'object:selected': this._listeners.select,
            'before:selection:cleared': this._listeners.selectClear,
            'object:scaling': this._onFabricScaling
        });

        this._createTextarea();

        this.setCanvasRatio();
    },

    /**
     * End input text mode
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.selection = true;
        canvas.defaultCursor = 'default';

        this._setEventEachObject(true);

        canvas.deactivateAllWithDispatch(); // action for undo stack

        canvas.off({
            'mouse:down': this._listeners.mousedown,
            'object:selected': this._listeners.select,
            'before:selection:cleared': this._listeners.selectClear,
            'object:scaling': this._onFabricScaling
        });

        this._removeTextarea();

        this._listeners = {};
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
            mouseup: $.proxy(this._onFabricMouseUp, this)
        });

        canvas.add(newText);

        if (!canvas.getActiveObject()) {
            canvas.setActiveObject(newText);
        }

        this.isPrevEditing = true;
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
     * Whether object is selected or not
     * @returns {boolean} State of selecting
     */
    isSelected: function() {
        return this._isSelected;
    },

    /**
     * Get current selected text object
     * @returns {fabric.Text} Current selected text object
     */
    getSelectedObj: function() {
        return this._selectedObj;
    },

    /**
     * Set ratio value of canvas
     */
    setCanvasRatio: function() {
        var canvasElement = this.getCanvasElement();
        var cssWidth = parseInt(canvasElement.style.maxWidth, 10);
        var originWidth = canvasElement.width;
        var ratio = originWidth / cssWidth;

        this._ratio = ratio;
    },

    /**
     * Get ratio value of canvas
     * @returns {number} Ratio value
     */
    getCanvasRatio: function() {
        return this._ratio;
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
     * Create textarea element on canvas container
     * @private
     */
    _createTextarea: function() {
        var container = this.getCanvasElement().parentNode;
        var textarea = document.createElement('textarea');

        textarea.className = TEXTAREA_CLASSNAME;
        textarea.setAttribute('style', TEXTAREA_STYLES);
        textarea.setAttribute('wrap', 'off');

        container.appendChild(textarea);

        this._textarea = textarea;

        this._listeners = tui.util.extend(this._listeners, {
            input: tui.util.bind(this._onInput, this),
            keydown: tui.util.bind(this._onKeyDown, this),
            blur: tui.util.bind(this._onBlur, this),
            scroll: tui.util.bind(this._onScroll, this)
        });

        if (browser.msie && browser.version === 9) {
            fabric.util.addListener(textarea, 'keydown', this._listeners.keydown);
        } else {
            fabric.util.addListener(textarea, 'input', this._listeners.input);
        }
        fabric.util.addListener(textarea, 'blur', this._listeners.blur);
        fabric.util.addListener(textarea, 'scroll', this._listeners.scroll);
    },

    /**
     * Remove textarea element on canvas container
     * @private
     */
    _removeTextarea: function() {
        var container = this.getCanvasElement().parentNode;
        var textarea = container.querySelector('textarea');

        container.removeChild(textarea);

        this._textarea = null;

        if (browser.msie && browser.version < 10) {
            fabric.util.removeListener(textarea, 'keydown', this._listeners.keydown);
        } else {
            fabric.util.removeListener(textarea, 'input', this._listeners.input);
        }
        fabric.util.removeListener(textarea, 'blur', this._listeners.blur);
        fabric.util.removeListener(textarea, 'scroll', this._listeners.scroll);
    },

    /**
     * Input event handler
     * @private
     */
    _onInput: function() {
        var ratio = this.getCanvasRatio();
        var obj = this._editingObj;
        var textareaStyle = this._textarea.style;

        obj.setText(this._textarea.value);

        textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
        textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
    },

    /**
     * Keydown event handler
     * @private
     */
    _onKeyDown: function() {
        var ratio = this.getCanvasRatio();
        var obj = this._editingObj;
        var textareaStyle = this._textarea.style;
        var self = this;

        setTimeout(function() {
            obj.setText(self._textarea.value);

            textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
            textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
        }, 0);
    },

    /**
     * Blur event handler
     * @private
     */
    _onBlur: function() {
        var ratio = this.getCanvasRatio();
        var editingObj = this._editingObj;
        var editingObjInfos = this._editingObjInfos;
        var transWidth = (editingObj.getWidth() / ratio) - (editingObjInfos.width / ratio);
        var transHeight = (editingObj.getHeight() / ratio) - (editingObjInfos.height / ratio);

        if (ratio === 1) {
            transWidth /= 2;
            transHeight /= 2;
        }

        this._textarea.style.display = 'none';

        this._editingObj.set({
            left: editingObjInfos.left + transWidth,
            top: editingObjInfos.top + transHeight
        });

        this.getCanvas().add(this._editingObj);

        this.getCanvas().on('object:removed', this._listeners.remove);
    },

    /**
     * Scroll event handler
     * @private
     */
    _onScroll: function() {
        this._textarea.scrollLeft = 0;
        this._textarea.scrollTop = 0;
    },

    /**
     * Fabric scaling event handler
     * @param {fabric.Event} fEvent - Current scaling event on selected object
     * @private
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
     * @private
     */
    _onFabricMouseUp: function(fEvent) {
        var newClickTime = (new Date()).getTime();

        if (this._isDoubleClick(newClickTime)) {
            this._changeToEditingMode(fEvent.target);
            this._listeners.dbclick(); // fire dbclick event
        }

        this._lastClickTime = newClickTime;
    },

    /**
     * Set event each object
     * @param {boolean} state - Whether event state is true or false
     */
    _setEventEachObject: function(state) {
        this.getCanvas().forEachObject(function(obj) {
            if (!obj.isType('text')) {
                obj.evented = state;
            }
        });
    },

    /**
     * Get state of firing double click event
     * @param {Date} newClickTime - Current clicked time
     * @returns {boolean} Whether double clicked or not
     * @private
     */
    _isDoubleClick: function(newClickTime) {
        return (newClickTime - this._lastClickTime < DBCLICK_TIME);
    },

    /**
     * Change state of text object for editing
     * @param {fabric.Text} obj - Text object fired event
     * @private
     */
    _changeToEditingMode: function(obj) {
        var ratio = this.getCanvasRatio();
        var textareaStyle = this._textarea.style;

        this.isPrevEditing = true;

        this.getCanvas().off('object:removed', this._listeners.remove);

        obj.remove();

        this._editingObj = obj;
        this._textarea.value = obj.getText();

        this._editingObjInfos = {
            left: this._editingObj.getLeft(),
            top: this._editingObj.getTop(),
            width: this._editingObj.getWidth(),
            height: this._editingObj.getHeight()
        };

        textareaStyle.display = 'block';
        textareaStyle.left = (obj.oCoords.tl.x / ratio) + 'px';
        textareaStyle.top = (obj.oCoords.tl.y / ratio) + 'px';
        textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
        textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
        textareaStyle.transform = 'rotate(' + obj.getAngle() + 'deg)';
        textareaStyle.color = obj.getFill();

        textareaStyle['font-size'] = (obj.getFontSize() / ratio) + 'px';
        textareaStyle['font-family'] = obj.getFontFamily();
        textareaStyle['font-style'] = obj.getFontStyle();
        textareaStyle['font-weight'] = obj.getFontWeight();
        textareaStyle['text-align'] = obj.getTextAlign();
        textareaStyle['line-height'] = obj.getLineHeight() + EXTRA_PIXEL_LINEHEIGHT;
        textareaStyle['transform-origin'] = 'left top';

        this._textarea.focus();
    }
});

module.exports = Text;
