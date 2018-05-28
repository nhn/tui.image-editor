import snippet from 'tui-code-snippet';

/**
 * Range control class
 * @class
 */
class Range {
    constructor(rangeElement, options = {}) {
        this.value = options.value || 0;
        this.rangeElement = rangeElement;
        this._drawRangeElement();
        this.rangeWidth = parseInt(window.getComputedStyle(rangeElement, null).width, 10) - 12;
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

        this.pointer = document.createElement('div');
        this.pointer.className = 'tui-image-editor-virtual-range-pointer';

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
            const firstPosition = event.screenX;
            const left = parseInt(this.pointer.style.left, 10) || 0;
            const changeAngle = changeEvent => {
                const changePosition = changeEvent.screenX;
                const diffPosition = changePosition - firstPosition;
                let touchPx = left + diffPosition;
                touchPx = touchPx > this.rangeWidth ? this.rangeWidth : touchPx;
                touchPx = touchPx < 0 ? 0 : touchPx;

                this.pointer.style.left = `${touchPx}px`;
                const ratio = touchPx / this.rangeWidth;
                const value = (this.absMax * ratio) + this.min;

                this.value = value;

                if (this.realTimeEvent) {
                    this.fire('change', value);
                }
            };
            const stopChangingAngle = () => {
                this.fire('change', this.value);
                document.removeEventListener('mousemove', changeAngle);
                document.removeEventListener('mouseup', stopChangingAngle);
            };

            document.addEventListener('mousemove', changeAngle);
            document.addEventListener('mouseup', stopChangingAngle);
        });
    }
}

snippet.CustomEvents.mixin(Range);
export default Range;
