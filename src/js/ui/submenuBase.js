/**
 * Submenu Base Class
 * @class
 * @ignore
 */
class Submenu {
    /**
     * @param {HTMLElement} subMenuElement - submenu dom element
     * @param {Locale} locale - translate text
     * @param {string} name - name of sub menu
     * @param {Object} iconStyle - style of icon
     * @param {string} menuBarPosition - position of menu
     * @param {*} templateHtml - template for SubMenuElement
     * @param {boolean} [usageStatistics=false] - template for SubMenuElement
     */
    constructor(subMenuElement, {locale, name, iconStyle, menuBarPosition, templateHtml, usageStatistics}) {
        this.subMenuElement = subMenuElement;
        this.menuBarPosition = menuBarPosition;
        this.toggleDirection = menuBarPosition === 'top' ? 'down' : 'up';
        this.colorPickerControls = [];
        this.usageStatistics = usageStatistics;
        this._makeSubMenuElement({
            locale,
            name,
            iconStyle,
            templateHtml
        });
    }

    /**
     * editor dom ui query selector
     * @param {string} selectName - query selector string name
     * @returns {HTMLElement}
     */
    selector(selectName) {
        return this.subMenuElement.querySelector(selectName);
    }

    /**
     * change show state change for colorpicker instance
     * @param {Colorpicker} occurredControl - target Colorpicker Instance
     */
    colorPickerChangeShow(occurredControl) {
        this.colorPickerControls.forEach(pickerControl => {
            if (occurredControl !== pickerControl) {
                pickerControl.hide();
            }
        });
    }

    /**
     * Get butten type
     * @param {HTMLElement} button - event target element
     * @param {array} buttonNames - Array of button names
     * @returns {string} - button type
     */
    getButtonType(button, buttonNames) {
        return button.className.match(RegExp(`(${buttonNames.join('|')})`))[0];
    }

    /**
     * Get butten type
     * @param {HTMLElement} target - event target element
     * @param {string} removeClass - remove class name
     * @param {string} addClass - add class name
     */
    changeClass(target, removeClass, addClass) {
        target.classList.remove(removeClass);
        target.classList.add(addClass);
    }

    /**
     * Interface method whose implementation is optional.
     * Returns the menu to its default state.
     */
    changeStandbyMode() {}

    /**
     * Interface method whose implementation is optional.
     * Executed when the menu starts.
     */
    changeStartMode() {}

    /**
     * Make submenu dom element
     * @param {Locale} locale - translate text
     * @param {string} name - submenu name
     * @param {Object} iconStyle -  icon style
     * @param {*} templateHtml - template for SubMenuElement
     * @private
     */
    _makeSubMenuElement({locale, name, iconStyle, templateHtml}) {
        const iconSubMenu = document.createElement('div');
        iconSubMenu.className = `tui-image-editor-menu-${name}`;
        iconSubMenu.innerHTML = templateHtml({
            locale,
            iconStyle
        });

        this.subMenuElement.appendChild(iconSubMenu);
    }
}

export default Submenu;
