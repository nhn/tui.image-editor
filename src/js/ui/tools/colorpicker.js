import snippet from 'tui-code-snippet';
import {toInteger} from '../../util';
import tuiColorPicker from 'tui-color-picker';
const PICKER_COLOR = [
    '#000000',
    '#2a2a2a',
    '#545454',
    '#7e7e7e',
    '#a8a8a8',
    '#d2d2d2',
    '#ffffff',
    '',
    '#ff4040',
    '#ff6518',
    '#ffbb3b',
    '#03bd9e',
    '#00a9ff',
    '#515ce6',
    '#9e5fff',
    '#ff5583'
];

/**
 * Colorpicker control class
 * @class
 * @ignore
 */
class Colorpicker {
    constructor(colorpickerElement, defaultColor = '#7e7e7e') {
        const title = colorpickerElement.getAttribute('title');

        this._show = false;

        this._makePickerButtonElement(colorpickerElement, defaultColor);
        this._makePickerLayerElement(colorpickerElement, title);
        this._color = defaultColor;
        this.picker = tuiColorPicker.create({
            container: this.pickerElement,
            preset: PICKER_COLOR,
            color: defaultColor
        });

        this._addEvent(colorpickerElement);
    }

    /**
     * Get color
     * @returns {Number} color value
     */
    get color() {
        return this._color;
    }

    /**
     * Set color
     * @param {string} color color value
     */
    set color(color) {
        this._color = color;
        this._changeColorElement(color);
    }

    /**
     * Change color element
     * @param {string} color color value
     * #private
     */
    _changeColorElement(color) {
        if (color) {
            this.colorElement.classList.remove('transparent');
            this.colorElement.style.backgroundColor = color;
        } else {
            this.colorElement.style.backgroundColor = '#fff';
            this.colorElement.classList.add('transparent');
        }
    }

    /**
     * Make picker button element
     * @param {HTMLElement} colorpickerElement color picker element
     * @param {string} defaultColor color value
     * @private
     */
    _makePickerButtonElement(colorpickerElement, defaultColor) {
        colorpickerElement.classList.add('tui-image-editor-button');

        this.colorElement = document.createElement('div');
        this.colorElement.className = 'color-picker-value';
        if (defaultColor) {
            this.colorElement.style.backgroundColor = defaultColor;
        } else {
            this.colorElement.classList.add('transparent');
        }
    }

    /**
     * Make picker layer element
     * @param {HTMLElement} colorpickerElement color picker element
     * @param {string} title picker title
     * @private
     */
    _makePickerLayerElement(colorpickerElement, title) {
        const label = document.createElement('label');
        const triangle = document.createElement('div');

        this.pickerControl = document.createElement('div');
        this.pickerControl.className = 'color-picker-control';

        this.pickerElement = document.createElement('div');
        this.pickerElement.className = 'color-picker';

        label.innerHTML = title;
        triangle.className = 'triangle';

        this.pickerControl.appendChild(this.pickerElement);
        this.pickerControl.appendChild(triangle);

        colorpickerElement.appendChild(this.pickerControl);
        colorpickerElement.appendChild(this.colorElement);
        colorpickerElement.appendChild(label);

        this._setPickerControlPosition();
    }

    /**
     * Add event
     * @param {HTMLElement} colorpickerElement color picker element
     * @private
     */
    _addEvent(colorpickerElement) {
        this.picker.on('selectColor', value => {
            this._changeColorElement(value.color);
            this._color = value.color;
            this.fire('change', value.color);
        });
        colorpickerElement.addEventListener('click', event => {
            this._show = !this._show;
            this.pickerControl.style.display = this._show ? 'block' : 'none';
            event.stopPropagation();
        });
        document.body.addEventListener('click', () => {
            this._show = false;
            this.pickerControl.style.display = 'none';
        });
    }

    /**
     * Set picker control position
     * @private
     */
    _setPickerControlPosition() {
        const controlStyle = this.pickerControl.style;
        const top = toInteger(window.getComputedStyle(this.pickerControl, null).height) + 12;
        const left = (toInteger(window.getComputedStyle(this.pickerControl, null).width) / 2) - 20;

        controlStyle.top = `-${top}px`;
        controlStyle.left = `-${left}px`;
    }
}

snippet.CustomEvents.mixin(Colorpicker);
export default Colorpicker;
