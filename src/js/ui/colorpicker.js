
import snippet from 'tui-code-snippet';
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

class Colorpicker {
    constructor(colorpickerElement, defaultColor = '#7e7e7e') {
        const title = colorpickerElement.getAttribute('title');

        this.show = false;

        this._makePickerButtonElement(colorpickerElement, defaultColor);
        this._makePickerLayerElement(colorpickerElement, title);
        this.color = defaultColor;
        this.picker = tuiColorPicker.create({
            container: this.pickerElement,
            preset: PICKER_COLOR,
            color: defaultColor
        });

        this._addEvent(colorpickerElement);
    }

    _makePickerButtonElement(colorpickerElement, defaultColor) {
        colorpickerElement.classList.add('button');

        this.colorElement = document.createElement('div');
        this.colorElement.className = 'color-picker-value';
        if (defaultColor) {
            this.colorElement.style.backgroundColor = defaultColor;
        } else {
            this.colorElement.classList.add('transparent');
        }
    }

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

    _addEvent(colorpickerElement) {
        this.picker.on('selectColor', value => {
            this.changeColorElement(value.color);
            this.color = value.color;
            this.fire('change', value.color);
        });

        colorpickerElement.addEventListener('click', () => {
            this.show = !this.show;
            const display = this.show ? 'block' : 'none';
            this.pickerControl.style.display = display;
        });
    }

    _setPickerControlPosition() {
        const controlStyle = this.pickerControl.style;
        const top = parseInt(window.getComputedStyle(this.pickerControl, null).height, 10) + 12;
        const left = (parseInt(window.getComputedStyle(this.pickerControl, null).width, 10) / 2) - 20;

        controlStyle.top = `-${top}px`;
        controlStyle.left = `-${left}px`;
    }

    changeColorElement(color) {
        if (color) {
            this.colorElement.classList.remove('transparent');
            this.colorElement.style.backgroundColor = color;
        } else {
            this.colorElement.style.backgroundColor = '#fff';
            this.colorElement.classList.add('transparent');
        }
    }

    setColor(color) {
        this.color = color;
        this.changeColorElement(color);
    }

    getColor() {
        return this.color;
    }
}

snippet.CustomEvents.mixin(Colorpicker);
export default Colorpicker;
