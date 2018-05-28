import snippet from 'tui-code-snippet';
import Colorpicker from './colorpicker';
import iconHtml from '../template/submenu/icon';

/**
 * Icon ui class
 * @class
 */
export default class Icon {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);
        this.iconType = null;
        this._iconMap = {};

        this._el = {
            registIconButton: selector('#icon-image-file'),
            addIconButton: selector('#icon-add-button'),
            iconColorpicker: new Colorpicker(selector('#icon-color'))
        };
    }

    /**
     * Add event for icon
     * @param {Object} actions - actions for icon
     *   @param {Function} registCustomIcon - register icon
     *   @param {Function} addIcon - add icon
     *   @param {Function} changeColor - change icon color
     */
    addEvent(actions) {
        this.actions = actions;
        const {registCustomIcon, addIcon, changeColor} = actions;

        this._el.iconColorpicker.on('change', color => {
            color = color || 'transparent';
            changeColor(color);
        });

        this._el.registIconButton.addEventListener('change', event => {
            const supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
            let imgUrl;

            if (!supportingFileAPI) {
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
        const defaultIcons = {
            'icon-arrow': 'M40 12V0l24 24-24 24V36H0V12h40z',
            'icon-arrow-2': 'M49,32 H3 V22 h46 l-18,-18 h12 l23,23 L43,50 h-12 l18,-18  z ',
            'icon-arrow-3': 'M43.349998,27 L17.354,53 H1.949999 l25.996,-26 L1.949999,1 h15.404 L43.349998,27  z ',
            'icon-star': 'M35,54.557999 l-19.912001,10.468 l3.804,-22.172001 l-16.108,-15.7 l22.26,-3.236 L35,3.746 l9.956,20.172001 l22.26,3.236 l-16.108,15.7 l3.804,22.172001  z ',
            'icon-star-2': 'M17,31.212 l-7.194,4.08 l-4.728,-6.83 l-8.234,0.524 l-1.328,-8.226 l-7.644,-3.14 l2.338,-7.992 l-5.54,-6.18 l5.54,-6.176 l-2.338,-7.994 l7.644,-3.138 l1.328,-8.226 l8.234,0.522 l4.728,-6.83 L17,-24.312 l7.194,-4.08 l4.728,6.83 l8.234,-0.522 l1.328,8.226 l7.644,3.14 l-2.338,7.992 l5.54,6.178 l-5.54,6.178 l2.338,7.992 l-7.644,3.14 l-1.328,8.226 l-8.234,-0.524 l-4.728,6.83  z ',
            'icon-polygon': 'M3,31 L19,3 h32 l16,28 l-16,28 H19  z ',
            'icon-location': 'M24 62C8 45.503 0 32.837 0 24 0 10.745 10.745 0 24 0s24 10.745 24 24c0 8.837-8 21.503-24 38zm0-28c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z',
            'icon-heart': 'M49.994999,91.349998 l-6.96,-6.333 C18.324001,62.606995 2.01,47.829002 2.01,29.690998 C2.01,14.912998 13.619999,3.299999 28.401001,3.299999 c8.349,0 16.362,5.859 21.594,12 c5.229,-6.141 13.242001,-12 21.591,-12 c14.778,0 26.390999,11.61 26.390999,26.390999 c0,18.138 -16.314001,32.916 -41.025002,55.374001 l-6.96,6.285  z ',
            'icon-bubble': 'M44 48L34 58V48H12C5.373 48 0 42.627 0 36V12C0 5.373 5.373 0 12 0h40c6.627 0 12 5.373 12 12v24c0 6.627-5.373 12-12 12h-8z'
        };
        snippet.forEach(defaultIcons, (path, type) => {
            this.actions.registDefalutIcons(type, path);
        });
    }

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @private
     */
    _makeSubMenuElement(subMenuElement) {
        const iconSubMenu = document.createElement('div');
        iconSubMenu.className = 'icon';
        iconSubMenu.innerHTML = iconHtml;

        subMenuElement.appendChild(iconSubMenu);
    }
}
