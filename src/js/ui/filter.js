import snippet from 'tui-code-snippet';
import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/filter';
import {toInteger, toCamelCase} from '../util';

const BLEND_OPTIONS = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken'];
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

/**
 * Filter ui class
 * @class
 */
export default class Filter extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'filter',
            iconStyle,
            templateHtml
        });

        this.checkedMap = {};
        this._makeControlElement();
    }

    /**
     * Add event for filter
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.applyFilter - apply filter option
     */
    addEvent({applyFilter}) {
        const changeRangeValue = filterName => {
            const apply = this.checkedMap[filterName].checked;
            const type = filterName;

            applyFilter(apply, type, this._getFilterOption(type));
        };

        snippet.forEach(FILTER_OPTIONS, filterName => {
            const filterCheckElement = this.selector(`#${filterName}`);
            const filterNameCamelCase = toCamelCase(filterName);
            this.checkedMap[filterNameCamelCase] = filterCheckElement;

            filterCheckElement.addEventListener('change', () => changeRangeValue(filterNameCamelCase));
        });

        this._el.removewhiteThresholdRange.on('change', () => changeRangeValue('removeWhite'));
        this._el.removewhiteDistanceRange.on('change', () => changeRangeValue('removeWhite'));
        this._el.gradientTransparencyRange.on('change', () => changeRangeValue('gradientTransparency'));
        this._el.colorfilterThresholeRange.on('change', () => changeRangeValue('colorFilter'));
        this._el.pixelateRange.on('change', () => changeRangeValue('pixelate'));
        this._el.noiseRange.on('change', () => changeRangeValue('noise'));
        this._el.brightnessRange.on('change', () => changeRangeValue('brightness'));
        this._el.blendType.addEventListener('change', () => changeRangeValue('blend'));
        this._el.filterBlendColor.on('change', () => changeRangeValue('blend'));
        this._el.filterMultiplyColor.on('change', () => changeRangeValue('multiply'));
        this._el.tintOpacity.on('change', () => changeRangeValue('tint'));
        this._el.filterTintColor.on('change', () => changeRangeValue('tint'));
        this._el.blendType.addEventListener('click', event => event.stopPropagation());
    }

    /**
     * Get filter option
     * @param {String} type - filter type
     * @returns {Object} filter option object
     * @private
     */
    _getFilterOption(type) { // eslint-disable-line
        const option = {};
        switch (type) {
            case 'removeWhite':
                option.threshold = toInteger(this._el.removewhiteThresholdRange.value);
                option.distance = toInteger(this._el.removewhiteDistanceRange.value);
                break;
            case 'gradientTransparency':
                option.threshold = toInteger(this._el.gradientTransparencyRange.value);
                break;
            case 'colorFilter':
                option.color = '#FFFFFF';
                option.threshold = this._el.colorfilterThresholeRange.value;
                break;
            case 'pixelate':
                option.blocksize = toInteger(this._el.pixelateRange.value);
                break;
            case 'noise':
                option.noise = toInteger(this._el.noiseRange.value);
                break;
            case 'brightness':
                option.brightness = toInteger(this._el.brightnessRange.value);
                break;
            case 'blend':
                option.color = this._el.filterBlendColor.color;
                option.mode = this._el.blendType.value;
                break;
            case 'multiply':
                option.color = this._el.filterMultiplyColor.color;
                break;
            case 'tint':
                option.color = this._el.filterTintColor.color;
                option.opacity = this._el.tintOpacity.value;
                break;
            default:
                break;
        }

        return option;
    }

    /**
     * Make submenu range and colorpicker control
     * @private
     */
    _makeControlElement() {
        const {selector} = this;
        this._el = {
            removewhiteThresholdRange: new Range(selector('#removewhite-threshold-range'), {
                min: 0,
                max: 255,
                value: 60
            }),
            removewhiteDistanceRange: new Range(selector('#removewhite-distance-range'), {
                min: 0,
                max: 255,
                value: 10
            }),
            gradientTransparencyRange: new Range(selector('#gradient-transparency-range'), {
                min: 0,
                max: 255,
                value: 100
            }),
            brightnessRange: new Range(selector('#brightness-range'), {
                min: -255,
                max: 255,
                value: 100
            }),
            noiseRange: new Range(selector('#noise-range'), {
                min: 0,
                max: 1000,
                value: 100
            }),
            pixelateRange: new Range(selector('#pixelate-range'), {
                min: 2,
                max: 20,
                value: 4
            }),
            colorfilterThresholeRange: new Range(selector('#colorfilter-threshole-range'), {
                min: 0,
                max: 255,
                value: 45
            }),
            filterTintColor: new Colorpicker(selector('#filter-tint-color'), '#03bd9e'),
            filterMultiplyColor: new Colorpicker(selector('#filter-multiply-color'), '#515ce6'),
            filterBlendColor: new Colorpicker(selector('#filter-blend-color'), '#ffbb3b')
        };
        this._el.tintOpacity = this._pickerWithRange(this._el.filterTintColor.pickerControl);
        this._el.blendType = this._pickerWithSelectbox(this._el.filterBlendColor.pickerControl);
    }

    /**
     * Make submenu control for picker & range mixin
     * @param {HTMLElement} pickerControl - pickerControl dom element
     * @returns {Range}
     * @private
     */
    _pickerWithRange(pickerControl) {
        const rangeWrap = document.createElement('div');
        const rangelabel = document.createElement('label');
        const range = document.createElement('div');

        range.id = 'filter-tint-opacity';
        rangelabel.innerHTML = 'Opacity';
        rangeWrap.appendChild(rangelabel);
        rangeWrap.appendChild(range);
        pickerControl.appendChild(rangeWrap);
        pickerControl.style.height = '130px';

        return new Range(range, {
            min: 0,
            max: 1,
            value: 0.7
        });
    }

    /**
     * Make submenu control for picker & selectbox
     * @param {HTMLElement} pickerControl - pickerControl dom element
     * @returns {HTMLElement}
     * @private
     */
    _pickerWithSelectbox(pickerControl) {
        const selectlistWrap = document.createElement('div');
        const selectlist = document.createElement('select');

        selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
        selectlistWrap.appendChild(selectlist);

        this._makeSelectOptionList(selectlist);

        pickerControl.appendChild(selectlistWrap);
        pickerControl.style.height = '130px';

        return selectlist;
    }

    /**
     * Make blend select option
     * @param {HTMLElement} selectlist - blend option select list element
     * @private
     */
    _makeSelectOptionList(selectlist) {
        snippet.forEach(BLEND_OPTIONS, option => {
            const selectOption = document.createElement('option');
            selectOption.setAttribute('value', option);
            selectOption.innerHTML = option.replace(/^[a-z]/, $0 => $0.toUpperCase());
            selectlist.appendChild(selectOption);
        });
    }
}
