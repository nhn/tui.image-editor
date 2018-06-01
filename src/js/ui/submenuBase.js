/**
 * Submenu Base Class
 * @class
 */
export default class Submenu {
    constructor(subMenuElement, {name, iconStyle, templateHtml}) {
        this.selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement, {
            name,
            iconStyle,
            templateHtml
        });
    }

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @param {Object} iconStyle -  icon style
     * @private
     */
    _makeSubMenuElement(subMenuElement, {name, iconStyle, templateHtml}) {
        const iconSubMenu = document.createElement('div');
        iconSubMenu.className = name;
        iconSubMenu.innerHTML = templateHtml({iconStyle});

        subMenuElement.appendChild(iconSubMenu);
    }
}
