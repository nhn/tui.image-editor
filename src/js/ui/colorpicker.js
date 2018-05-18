
import snippet from 'tui-code-snippet';
import tuiColorPicker from 'tui-color-picker';

class Colorpicker {
    constructor(colorpickerElement, defaultColor = '#7e7e7e') {
        this.show = false;

        /* draw button element */
        colorpickerElement.classList.add('button');
        const title = colorpickerElement.getAttribute('title');

        this.colorElement = document.createElement('div');
        this.colorElement.className = 'color-picker-value';
        if (defaultColor) {
            this.colorElement.style.backgroundColor = defaultColor;
        } else {
            this.colorElement.classList.add('transparent');
        }

        const label = document.createElement('label');
        label.innerHTML = title;

        /* draw picker element */
        this.pickerControl = document.createElement('div');
        this.pickerControl.className = 'color-picker-control';

        this.pickerElement = document.createElement('div');
        this.pickerElement.className = 'color-picker';
        const triangle = document.createElement('div');
        triangle.className = 'triangle';

        this.pickerControl.appendChild(this.pickerElement);
        this.pickerControl.appendChild(triangle);

        colorpickerElement.appendChild(this.pickerControl);
        colorpickerElement.appendChild(this.colorElement);
        colorpickerElement.appendChild(label);

        this.pickerControl.style.top = `${(parseInt(window.getComputedStyle(this.pickerControl, null).height, 10) + 12) * -1}px`;
        this.pickerControl.style.left = `${((parseInt(window.getComputedStyle(this.pickerControl, null).width, 10) / 2) - 20) * -1}px`;
        this.picker = tuiColorPicker.create({
            container: this.pickerElement,
            preset: [
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
            ],
            color: defaultColor
        });

        this.picker.on('selectColor', value => {
            this.changeColorElement(value.color);
            this.fire('change', value);
        });

        colorpickerElement.addEventListener('click', () => {
            this.show = !this.show;
            const display = this.show ? 'block' : 'none';

            this.pickerControl.style.display = display;
        });
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
        this.changeColorElement(color);
    }

    getColor() {
        return this.picker.getColor();
    }
}

snippet.CustomEvents.mixin(Colorpicker);
export default Colorpicker;
