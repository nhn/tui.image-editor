import util from '../util';
import Colorpicker from './colorpicker';
import Range from './range';

export default class Draw {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);

        this._el = {
            lineSelectButton: selector('#draw-line-select-button'),
            drawColorpicker: new Colorpicker(selector('#draw-color')),
            drawRange: new Range(selector('#draw-range'), {
                min: 5,
                max: 30,
                value: 12
            }),
            drawRangeValue: selector('#draw-range-value')
        };

        this.type = 'line';
        this.color = this._el.drawColorpicker.getColor();
        this.width = this._el.drawRange.getValue();
    }

    setDrawMode() {
        this.actions.setDrawMode(this.type, {
            width: this.width,
            color: util.getRgb(this.color, 0.7)
        });
    }

    addEvent(actions) {
        this.actions = actions;

        this._el.lineSelectButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [lineType] = button.className.match(/(free|line)/);
            this.type = lineType;
            this.setDrawMode();
        });

        this._el.drawColorpicker.on('change', value => {
            const color = value.color || 'transparent';
            this.color = color;
            this.setDrawMode();
        });

        this._el.drawRange.on('change', value => {
            value = parseInt(value, 10);
            this._el.drawRangeValue.value = value;
            this.width = value;
            this.setDrawMode();
        });
    }
}
