import {extend, forEach} from 'tui-code-snippet';
import {styleLoad} from '../../util';
import style from '../template/style';
import standardTheme from './standard';

/**
 * Theme manager
 * @class
 * @param {Object} customTheme - custom theme
 * @ignore
 */
class Theme {
    constructor(customTheme) {
        this.styles = this._changeToObject(extend(standardTheme, customTheme));
        styleLoad(this._styleMaker());
    }

    /**
     * Get a Style cssText or StyleObject
     * @param {string} type - style type
     * @returns {string|object} - cssText or StyleObject
     */
    getStyle(type) { // eslint-disable-line
        let result = null;
        const firstProperty = type.replace(/\..+$/, '');
        const option = this.styles[type];
        switch (type) {
            case 'common.bi':
                result = this.styles[type].image;
                break;
            case 'menu.icon':
            case 'submenu.icon':
                result = {
                    active: this.styles[`${firstProperty}.activeIcon`],
                    normal: this.styles[`${firstProperty}.normalIcon`],
                    hover: this.styles[`${firstProperty}.hoverIcon`],
                    disabled: this.styles[`${firstProperty}.disabledIcon`]
                };
                break;
            case 'submenu.label':
                result = {
                    active: this._makeCssText(this.styles[`${firstProperty}.activeLabel`]),
                    normal: this._makeCssText(this.styles[`${firstProperty}.normalLabel`])
                };
                break;
            case 'submenu.partition':
                result = {
                    vertical: this._makeCssText(extend({}, option, {borderLeft: `1px solid ${option.color}`})),
                    horizontal: this._makeCssText(extend({}, option, {borderBottom: `1px solid ${option.color}`}))
                };
                break;

            case 'range.disabledPointer':
            case 'range.disabledBar':
            case 'range.disabledSubbar':
            case 'range.pointer':
            case 'range.bar':
            case 'range.subbar':
                option.backgroundColor = option.color;
                result = this._makeCssText(option);
                break;
            default:
                result = this._makeCssText(option);
                break;
        }

        return result;
    }

    /**
     * Make css resource
     * @returns {string} - serialized css text
     * @private
     */
    _styleMaker() {
        const submenuLabelStyle = this.getStyle('submenu.label');
        const submenuPartitionStyle = this.getStyle('submenu.partition');

        return style({
            subMenuLabelActive: submenuLabelStyle.active,
            subMenuLabelNormal: submenuLabelStyle.normal,
            submenuPartitionVertical: submenuPartitionStyle.vertical,
            submenuPartitionHorizontal: submenuPartitionStyle.horizontal,
            biSize: this.getStyle('common.bisize'),
            subMenuRangeTitle: this.getStyle('range.title'),
            submenuRangePointer: this.getStyle('range.pointer'),
            submenuRangeBar: this.getStyle('range.bar'),
            submenuRangeSubbar: this.getStyle('range.subbar'),

            submenuDisabledRangePointer: this.getStyle('range.disabledPointer'),
            submenuDisabledRangeBar: this.getStyle('range.disabledBar'),
            submenuDisabledRangeSubbar: this.getStyle('range.disabledSubbar'),

            submenuRangeValue: this.getStyle('range.value'),
            submenuColorpickerTitle: this.getStyle('colorpicker.title'),
            submenuColorpickerButton: this.getStyle('colorpicker.button'),
            submenuCheckbox: this.getStyle('checkbox'),
            menuIconSize: this.getStyle('menu.iconSize'),
            submenuIconSize: this.getStyle('submenu.iconSize')
        });
    }

    /**
     * Change to low dimensional object.
     * @param {object} styleOptions - style object of user interface
     * @returns {object} low level object for style apply
     * @private
     */
    _changeToObject(styleOptions) {
        const styleObject = {};
        forEach(styleOptions, (value, key) => {
            const keyExplode = key.match(/^(.+)\.([a-z]+)$/i);
            const [, property, subProperty] = keyExplode;

            if (!styleObject[property]) {
                styleObject[property] = {};
            }
            styleObject[property][subProperty] = value;
        });

        return styleObject;
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

export default Theme;
