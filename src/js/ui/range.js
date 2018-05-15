export default class Range {
    constructor(rangeElement) {
        this.min = Number(rangeElement.getAttribute('min'));
        this.max = Number(rangeElement.getAttribute('max'));
        this.absMax = this.min < 0 ? (this.min * -1) + this.min : this.max;

        this.bar = document.createElement('div');
        this.pointer = document.createElement('div');
        this.bar.className = 'tui-image-editor-virtual-range-bar';
        this.pointer.className = 'tui-image-editor-virtual-range-pointer';
        rangeElement.appendChild(this.bar);
        this.bar.appendChild(this.pointer);

        rangeElement.addEventListener('click', event => {
            if (event.target.className !== 'tui-image-editor-range') {
                return;
            }
            const touchPx = event.offsetX;
            const ratio = touchPx / 200;
            const value = (this.absMax * ratio) - this.min;
            this.pointer.style.left = `${ratio * 200}px`;
        });

        this.pointer.addEventListener('mousedown', event => {
            const firstPosition = event.screenX;
            const left = parseInt(this.pointer.style.left, 10) || 0;
            const changeAngle = changeEvent => {
                const changePosition = changeEvent.screenX;
                const diffPosition = changePosition - firstPosition;
                let touchPx = left + diffPosition;
                touchPx = touchPx > 200 ? 200 : touchPx;
                touchPx = touchPx < 0 ? 0 : touchPx;

                this.pointer.style.left = `${touchPx}px`;
                const ratio = touchPx / 200;
                const value = (720 * ratio) - 360;
            };
            document.addEventListener('mousemove', changeAngle);
            document.addEventListener('mouseup', function stopChangingAngle(upEvent) {
                document.removeEventListener('mousemove', changeAngle);
                document.removeEventListener('mouseup', stopChangingAngle);
            }.bind(this));

        });
    }
}
