import snippet from 'tui-code-snippet';
import Colorpicker from './tools/colorpicker';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/icon';
import {isSupportFileApi} from '../util';
import {defaultIconPath} from '../consts';

/**
 * Icon ui class
 * @class
 */
export default class Icon extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'icon',
            iconStyle,
            templateHtml
        });

        this.iconType = null;
        this._iconMap = {};

        this._el = {
            registIconButton: this.selector('#icon-image-file'),
            addIconButton: this.selector('#icon-add-button'),
            iconColorpicker: new Colorpicker(this.selector('#icon-color'))
        };
    }

    /**
     * Add event for icon
     * @param {Object} actions - actions for icon
     *   @param {Function} actions.registCustomIcon - register icon
     *   @param {Function} actions.addIcon - add icon
     *   @param {Function} actions.changeColor - change icon color
     */
    addEvent(actions) {
        this.actions = actions;
        const {registCustomIcon, addIcon, changeColor} = actions;

        this._el.iconColorpicker.on('change', color => {
            color = color || 'transparent';
            changeColor(color);
        });

        this._el.registIconButton.addEventListener('change', event => {
            let imgUrl;

            if (!isSupportFileApi) {
                alert('This browser does not support file-api');
            }

            const [file] = event.target.files;

            if (file) {
                imgUrl = URL.createObjectURL(file);
                registCustomIcon(imgUrl, file);
            }
        });

        this._el.addIconButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const iconType = button.getAttribute('data-icontype');
            this._el.addIconButton.classList.remove(this.iconType);
            this._el.addIconButton.classList.add(iconType);

            this.iconType = iconType;
            addIcon(iconType);
        });
    }

    /**
     * Clear icon type
     */
    clearIconType() {
        this._el.addIconButton.classList.remove(this.iconType);
        this.iconType = null;
    }

    /**
     * Register default icon
     */
    registDefaultIcon() {
        snippet.forEach(defaultIconPath, (path, type) => {
            this.actions.registDefalutIcons(type, path);
        });
    }
}
