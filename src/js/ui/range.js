import snippet from 'tui-code-snippet';

class Range {
    constructor(rangeElement, options = {}) {
        this.value = options.value || 0;
        this.rangeElement = rangeElement;
        this.drawRangeElement();
        this.rangeWidth = parseInt(window.getComputedStyle(rangeElement, null).width, 10) - 12;
        this.min = options.min || 0;
        this.max = options.max || 100;
        this.absMax = (this.min * -1) + this.max;

        this.addClickEvent();
        this.addDragEvent();
        this.initValue(options.value);
    }

    initValue(value) {
        this.value = value;
        const absValue = value - this.min;
        const leftPosition = (absValue * this.rangeWidth) / this.absMax;
        this.pointer.style.left = `${leftPosition}px`;

        setTimeout(() => {
            this.fire('change', value);
        });
    }

    getValue() {
        return this.value;
    }

    drawRangeElement() {
        this.rangeElement.classList.add('tui-image-editor-range');

        this.bar = document.createElement('div');
        this.bar.className = 'tui-image-editor-virtual-range-bar';

        this.pointer = document.createElement('div');
        this.pointer.className = 'tui-image-editor-virtual-range-pointer';

        this.bar.appendChild(this.pointer);
        this.rangeElement.appendChild(this.bar);
    }

    addClickEvent() {
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

    addDragEvent() {
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

                this.fire('change', value);
            };
            const stopChangingAngle = () => {
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
