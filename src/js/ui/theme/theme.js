import {extend, forEach} from 'tui-code-snippet';
import style from '../template//style';
import standardTheme from './standard';

/**
 * Theme manager
 * @class
 * @param {Object} customTheme - custom theme
 */
export default class Theme {
    constructor(customTheme) {
        this.styles = extend(standardTheme, customTheme);
        this._styleLoad(this._styleMaker());
    }

    /**
     * Get a Style cssText or StyleObject
     * @param {string} type - style type
     * @returns {string|object} - cssText or StyleObject
     */
    getStyle(type) { // eslint-disable-line
        const option = this._getTargetOption(type);
        let result = null;

        switch (type) {
            case 'menu.icon':
            case 'submenu.icon':
                result = option;
                break;
            case 'submenu.colorpicker':
                result = {
                    button: this._makeCssText(option.button),
                    title: this._makeCssText(option.title)
                };
                break;
            case 'submenu.range':
                option.pointer.backgroundColor = option.pointer.color;

                result = {
                    pointer: this._makeCssText(option.pointer),
                    title: this._makeCssText(option.title),
                    value: this._makeCssText(option.value)
                };
                break;
            case 'submenu.partition':
                result = {
                    vertical: this._makeCssText(extend({}, option, {borderLeft: `1px solid ${option.color}`})),
                    horizontal: this._makeCssText(extend({}, option, {borderBottom: `1px solid ${option.color}`}))
                };
                break;
            case 'submenu.label':
                result = {
                    normal: this._makeCssText(option.normal),
                    active: this._makeCssText(option.active)
                };
                break;
            default:
                result = this._makeCssText(option);
                break;
        }

        return result;
    }

    /**
     * Apply css resource
     * @param {string} styleBuffer - serialized css text
     * @private
     */
    _styleLoad(styleBuffer) {
        const [head] = document.getElementsByTagName('head');
        const linkElement = document.createElement('link');
        const styleData = encodeURIComponent(styleBuffer);
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', `data:text/css;charset=UTF-8,${styleData}`);
        head.appendChild(linkElement);
    }

    /**
     * Make css resource
     * @returns {string} - serialized css text
     * @private
     */
    _styleMaker() {
        const submenuLabelStyle = this.getStyle('submenu.label');
        const submenuPartitionStyle = this.getStyle('submenu.partition');
        const submenuRangeStyle = this.getStyle('submenu.range');
        const submenuColorpickerStyle = this.getStyle('submenu.colorpicker');

        return style({
            subMenuLabelActive: submenuLabelStyle.active,
            subMenuLabelNormal: submenuLabelStyle.normal,
            subMenuRangeTitle: submenuRangeStyle.title,
            submenuPartitionVertical: submenuPartitionStyle.vertical,
            submenuPartitionHorizontal: submenuPartitionStyle.horizontal,
            submenuRangePointer: submenuRangeStyle.pointer,
            submenuRangeValue: submenuRangeStyle.value,
            submenuColorpickerTitle: submenuColorpickerStyle.title,
            submenuColorpickerButton: submenuColorpickerStyle.button,
            submenuCheckbox: this.getStyle('submenu.checkbox')
        });
    }

    /**
     * Find Target Object for max 2depth
     * @param {string} type - style type
     * @returns {object} - style object
     * @private
     */
    _getTargetOption(type) {
        let option = null;

        if (type.indexOf('.') > -1) {
            const explodeType = type.split('.');
            option = this.styles[explodeType[0]][explodeType[1]];
        } else {
            option = this.styles[type];
        }

        return option;
    }

    /**
     * Style object to Csstext serialize
     * @param {object} styleObject - style object
     * @returns {string} - css text string
     * @private
     */
    _makeCssText(styleObject) {
        const converterStack = [];

        forEach(styleObject, (value, key) => {
            if (typeof value === 'object') {
                return;
            }
            if (['backgroundImage'].indexOf(key) > -1 && value !== 'none') {
                value = `url(${value})`;
            }
            converterStack.push(`${this._toUnderScore(key)}: ${value}`);
        });

        return converterStack.join(';');
    }

    /**
     * Camel key string to Underscore string
     * @param {string} targetString - change target
     * @returns {string}
     * @private
     */
    _toUnderScore(targetString) {
        return targetString.replace(/([A-Z])/g, ($0, $1) => `-${$1.toLowerCase()}`);
    }
}
