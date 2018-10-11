/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Text module
 */
import {fabric} from 'fabric';
import snippet from 'tui-code-snippet';
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';
import util from '../util';

const events = consts.eventNames;

const defaultStyles = {
    fill: '#000000',
    left: 0,
    top: 0
};
const resetStyles = {
    fill: '#000000',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'left',
    textDecoraiton: ''
};
const {browser} = snippet;

const TEXTAREA_CLASSNAME = 'tui-image-eidtor-textarea';
const TEXTAREA_STYLES = util.makeStyleText({
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
const EXTRA_PIXEL_LINEHEIGHT = 0.1;
const DBCLICK_TIME = 500;

/**
 * Text
 * @class Text
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Text extends Component {
    constructor(graphics) {
        super(consts.componentNames.TEXT, graphics);

        /**
         * Default text style
         * @type {Object}
         */
        this._defaultStyles = defaultStyles;

        /**
         * Selected state
         * @type {boolean}
         */
        this._isSelected = false;

        /**
         * Selected text object
         * @type {Object}
         */
        this._selectedObj = {};

        /**
         * Editing text object
         * @type {Object}
         */
        this._editingObj = {};

        /**
         * Listeners for fabric event
         * @type {Object}
         */
        this._listeners = {
            mousedown: this._onFabricMouseDown.bind(this),
            select: this._onFabricSelect.bind(this),
            selectClear: this._onFabricSelectClear.bind(this),
            scaling: this._onFabricScaling.bind(this)
        };

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

        /**
         * use itext
         * @type {boolean}
         */
        this.useItext = graphics.useItext;
    }

    /**
     * Start input text mode
     */
    start() {
        const canvas = this.getCanvas();

        canvas.selection = false;
        canvas.defaultCursor = 'text';
        canvas.on({
            'mouse:down': this._listeners.mousedown,
            'object:selected': this._listeners.select,
            'before:selection:cleared': this._listeners.selectClear,
            'object:scaling': this._listeners.scaling,
            'text:editing': this._listeners.modify
        });

        if (this.useItext) {
            canvas.forEachObject(obj => {
                if (obj.type === 'i-text') {
                    obj.set({
                        left: obj.left - (obj.width / 2),
                        top: obj.top - (obj.height / 2),
                        originX: 'left',
                        originY: 'top'
                    });
                }
            });
        } else {
            this._createTextarea();
        }

        this.setCanvasRatio();
    }

    /**
     * End input text mode
     */
    end() {
        const canvas = this.getCanvas();

        canvas.selection = true;
        canvas.defaultCursor = 'default';

        if (this.useItext) {
            canvas.forEachObject(obj => {
                if (obj.type === 'i-text') {
                    if (obj.text === '') {
                        obj.remove();
                    } else {
                        obj.set({
                            left: obj.left + (obj.width / 2),
                            top: obj.top + (obj.height / 2),
                            originX: 'center',
                            originY: 'center'
                        });
                    }
                }
            });
        } else {
            canvas.deactivateAllWithDispatch();
            this._removeTextarea();
        }

        canvas.off({
            'mouse:down': this._listeners.mousedown,
            'object:selected': this._listeners.select,
            'before:selection:cleared': this._listeners.selectClear,
            'object:scaling': this._listeners.scaling,
            'text:editing': this._listeners.modify
        });
    }

    /**
     * Add new text on canvas image
     * @param {string} text - Initial input text
     * @param {Object} options - Options for generating text
     *     @param {Object} [options.styles] Initial styles
     *         @param {string} [options.styles.fill] Color
     *         @param {string} [options.styles.fontFamily] Font type for text
     *         @param {number} [options.styles.fontSize] Size
     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [options.position] - Initial position
     * @returns {Promise}
     */
    add(text, options) {
        return new Promise(resolve => {
            const canvas = this.getCanvas();
            let newText = null;
            let selectionStyle = consts.fObjectOptions.SELECTION_STYLE;
            let styles = this._defaultStyles;

            this._setInitPos(options.position);

            if (options.styles) {
                styles = snippet.extend(styles, options.styles);
            }

            if (this.useItext) {
                newText = new fabric.IText(text, styles);
                selectionStyle = snippet.extend({}, selectionStyle, {
                    originX: 'left',
                    originY: 'top'
                });
            } else {
                newText = new fabric.Text(text, styles);
            }

            newText.set(selectionStyle);
            newText.on({
                mouseup: this._onFabricMouseUp.bind(this)
            });

            canvas.add(newText);

            if (!canvas.getActiveObject()) {
                canvas.setActiveObject(newText);
            }

            this.isPrevEditing = true;
            resolve(this.graphics.createObjectProperties(newText));
        });
    }

    /**
     * Change text of activate object on canvas image
     * @param {Object} activeObj - Current selected text object
     * @param {string} text - Changed text
     * @returns {Promise}
     */
    change(activeObj, text) {
        return new Promise(resolve => {
            activeObj.set('text', text);

            this.getCanvas().renderAll();
            resolve();
        });
    }

    /**
     * Set style
     * @param {Object} activeObj - Current selected text object
     * @param {Object} styleObj - Initial styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     * @returns {Promise}
     */
    setStyle(activeObj, styleObj) {
        return new Promise(resolve => {
            snippet.forEach(styleObj, (val, key) => {
                if (activeObj[key] === val) {
                    styleObj[key] = resetStyles[key] || '';
                }
            }, this);

            activeObj.set(styleObj);

            this.getCanvas().renderAll();
            resolve();
        });
    }

    /**
     * Get the text
     * @param {Object} activeObj - Current selected text object
     * @returns {String} text
     */
    getText(activeObj) {
        return activeObj.getText();
    }

    /**
     * Set infos of the current selected object
     * @param {fabric.Text} obj - Current selected text object
     * @param {boolean} state - State of selecting
     */
    setSelectedInfo(obj, state) {
        this._selectedObj = obj;
        this._isSelected = state;
    }

    /**
     * Whether object is selected or not
     * @returns {boolean} State of selecting
     */
    isSelected() {
        return this._isSelected;
    }

    /**
     * Get current selected text object
     * @returns {fabric.Text} Current selected text object
     */
    getSelectedObj() {
        return this._selectedObj;
    }

    /**
     * Set ratio value of canvas
     */
    setCanvasRatio() {
        const canvasElement = this.getCanvasElement();
        const cssWidth = parseInt(canvasElement.style.maxWidth, 10);
        const originWidth = canvasElement.width;
        const ratio = originWidth / cssWidth;

        this._ratio = ratio;
    }

    /**
     * Get ratio value of canvas
     * @returns {number} Ratio value
     */
    getCanvasRatio() {
        return this._ratio;
    }

    /**
     * Set initial position on canvas image
     * @param {{x: number, y: number}} [position] - Selected position
     * @private
     */
    _setInitPos(position) {
        position = position || this.getCanvasImage().getCenterPoint();

        this._defaultStyles.left = position.x;
        this._defaultStyles.top = position.y;
    }

    /**
     * Create textarea element on canvas container
     * @private
     */
    _createTextarea() {
        const container = this.getCanvasElement().parentNode;
        const textarea = document.createElement('textarea');

        textarea.className = TEXTAREA_CLASSNAME;
        textarea.setAttribute('style', TEXTAREA_STYLES);
        textarea.setAttribute('wrap', 'off');

        container.appendChild(textarea);

        this._textarea = textarea;

        this._listeners = snippet.extend(this._listeners, {
            input: this._onInput.bind(this),
            keydown: this._onKeyDown.bind(this),
            blur: this._onBlur.bind(this),
            scroll: this._onScroll.bind(this)
        });

        if (browser.msie && browser.version === 9) {
            fabric.util.addListener(textarea, 'keydown', this._listeners.keydown);
        } else {
            fabric.util.addListener(textarea, 'input', this._listeners.input);
        }
        fabric.util.addListener(textarea, 'blur', this._listeners.blur);
        fabric.util.addListener(textarea, 'scroll', this._listeners.scroll);
    }

    /**
     * Remove textarea element on canvas container
     * @private
     */
    _removeTextarea() {
        const container = this.getCanvasElement().parentNode;
        const textarea = container.querySelector('textarea');

        container.removeChild(textarea);

        this._textarea = null;

        if (browser.msie && browser.version < 10) {
            fabric.util.removeListener(textarea, 'keydown', this._listeners.keydown);
        } else {
            fabric.util.removeListener(textarea, 'input', this._listeners.input);
        }
        fabric.util.removeListener(textarea, 'blur', this._listeners.blur);
        fabric.util.removeListener(textarea, 'scroll', this._listeners.scroll);
    }

    /**
     * Input event handler
     * @private
     */
    _onInput() {
        const ratio = this.getCanvasRatio();
        const obj = this._editingObj;
        const textareaStyle = this._textarea.style;

        textareaStyle.width = `${Math.ceil(obj.getWidth() / ratio)}px`;
        textareaStyle.height = `${Math.ceil(obj.getHeight() / ratio)}px`;
    }

    /**
     * Keydown event handler
     * @private
     */
    _onKeyDown() {
        const ratio = this.getCanvasRatio();
        const obj = this._editingObj;
        const textareaStyle = this._textarea.style;

        setTimeout(() => {
            obj.setText(this._textarea.value);

            textareaStyle.width = `${Math.ceil(obj.getWidth() / ratio)}px`;
            textareaStyle.height = `${Math.ceil(obj.getHeight() / ratio)}px`;
        }, 0);
    }

    /**
     * Blur event handler
     * @private
     */
    _onBlur() {
        const ratio = this.getCanvasRatio();
        const editingObj = this._editingObj;
        const editingObjInfos = this._editingObjInfos;
        const textContent = this._textarea.value;
        let transWidth = (editingObj.getWidth() / ratio) - (editingObjInfos.width / ratio);
        let transHeight = (editingObj.getHeight() / ratio) - (editingObjInfos.height / ratio);

        if (ratio === 1) {
            transWidth /= 2;
            transHeight /= 2;
        }

        this._textarea.style.display = 'none';

        editingObj.set({
            left: editingObjInfos.left + transWidth,
            top: editingObjInfos.top + transHeight
        });

        if (textContent.length) {
            this.getCanvas().add(editingObj);

            const params = {
                id: snippet.stamp(editingObj),
                type: editingObj.type,
                text: textContent
            };

            this.fire(events.TEXT_CHANGED, params);
        }
    }

    /**
     * Scroll event handler
     * @private
     */
    _onScroll() {
        this._textarea.scrollLeft = 0;
        this._textarea.scrollTop = 0;
    }

    /**
     * Fabric scaling event handler
     * @param {fabric.Event} fEvent - Current scaling event on selected object
     * @private
     */
    _onFabricScaling(fEvent) {
        const obj = fEvent.target;
        const scalingSize = obj.getFontSize() * obj.getScaleY();

        obj.setFontSize(scalingSize);
        obj.setScaleX(1);
        obj.setScaleY(1);
    }

    /**
     * onSelectClear handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricSelectClear(fEvent) {
        const obj = this.getSelectedObj();

        this.isPrevEditing = true;

        this.setSelectedInfo(fEvent.target, false);

        if (obj) {
            // obj is empty object at initial time, will be set fabric object
            if (obj.text === '') {
                obj.remove();
            }
        }
    }

    /**
     * onSelect handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricSelect(fEvent) {
        this.isPrevEditing = true;

        this.setSelectedInfo(fEvent.target, true);
    }

    /**
     * Fabric 'mousedown' event handler
     * @param {fabric.Event} fEvent - Current mousedown event on selected object
     * @private
     */
    _onFabricMouseDown(fEvent) {
        const obj = fEvent.target;

        if (obj && !obj.isType('text')) {
            return;
        }

        if (this.isPrevEditing) {
            this.isPrevEditing = false;

            return;
        }

        this._fireAddText(fEvent);
    }

    /**
     * Fire 'addText' event if object is not selected.
     * @param {fabric.Event} fEvent - Current mousedown event on selected object
     * @private
     */
    _fireAddText(fEvent) {
        const obj = fEvent.target;
        const e = fEvent.e || {};
        const originPointer = this.getCanvas().getPointer(e);

        if (!obj) {
            this.fire(events.ADD_TEXT, {
                originPosition: {
                    x: originPointer.x,
                    y: originPointer.y
                },
                clientPosition: {
                    x: e.clientX || 0,
                    y: e.clientY || 0
                }
            });
        }
    }

    /**
     * Fabric mouseup event handler
     * @param {fabric.Event} fEvent - Current mousedown event on selected object
     * @private
     */
    _onFabricMouseUp(fEvent) {
        const newClickTime = (new Date()).getTime();

        if (this._isDoubleClick(newClickTime)) {
            if (!this.useItext) {
                this._changeToEditingMode(fEvent.target);
            }
            this.fire(events.TEXT_EDITING); // fire editing text event
        }

        this._lastClickTime = newClickTime;
    }

    /**
     * Get state of firing double click event
     * @param {Date} newClickTime - Current clicked time
     * @returns {boolean} Whether double clicked or not
     * @private
     */
    _isDoubleClick(newClickTime) {
        return (newClickTime - this._lastClickTime < DBCLICK_TIME);
    }

    /**
     * Change state of text object for editing
     * @param {fabric.Text} obj - Text object fired event
     * @private
     */
    _changeToEditingMode(obj) {
        const ratio = this.getCanvasRatio();
        const textareaStyle = this._textarea.style;

        this.isPrevEditing = true;

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
        textareaStyle.left = `${obj.oCoords.tl.x / ratio}px`;
        textareaStyle.top = `${obj.oCoords.tl.y / ratio}px`;
        textareaStyle.width = `${Math.ceil(obj.getWidth() / ratio)}px`;
        textareaStyle.height = `${Math.ceil(obj.getHeight() / ratio)}px`;
        textareaStyle.transform = `rotate(${obj.getAngle()}deg)`;
        textareaStyle.color = obj.getFill();

        textareaStyle['font-size'] = `${obj.getFontSize() / ratio}px`;
        textareaStyle['font-family'] = obj.getFontFamily();
        textareaStyle['font-style'] = obj.getFontStyle();
        textareaStyle['font-weight'] = obj.getFontWeight();
        textareaStyle['text-align'] = obj.getTextAlign();
        textareaStyle['line-height'] = obj.getLineHeight() + EXTRA_PIXEL_LINEHEIGHT;
        textareaStyle['transform-origin'] = 'left top';

        this._textarea.focus();
    }
}

module.exports = Text;
