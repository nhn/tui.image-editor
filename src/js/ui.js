import snippet from 'tui-code-snippet';
import util from './util';
import mainContainer from './ui/template/mainContainer';
import controls from './ui/template/controls';

import Theme from './ui/theme/theme';
import Shape from './ui/shape';
import Crop from './ui/crop';
import Flip from './ui/flip';
import Rotate from './ui/rotate';
import Text from './ui/text';
import Mask from './ui/mask';
import Icon from './ui/icon';
import Draw from './ui/draw';
import Filter from './ui/filter';
import Locale from './ui/locale/locale';

const SUB_UI_COMPONENT = {
    Shape,
    Crop,
    Flip,
    Rotate,
    Text,
    Mask,
    Icon,
    Draw,
    Filter
};

const BI_EXPRESSION_MINSIZE_WHEN_TOP_POSITION = '1300';

/**
 * Ui class
 * @class
 * @param {string|HTMLElement} element - Wrapper's element or selector
 * @param {Object} [options] - Ui setting options
 *   @param {number} options.loadImage - Init default load image
 *   @param {number} options.initMenu - Init start menu
 *   @param {Boolean} [options.menuBarPosition=bottom] - Let
 *   @param {Boolean} [options.applyCropSelectionStyle=false] - Let
 *   @param {Boolean} [options.usageStatistics=false] - Use statistics or not
 *   @param {Object} [options.uiSize] - ui size of editor
 *     @param {string} options.uiSize.width - width of ui
 *     @param {string} options.uiSize.height - height of ui
 * @param {Object} actions - ui action instance
 */
class Ui {
    constructor(element, options, actions) {
        this.options = this._initializeOption(options);
        this._actions = actions;
        this.submenu = false;
        this.imageSize = {};
        this.uiSize = {};
        this._locale = new Locale(this.options.locale);
        this.theme = new Theme(this.options.theme);

        this._submenuChangeTransection = false;
        this._selectedElement = null;
        this._mainElement = null;
        this._editorElementWrap = null;
        this._editorElement = null;
        this._menuElement = null;
        this._subMenuElement = null;
        this._makeUiElement(element);
        this._setUiSize();
        this._initMenuEvent = false;

        this._els = {
            'undo': this._menuElement.querySelector('#tie-btn-undo'),
            'redo': this._menuElement.querySelector('#tie-btn-redo'),
            'reset': this._menuElement.querySelector('#tie-btn-reset'),
            'delete': this._menuElement.querySelector('#tie-btn-delete'),
            'deleteAll': this._menuElement.querySelector('#tie-btn-delete-all'),
            'download': this._selectedElement.querySelectorAll('.tui-image-editor-download-btn'),
            'load': this._selectedElement.querySelectorAll('.tui-image-editor-load-btn')
        };

        this._makeSubMenu();
    }

    /**
     * Set Default Selection for includeUI
     * @param {Object} option - imageEditor options
     * @returns {Object} - extends selectionStyle option
     * @ignore
     */
    setUiDefaultSelectionStyle(option) {
        return snippet.extend({
            applyCropSelectionStyle: true,
            applyGroupSelectionStyle: true,
            selectionStyle: {
                cornerStyle: 'circle',
                cornerSize: 16,
                cornerColor: '#fff',
                cornerStrokeColor: '#fff',
                transparentCorners: false,
                lineWidth: 2,
                borderColor: '#fff'
            }
        }, option);
    }

    /**
     * Change editor size
     * @param {Object} resizeInfo - ui & image size info
     *   @param {Object} [resizeInfo.uiSize] - image size dimension
     *     @param {string} resizeInfo.uiSize.width - ui width
     *     @param {string} resizeInfo.uiSize.height - ui height
     *   @param {Object} [resizeInfo.imageSize] - image size dimension
     *     @param {Number} resizeInfo.imageSize.oldWidth - old width
     *     @param {Number} resizeInfo.imageSize.oldHeight - old height
     *     @param {Number} resizeInfo.imageSize.newWidth - new width
     *     @param {Number} resizeInfo.imageSize.newHeight - new height
     * @example
     * // Change the image size and ui size, and change the affected ui state together.
     * imageEditor.ui.resizeEditor({
     *     imageSize: {oldWidth: 100, oldHeight: 100, newWidth: 700, newHeight: 700},
     *     uiSize: {width: 1000, height: 1000}
     * });
     * @example
     * // Apply the ui state while preserving the previous attribute (for example, if responsive Ui)
     * imageEditor.ui.resizeEditor();
     */
    resizeEditor({uiSize, imageSize = this.imageSize} = {}) {
        if (imageSize !== this.imageSize) {
            this.imageSize = imageSize;
        }
        if (uiSize) {
            this._setUiSize(uiSize);
        }

        const {width, height} = this._getEditorDimension();
        const editorElementStyle = this._editorElement.style;
        const {menuBarPosition} = this.options;

        editorElementStyle.height = `${height}px`;
        editorElementStyle.width = `${width}px`;

        this._setEditorPosition(menuBarPosition);

        this._editorElementWrap.style.bottom = `0px`;
        this._editorElementWrap.style.top = `0px`;
        this._editorElementWrap.style.left = `0px`;
        this._editorElementWrap.style.width = `100%`;

        const selectElementClassList = this._selectedElement.classList;

        if (menuBarPosition === 'top' && this._selectedElement.offsetWidth < BI_EXPRESSION_MINSIZE_WHEN_TOP_POSITION) {
            selectElementClassList.add('tui-image-editor-top-optimization');
        } else {
            selectElementClassList.remove('tui-image-editor-top-optimization');
        }
    }

