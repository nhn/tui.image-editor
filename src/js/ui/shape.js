import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import shapeHtml from './template/submenu/shape';

/**
 * Shape ui class
 * @class
 */
export default class Shape {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);
        this.type = 'rect';
        this.options = {
            stroke: '#ffbb3b',
            fill: '',
            strokeWidth: 3
        };

        this._el = {
            shapeSelectButton: selector('#shape-button'),
            shapeColorButton: selector('#shape-color-button'),
            strokeRange: new Range(selector('#stroke-range'), {
                realTimeEvent: true,
                min: 0,
                max: 300,
                value: 3
            }),
            strokeRangeValue: selector('#stroke-range-value'),
            fillColorpicker: new Colorpicker(selector('#color-fill'), ''),
            strokeColorpicker: new Colorpicker(selector('#color-stroke'), '#ffbb3b')
        };
    }

    /**
     * Add event for shape
     * @param {Object} actions - actions for shape
     *   @param {Function} changeShape - change shape mode
     *   @param {Function} setDrawingShape - set dreawing shape
     */
    addEvent({changeShape, setDrawingShape}) {
        this._el.shapeSelectButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [shapeType] = button.className.match(/(circle|triangle|rect)/);

            event.currentTarget.classList.remove(this.type);
            event.currentTarget.classList.add(shapeType);

            this.type = shapeType;
            setDrawingShape(shapeType);
        });

        this._el.strokeRange.on('change', value => {
            this.options.strokeWidth = parseInt(value, 10);
            this._el.strokeRangeValue.value = parseInt(value, 10);

            changeShape({
                strokeWidth: value
            });

            setDrawingShape(this.type, this.options);
        });
        this._el.strokeRangeValue.value = this._el.strokeRange.getValue();

        this._el.fillColorpicker.on('change', color => {
            color = color || 'transparent';
            this.options.fill = color;
            changeShape({
                fill: color
            });
        });

        this._el.strokeColorpicker.on('change', color => {
            color = color || 'transparent';
            this.options.stroke = color;
            changeShape({
                stroke: color
            });
        });
    }

    /**
     * Set Shape status
     * @param {Object} options - options of shape status
     *   @param {string} strokeWidth - stroke width
     *   @param {string} strokeColor - stroke color
     *   @param {string} fillColor - fill color
     */
    setShapeStatus({strokeWidth, strokeColor, fillColor}) {
        this._el.strokeRange.setValue(strokeWidth);
        this._el.strokeColorpicker.setColor(strokeColor);
        this._el.fillColorpicker.setColor(fillColor);
        this.options.stroke = strokeColor;
        this.options.fill = fillColor;
        this.options.strokeWidth = strokeWidth;
    }

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @private
     */
    _makeSubMenuElement(subMenuElement) {
        const shapeSubMenu = document.createElement('div');
        shapeSubMenu.className = 'shape';
        shapeSubMenu.innerHTML = shapeHtml;

        subMenuElement.appendChild(shapeSubMenu);
    }
}

