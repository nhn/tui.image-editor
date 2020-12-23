import { toCamelCase } from '../util';

/**
 * Menu Panel Class
 * @class
 * @ignore
 */

class Panel {
  /**
   * @param {HTMLElement} menuElement - menu dom element
   * @param {Object} options - menu options
   *   @param {string} options.name - name of panel menu
   *   @param {Locale} options.locale - translate text
   *   @param {Function} options.makeSvgIcon - svg icon generator
   *   @param {*} options.templateHtml - template for MenuPanelElement
   *   @param {boolean} [options.usageStatistics=false] - Use statistics or not
   */
  constructor(menuElement, { name, locale, makeSvgIcon, templateHtml, usageStatistics = false }) {
    this.name = name;
    this.items = [];

    this.panelElement = this._makePanelElement();
    this.listElement = this._makeListElement();
    this.usageStatistics = usageStatistics;
    // this._makeMenuElement({
    //   locale,
    //   name,
    //   makeSvgIcon,
    //   templateHtml,
    // });

    this.panelElement.appendChild(this.listElement);
    menuElement.appendChild(this.panelElement);
  }

  /**
   * Make Panel element
   * @returns {HTMLElement}
   */
  _makePanelElement() {
    const panel = document.createElement('div');
    const panelTitle = document.createElement('div');

    panel.style.backgroundColor = '#171719'; // temp
    panel.style.color = '#fff'; // temp
    panel.style.position = 'absolute'; // temp
    panel.style.border = '1px solid #fff'; // temp
    panel.style.width = '240px'; // temp
    panel.style.height = '270px'; // temp
    panel.style.right = '0'; // temp
    panel.style.bottom = '300px'; // temp
    panel.className = `tie-panel-${this.name}`; // @TODO: className

    panelTitle.innerText = toCamelCase(this.name);
    panelTitle.style.width = '240px'; // temp
    panelTitle.style.height = '30px'; // temp
    panelTitle.style.borderBottom = '1px solid #fff'; // temp
    panelTitle.style.textAlign = 'center'; // temp
    panelTitle.style.lineHeight = '30px'; // temp

    panel.appendChild(panelTitle);

    return panel;
  }

  /**
   * Make list element
   * @returns {HTMLElement} list element
   * @private
   */
  _makeListElement() {
    const list = document.createElement('ol');

    list.style.width = '240px'; // temp
    list.style.height = '240px'; // temp
    list.style.padding = '0'; // temp
    list.style.overflowX = 'hidden'; // temp
    list.style.overflowY = 'scroll'; // temp
    list.style.listStyle = 'none'; // temp

    list.className = `${this.name}`; // @TODO: className

    return list;
  }

  /**
   * Make list item element
   * @param {string} title - title of list item element
   * @returns {HTMLElement} list item element
   */
  makeListItemElement(title) {
    const listItem = document.createElement('li');

    listItem.style.height = '30px'; // temp
    listItem.style.lineHeight = '30px'; // temp
    listItem.style.paddingLeft = '10px'; // temp
    listItem.style.textAlign = 'left'; // temp

    listItem.innerHTML = `<span>${title}</span>`; // @TODO : change to makeSvg function
    listItem.className = `${this.name}-item ${this.name}-${title}`; // @TODO : change to makeSvg function
    listItem.setAttribute('data-index', this.items.length);

    return listItem;
  }

  /**
   * Push list item element
   * @param {HTMLElement} item - list item element to add to the list
   */
  pushListItemElement(item) {
    this.listElement.appendChild(item);
    this.items.push(item);
  }

  /**
   * Delete list item element
   * @param {number} start - start index to delete
   * @param {number} end - end index to delete
   */
  deleteListItemElement(start, end) {
    const { items } = this;

    for (let i = start; i < end; i += 1) {
      this.listElement.removeChild(items[i]);
    }
    items.splice(start, end - start + 1);
  }

  /**
   * Get list's length
   * @returns {number}
   */
  getListLength() {
    return this.items.length;
  }

  /**
   * Add class name of item
   * @param {number} index - index of item
   * @param {string} className - class name to add
   */
  addClass(index, className) {
    this.items[index].classList.add(className);
  }

  /**
   * Remove class name of item
   * @param {number} index - index of item
   * @param {string} className - class name to remove
   */
  removeClass(index, className) {
    this.items[index].classList.remove(className);
  }

  /**
   * Toggle class name of item
   * @param {number} index - index of item
   * @param {string} className - class name to remove
   */
  toggleClass(index, className) {
    this.items[index].classList.toggle(className);
  }

  /**
   * Make menu dom element
   * @param {Object} options - menu element options
   *   @param {Locale} options.locale - translate text
   *   @param {Object} options.iconStyle -  icon style
   *   @param {Function} options.makeSvgIcon - svg icon generator
   *   @param {*} options.templateHtml - template for SubMenuElement
   * @private
   */
  _makeMenuElement({ locale, iconStyle, makeSvgIcon, templateHtml }) {
    const iconSubMenu = document.createElement('div');
    iconSubMenu.className = `tui-image-editor-menu-${this.name}`;
    iconSubMenu.innerHTML = templateHtml({
      locale,
      iconStyle,
      makeSvgIcon,
    });

    this.panelElement.appendChild(iconSubMenu);
  }
}

export default Panel;