    /**
     * Change undo button status
     * @param {Boolean} enableStatus - enabled status
     * @ignore
     */
    changeUndoButtonStatus(enableStatus) {
        if (enableStatus) {
            this._els.undo.classList.add('enabled');
        } else {
            this._els.undo.classList.remove('enabled');
        }
    }

    /**
     * Change redo button status
     * @param {Boolean} enableStatus - enabled status
     * @ignore
     */
    changeRedoButtonStatus(enableStatus) {
        if (enableStatus) {
            this._els.redo.classList.add('enabled');
        } else {
            this._els.redo.classList.remove('enabled');
        }
    }

    /**
     * Change reset button status
     * @param {Boolean} enableStatus - enabled status
     * @ignore
     */
    changeResetButtonStatus(enableStatus) {
        if (enableStatus) {
            this._els.reset.classList.add('enabled');
        } else {
            this._els.reset.classList.remove('enabled');
        }
    }

    /**
     * Change delete-all button status
     * @param {Boolean} enableStatus - enabled status
     * @ignore
     */
    changeDeleteAllButtonEnabled(enableStatus) {
        if (enableStatus) {
            this._els.deleteAll.classList.add('enabled');
        } else {
            this._els.deleteAll.classList.remove('enabled');
        }
    }

    /**
     * Change delete button status
     * @param {Boolean} enableStatus - enabled status
     * @ignore
     */
    changeDeleteButtonEnabled(enableStatus) {
        if (enableStatus) {
            this._els['delete'].classList.add('enabled');
        } else {
            this._els['delete'].classList.remove('enabled');
        }
    }

    /**
     * Change delete button status
     * @param {Object} [options] - Ui setting options
     *   @param {object} [options.loadImage] - Init default load image
     *   @param {string} [options.initMenu] - Init start menu
     *   @param {string} [options.menuBarPosition=bottom] - Let
     *   @param {boolean} [options.applyCropSelectionStyle=false] - Let
     *   @param {boolean} [options.usageStatistics=false] - Send statistics ping or not
     * @returns {Object} initialize option
     * @private
     */
    _initializeOption(options) {
        return snippet.extend({
            loadImage: {
                path: '',
                name: ''
            },
            locale: {},
            menuIconPath: '',
            menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
            initMenu: '',
            uiSize: {
                width: '100%',
                height: '100%'
            },
            menuBarPosition: 'bottom'
        }, options);
    }

    /**
     * Set ui container size
     * @param {Object} uiSize - ui dimension
     *   @param {string} uiSize.width - css width property
     *   @param {string} uiSize.height - css height property 
     * @private
     */
    _setUiSize(uiSize = this.options.uiSize) {
        const elementDimension = this._selectedElement.style;
        elementDimension.width = uiSize.width;
        elementDimension.height = uiSize.height;
    }

    /**
     * Make submenu dom element
     * @private
     */
    _makeSubMenu() {
        snippet.forEach(this.options.menu, menuName => {
            const SubComponentClass = SUB_UI_COMPONENT[menuName.replace(/^[a-z]/, $0 => $0.toUpperCase())];

            // make menu element
            this._makeMenuElement(menuName);

            // menu btn element
            this._els[menuName] = this._menuElement.querySelector(`#tie-btn-${menuName}`);

            // submenu ui instance
            this[menuName] = new SubComponentClass(this._subMenuElement, {
                locale: this._locale,
                iconStyle: this.theme.getStyle('submenu.icon'),
                menuBarPosition: this.options.menuBarPosition,
                usageStatistics: this.options.usageStatistics
            });
        });
    }

