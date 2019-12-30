import snippet from 'tui-code-snippet';
import {toInteger} from '../../util';

/**
 * Range control class
 * @class
 * @ignore
 */
class Range {
    constructor(rangeElement, options = {}) {
        this._value = options.value || 0;
        this.rangeElement = rangeElement;
        this._drawRangeElement();

        this.rangeWidth = toInteger(window.getComputedStyle(rangeElement, null).width) - 12;
        this._min = options.min || 0;
        this._max = options.max || 100;
        this._absMax = (this._min * -1) + this._max;
        this.realTimeEvent = options.realTimeEvent || false;

        this._addClickEvent();
        this._addDragEvent();
        this._addTouchEvent();

        this.value = options.value;
        this.trigger('change');
    }

    /**
     * Set range max value and re position cursor
     * @param {number} maxValue - max value
     */
    set max(maxValue) {
        this._max = maxValue;
        this._absMax = (this._min * -1) + this._max;
        this.value = this._value;
    }

    get max() {
        return this._max;
    }

    /**
     * Get range value
     * @returns {Number} range value
     */
    get value() {
        return this._value;
    }

    /**
     * Set range value
     * @param {Number} value range value
     * @param {Boolean} fire whether fire custom event or not
     */
    set value(value) {
        const absValue = value - this._min;
        let leftPosition = (absValue * this.rangeWidth) / this._absMax;

        if (this.rangeWidth < leftPosition) {
            leftPosition = this.rangeWidth;
        }

        this.pointer.style.left = `${leftPosition}px`;
        this.subbar.style.right = `${this.rangeWidth - leftPosition}px`;
        this._value = value;
    }

    /**
     * event tirigger
     * @param {string} type - type
     */
    trigger(type) {
        this.fire(type, this._value);
    }

    /**
     * Make range element
     * @private
     */
    _drawRangeElement() {
        this.rangeElement.classList.add('tui-image-editor-range');

        this.bar = document.createElement('div');
        this.bar.className = 'tui-image-editor-virtual-range-bar';

        this.subbar = document.createElement('div');
        this.subbar.className = 'tui-image-editor-virtual-range-subbar';

        this.pointer = document.createElement('div');
        this.pointer.className = 'tui-image-editor-virtual-range-pointer';

        this.bar.appendChild(this.subbar);
        this.bar.appendChild(this.pointer);
        this.rangeElement.appendChild(this.bar);
    }

    /**
     * Add Range click event
     * @private
     */
    _addClickEvent() {
        this.rangeElement.addEventListener('click', event => {
            event.stopPropagation();
            // sometimes there is more than one class on the element this is why we need to use indexOf instead
            // all classes below are part of the range element
            if (event.target.className &&
                event.target.className.indexOf('tui-image-editor-range') === -1 &&
                event.target.className.indexOf('tui-image-editor-virtual-range-bar') === -1 &&
                event.target.className.indexOf('tui-image-editor-virtual-range-subbar') === -1) {
                return;
            }

            const touchPx = event.offsetX;
            const ratio = touchPx / this.rangeWidth;
            const value = (this._absMax * ratio) + this._min;
            this.pointer.style.left = `${ratio * this.rangeWidth}px`;
            this.subbar.style.right = `${(1 - ratio) * this.rangeWidth}px`;
            this._value = value;

            this.fire('change', value, true);
        });
    }

    /**
     * Add Range touch event
     * @private
     */
    _addTouchEvent() {
        this.pointer.addEventListener('touchstart', event => {
            if (!event.touches || event.touches.length !== 1) {
                return;
            }

            this.firstPosition = event.touches[0].screenX;
            this.firstLeft = toInteger(this.pointer.style.left) || 0;
            this.touchEventHandler = {
                changeAngle: this._changeAngleTouch.bind(this),
                stopChangingAngle: this._stopChangingAngleTouch.bind(this)
            };

            document.addEventListener('touchmove', this.touchEventHandler.changeAngle);
            document.addEventListener('touchend', this.touchEventHandler.stopChangingAngle);
        });
    }

    /**
     * Add Range drag event
     * @private
     */
    _addDragEvent() {
        this.pointer.addEventListener('mousedown', event => {
            this.firstPosition = event.screenX;
            this.firstLeft = toInteger(this.pointer.style.left) || 0;
            this.dragEventHandler = {
                changeAngle: this._changeAngle.bind(this),
                stopChangingAngle: this._stopChangingAngle.bind(this)
            };

            document.addEventListener('mousemove', this.dragEventHandler.changeAngle);
            document.addEventListener('mouseup', this.dragEventHandler.stopChangingAngle);
        });
    }

    /**
     * change angle event for touch events
     * @param {object} event - change event
     */
    _changeAngleTouch(event) {
        if (!event.touches || event.touches.length !== 1) {
            return;
        }

        this._applyScreenX(event.touches[0].screenX);
    }

    /**
     * change angle event
     * @param {object} event - change event
     * @private
     */
    _changeAngle(event) {
        this._applyScreenX(event.screenX);
    }

    /**
     * Apply a screenX position to the range
     * @param {number} screenX - screenX position to apply to the range
     * @private
     */
    _applyScreenX(screenX) {
        const changePosition = screenX;
        const diffPosition = changePosition - this.firstPosition;
        let touchPx = this.firstLeft + diffPosition;
        touchPx = touchPx > this.rangeWidth ? this.rangeWidth : touchPx;
        touchPx = touchPx < 0 ? 0 : touchPx;

        this.pointer.style.left = `${touchPx}px`;
        this.subbar.style.right = `${this.rangeWidth - touchPx}px`;
        const ratio = touchPx / this.rangeWidth;
        const value = (this._absMax * ratio) + this._min;

        this._value = value;

        if (this.realTimeEvent) {
            this.fire('change', value, false);
        }
    }

    /**
     * stop change angle event
     * @private
     */
    _stopChangingAngle() {
        this.fire('change', this._value, true);
        document.removeEventListener('mousemove', this.dragEventHandler.changeAngle);
        document.removeEventListener('mouseup', this.dragEventHandler.stopChangingAngle);
    }

    /**
     * stop change angle event for touch event
     * @private
     */
    _stopChangingAngleTouch() {
        this.fire('change', this._value, true);
        document.removeEventListener('touchmove', this.touchEventHandler.changeAngle);
        document.removeEventListener('touchend', this.touchEventHandler.stopChangingAngle);
    }
}

snippet.CustomEvents.mixin(Range);
export default Range;
