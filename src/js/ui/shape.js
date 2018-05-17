import Colorpicker from './colorpicker';
import Range from './range';

export default class Shape {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.type = 'rect';
        this.options = {
            stroke: '#ffbb3b',
            fill: '',
            strokeWidth: 3
        };

        this.controlOption = {
            cornerStyle: 'circle',
            cornerSize: 20,
            cornerColor: '#fff',
            cornerStrokeColor: '#000',
            transparentCorners: false,
            lineWidth: 2,
            borderColor: '#fff'
        };

        this._btnElement = {
            shapeSelectButton: selector('#shape-button'),
            shapeColorButton: selector('#shape-color-button'),
            strokeRange: new Range(selector('#stroke-range'), 3),
            strokeRangeValue: selector('#stroke-range-value'),
            fillColorpicker: new Colorpicker(selector('#color-fill'), ''),
            strokeColorpicker: new Colorpicker(selector('#color-stroke'), '#ffbb3b')
        };
    }

    addEvent({changeShape, setDrawingShape}) {
        this._btnElement.shapeSelectButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [shapeType] = button.className.match(/(circle|triangle|rect)/);

            event.currentTarget.classList.remove(this.type);
            event.currentTarget.classList.add(shapeType);

            this.type = shapeType;
            setDrawingShape(shapeType);
        });

        this._btnElement.strokeRange.on('change', value => {
            this.options.strokeWidth = parseInt(value, 10);
            this._btnElement.strokeRangeValue.value = parseInt(value, 10);

            changeShape({
                strokeWidth: value
            });

            setDrawingShape(this.type, this.options);
        });

        this._btnElement.fillColorpicker.on('change', value => {
            const color = value.color || 'transparent';
            this.options.fill = color;
            changeShape({
                fill: color
            });
        });

        this._btnElement.strokeColorpicker.on('change', value => {
            const color = value.color || 'transparent';
            this.options.stroke = color;
            changeShape({
                stroke: color
            });
        });
    }
}

