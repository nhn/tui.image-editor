import snippet from 'tui-code-snippet';
import Colorpicker from './colorpicker';
import Range from './range';
import filterHtml from '../template/submenu/filter';

const FILTER_OPTIONS = [
    'grayscale',
    'invert',
    'sepia',
    'sepia2',
    'blur',
    'sharpen',
    'emboss',
    'remove-white',
    'gradient-transparency',
    'brightness',
    'noise',
    'pixelate',
    'color-filter',
    'tint',
    'multiply',
    'blend'
];

export default class Filter {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.checkedMap = {};
        this.selector = selector;
        this._makeSubMenuElement(subMenuElement);
        this._el = {
            thresholdRange: new Range(selector('#threshold-range'), 0),
            distanceRange: new Range(selector('#distance-range'), 0),
            gradientTransparencyRange: new Range(selector('#gradient-transparency-range'), 0),
            brightnessRange: new Range(selector('#brightness-range'), 0),
            noiseRange: new Range(selector('#noise-range'), 0),
            pixelateRange: new Range(selector('#pixelate-range'), 0),
            colorfilterThresholeRange: new Range(selector('#colorfilter-threshole-range'), 0),
            filterTinyColor: new Colorpicker(selector('#filter-tiny-color'), ''),
            filterMultiplyColor: new Colorpicker(selector('#filter-multiply-color'), '#ffbb3b'),
            filterBlendColor: new Colorpicker(selector('#filter-blend-color'), '#ffbb3b')
        };
        this._el.tintOpacity = this._pickerWithRange(this._el.filterTinyColor.pickerControl);
        this._el.blendType = this._pickerWithSelectbox(this._el.filterBlendColor.pickerControl);
    }

    _makeSubMenuElement(subMenuElement) {
        const filterSubMenu = document.createElement('div');
        filterSubMenu.className = 'filter';
        filterSubMenu.innerHTML = filterHtml;

        subMenuElement.appendChild(filterSubMenu);
    }

    _pickerWithRange(pickerControl) {
        const rangeWrap = document.createElement('div');
        const rangelabel = document.createElement('label');
        const range = document.createElement('div');

        range.id = 'filter-tint-opacity';
        range.title = 'Opacity';
        rangeWrap.appendChild(rangelabel);
        rangeWrap.appendChild(range);
        pickerControl.appendChild(rangeWrap);
        pickerControl.style.height = '130px';

        return new Range(range);
    }

    _pickerWithSelectbox(pickerControl) {
        const selectlistWrap = document.createElement('div');
        const selectlist = document.createElement('select');
        selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
        selectlistWrap.appendChild(selectlist);

        this.getSelectOptionList(selectlist);

        pickerControl.appendChild(selectlistWrap);
        pickerControl.style.height = '130px';

        return selectlist;
    }

    getSelectOptionList(selectlist) {
        const blendOptions = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken'];
        snippet.forEach(blendOptions, option => {
            const selectOption = document.createElement('option');
            selectOption.setAttribute('value', option);
            selectOption.innerHTML = option.replace(/^[a-z]/, $0 => $0.toUpperCase());
            selectlist.appendChild(selectOption);
        });
    }

    toCamelCase(targetId) {
        return targetId.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
    }

    getFilterOption(type) {
        let option = null;
        switch (type) {
            case 'blend':
                option = {
                    color: this._el.filterBlendColor.getColor(),
                    mode: this._el.blendType.value
                };
                break;
            default:
                option = null;
                break;
        }

        return option;
    }

    addEvent({applyFilter}) {
        snippet.forEach(FILTER_OPTIONS, filterName => {
            const filterCheckElement = this.selector(`#${filterName}`);
            this.checkedMap[filterName] = filterCheckElement;
            filterCheckElement.addEventListener('change', event => {
                const apply = event.target.checked;
                const type = this.toCamelCase(event.target.id);
                applyFilter(apply, type, this.getFilterOption(type));
            });
        });

        this._el.blendType.addEventListener('click', event => {
            event.stopPropagation();
        });

        this._el.blendType.addEventListener('change', () => {
            const apply = this.checkedMap.blend.checked;
            const type = 'blend';

            applyFilter(apply, type, this.getFilterOption(type));
        });
    }
}
