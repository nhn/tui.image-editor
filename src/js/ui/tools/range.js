import snippet from 'tui-code-snippet';
import {toInteger} from '../../util';

/**
 * Range control class
 * @class
 */
class Range {
    constructor(rangeElement, options = {}) {
        this.value = options.value || 0;
        this.rangeElement = rangeElement;
        this._drawRangeElement();

        this.rangeWidth = toInteger(window.getComputedStyle(rangeElement, null).width) - 12;
        this.min = options.min || 0;
        this.max = options.max || 100;
        this.absMax = (this.min * -1) + this.max;
        this.realTimeEvent = options.realTimeEvent || false;

        this._addClickEvent();
        this._addDragEvent();
        this.setValue(options.value);
    }

    /**
     * Get range value
     * @returns {Number} range value
     */
    getValue() {
        return this.value;
    }

    /**
     * Set range value
     * @param {Number} value range value
     * @param {Boolean} fire whether fire custom event or not
     */
    setValue(value, fire = true) {
        const absValue = value - this.min;
        let leftPosition = (absValue * this.rangeWidth) / this.absMax;

        if (this.rangeWidth < leftPosition) {
            leftPosition = this.rangeWidth;
        }

        this.pointer.style.left = `${leftPosition}px`;
        this.subbar.style.right = `${this.rangeWidth - leftPosition}px`;
        this.value = value;
        if (fire) {
            this.fire('change', value);
        }
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
            if (event.target.className !== 'tui-image-editor-range') {
                return;
            }
            const touchPx = event.offsetX;
            const ratio = touchPx / this.rangeWidth;
            const value = (this.absMax * ratio) + this.min;
            this.pointer.style.left = `${ratio * this.rangeWidth}px`;
            this.subbar.style.right = `${(1 - ratio) * this.rangeWidth}px`;
            this.value = value;

            this.fire('change', value);
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
     * change angle event
     * @param {object} event - change event
     * @private
     */
    _changeAngle(event) {
        const changePosition = event.screenX;
        const diffPosition = changePosition - this.firstPosition;
        let touchPx = this.firstLeft + diffPosition;
        touchPx = touchPx > this.rangeWidth ? this.rangeWidth : touchPx;
        touchPx = touchPx < 0 ? 0 : touchPx;

        this.pointer.style.left = `${touchPx}px`;
        this.subbar.style.right = `${this.rangeWidth - touchPx}px`;
        const ratio = touchPx / this.rangeWidth;
        const value = (this.absMax * ratio) + this.min;

        this.value = value;

        if (this.realTimeEvent) {
            this.fire('change', value);
        }
    }

    /**
     * stop change angle event
     * @private
     */
    _stopChangingAngle() {
        this.fire('change', this.value);
        document.removeEventListener('mousemove', this.dragEventHandler.changeAngle);
        document.removeEventListener('mouseup', this.dragEventHandler.stopChangingAngle);
    }
}

snippet.CustomEvents.mixin(Range);
export default Range;