    /**
     * Make primary ui dom element
     * @param {string|HTMLElement} element - Wrapper's element or selector
     * @private
     */
    _makeUiElement(element) {
        let selectedElement;

        window.snippet = snippet;

        if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }
        const selector = util.getSelector(selectedElement);

        selectedElement.classList.add('tui-image-editor-container');
        selectedElement.innerHTML = controls({
            locale: this._locale,
            biImage: this.theme.getStyle('common.bi'),
            iconStyle: this.theme.getStyle('menu.icon'),
            loadButtonStyle: this.theme.getStyle('loadButton'),
            downloadButtonStyle: this.theme.getStyle('downloadButton')
        }) +
        mainContainer({
            locale: this._locale,
            biImage: this.theme.getStyle('common.bi'),
            commonStyle: this.theme.getStyle('common'),
            headerStyle: this.theme.getStyle('header'),
            loadButtonStyle: this.theme.getStyle('loadButton'),
            downloadButtonStyle: this.theme.getStyle('downloadButton'),
            submenuStyle: this.theme.getStyle('submenu')
        });

        this._selectedElement = selectedElement;
        this._selectedElement.classList.add(this.options.menuBarPosition);

        this._mainElement = selector('.tui-image-editor-main');
        this._editorElementWrap = selector('.tui-image-editor-wrap');
        this._editorElement = selector('.tui-image-editor');
        this._menuElement = selector('.tui-image-editor-menu');
        this._subMenuElement = selector('.tui-image-editor-submenu');
    }

    /**
     * Make menu ui dom element
     * @param {string} menuName - menu name
     * @private
     */
    _makeMenuElement(menuName) {
        const btnElement = document.createElement('li');
        const {normal, active, hover} = this.theme.getStyle('menu.icon');
        const menuItemHtml = `
            <svg class="svg_ic-menu">
                <use xlink:href="${normal.path}#${normal.name}-ic-${menuName}" class="normal"/>
                <use xlink:href="${active.path}#${active.name}-ic-${menuName}" class="active"/>
                <use xlink:href="${hover.path}#${hover.name}-ic-${menuName}" class="hover"/>
            </svg>
        `;

        btnElement.id = `tie-btn-${menuName}`;
        btnElement.className = 'tui-image-editor-item normal';
        btnElement.setAttribute('tooltip-content', this._locale.localize(menuName.replace(/^[a-z]/g, $0 => $0.toUpperCase())));
        btnElement.innerHTML = menuItemHtml;

        this._menuElement.appendChild(btnElement);
    }

    /**
     * Add help action event
     * @param {string} helpName - help menu name
     * @private
     */
    _addHelpActionEvent(helpName) {
        this._els[helpName].addEventListener('click', () => {
            this._actions.main[helpName]();
        });
    }

    /**
     * Add download event
     * @private
     */
    _addDownloadEvent() {
        snippet.forEach(this._els.download, element => {
            element.addEventListener('click', () => {
                this._actions.main.download();
            });
        });
    }

    /**
     * Add load event
     * @private
     */
    _addLoadEvent() {
        snippet.forEach(this._els.load, element => {
            element.addEventListener('change', event => {
                this._actions.main.load(event.target.files[0]);
            });
        });
    }

    /**
     * Add menu event
     * @param {string} menuName - menu name
     * @private
     */
    _addMenuEvent(menuName) {
        this._els[menuName].addEventListener('click', () => {
            this.changeMenu(menuName);
        });
    }

    /**
     * Add menu event
     * @param {string} menuName - menu name
     * @private
     */
    _addSubMenuEvent(menuName) {
        this[menuName].addEvent(this._actions[menuName]);
    }

    /**
     * get editor area element
     * @returns {HTMLElement} editor area html element
     * @ignore
     */
    getEditorArea() {
        return this._editorElement;
    }

    /**
     * Add event for menu items
     * @ignore
     */
    activeMenuEvent() {
        if (this._initMenuEvent) {
            return;
        }

        this._addHelpActionEvent('undo');
        this._addHelpActionEvent('redo');
        this._addHelpActionEvent('reset');
        this._addHelpActionEvent('delete');
        this._addHelpActionEvent('deleteAll');

        this._addDownloadEvent();

        snippet.forEach(this.options.menu, menuName => {
            this._addMenuEvent(menuName);
            this._addSubMenuEvent(menuName);
        });
        this._initMenu();
        this._initMenuEvent = true;
    }

    /**
     * Init canvas
     * @ignore
     */
    initCanvas() {
        const loadImageInfo = this._getLoadImage();
        if (loadImageInfo.path) {
            this._actions.main.initLoadImage(loadImageInfo.path, loadImageInfo.name).then(() => {
                this.activeMenuEvent();
            });
        }

        this._addLoadEvent();

        const gridVisual = document.createElement('div');
        gridVisual.className = 'tui-image-editor-grid-visual';
        const grid = `<table>
           <tr><td class="dot left-top"></td><td></td><td class="dot right-top"></td></tr>
           <tr><td></td><td></td><td></td></tr>
           <tr><td class="dot left-bottom"></td><td></td><td class="dot right-bottom"></td></tr>
         </table>`;
        gridVisual.innerHTML = grid;
        this._editorContainerElement = this._editorElement.querySelector('.tui-image-editor-canvas-container');
        this._editorContainerElement.appendChild(gridVisual);
    }

    /**
     * get editor area element
     * @returns {Object} load image option
     * @private
     */
    _getLoadImage() {
        return this.options.loadImage;
    }

    /**
     * change menu
     * @param {string} menuName - menu name
     * @param {boolean} toggle - whether toogle or not
     * @param {boolean} discardSelection - discard selection
     * @ignore
     */
    changeMenu(menuName, toggle = true, discardSelection = true) {
        if (!this._submenuChangeTransection) {
            this._submenuChangeTransection = true;
            this._changeMenu(menuName, toggle, discardSelection);
            this._submenuChangeTransection = false;
        }
    }

    /**
     * change menu
     * @param {string} menuName - menu name
     * @param {boolean} toggle - whether toogle or not
     * @param {boolean} discardSelection - discard selection
     * @private
     */
    _changeMenu(menuName, toggle, discardSelection) {
        if (this.submenu) {
            this._els[this.submenu].classList.remove('active');
            this._mainElement.classList.remove(`tui-image-editor-menu-${this.submenu}`);
            if (discardSelection) {
                this._actions.main.discardSelection();
            }
            this._actions.main.changeSelectableAll(true);
            this[this.submenu].changeStandbyMode();
        }

        if (this.submenu === menuName && toggle) {
            this.submenu = null;
        } else {
            this._els[menuName].classList.add('active');
            this._mainElement.classList.add(`tui-image-editor-menu-${menuName}`);
            this.submenu = menuName;
            this[this.submenu].changeStartMode();
        }

        this.resizeEditor();
    }

    /**
     * Init menu
     * @private
     */
    _initMenu() {
        if (this.options.initMenu) {
            const evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, false);
            this._els[this.options.initMenu].dispatchEvent(evt);
        }

        if (this.icon) {
            this.icon.registDefaultIcon();
        }
    }

    /**
     * Get editor dimension
     * @returns {Object} - width & height of editor
     * @private
     */
    _getEditorDimension() {
        const maxHeight = parseFloat(this._editorContainerElement.style.maxHeight);
        const height = (this.imageSize.newHeight > maxHeight) ? maxHeight : this.imageSize.newHeight;

        const maxWidth = parseFloat(this._editorContainerElement.style.maxWidth);
        const width = (this.imageSize.newWidth > maxWidth) ? maxWidth : this.imageSize.newWidth;

        return {
            width,
            height
        };
    }

    /**
     * Set editor position
     * @param {string} menuBarPosition - top or right or bottom or left
     * @private
     */
    _setEditorPosition(menuBarPosition) { // eslint-disable-line complexity
        const {width, height} = this._getEditorDimension();
        const editorElementStyle = this._editorElement.style;
        let top = 0;
        let left = 0;

        if (this.submenu) {
            if (menuBarPosition === 'bottom') {
                if (height > this._editorElementWrap.scrollHeight - 150) {
                    top = (height - this._editorElementWrap.scrollHeight) / 2;
                } else {
                    top = (150 / 2) * -1;
                }
            } else if (menuBarPosition === 'top') {
                if (height > this._editorElementWrap.offsetHeight - 150) {
                    top = (150 / 2) - ((height - (this._editorElementWrap.offsetHeight - 150)) / 2);
                } else {
                    top = 150 / 2;
                }
            } else if (menuBarPosition === 'left') {
                if (width > this._editorElementWrap.offsetWidth - 248) {
                    left = (248 / 2) - ((width - (this._editorElementWrap.offsetWidth - 248)) / 2);
                } else {
                    left = 248 / 2;
                }
            } else if (menuBarPosition === 'right') {
                if (width > this._editorElementWrap.scrollWidth - 248) {
                    left = (width - this._editorElementWrap.scrollWidth) / 2;
                } else {
                    left = (248 / 2) * -1;
                }
            }
        }
        editorElementStyle.top = `${top}px`;
        editorElementStyle.left = `${left}px`;
    }
}

export default Ui;
