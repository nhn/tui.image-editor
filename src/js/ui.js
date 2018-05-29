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

/**
 * Ui class
 * @class
 * @param {string|jQuery|HTMLElement} element - Wrapper's element or selector
 * @param {Object} [options] - Ui setting options
 *   @param {number} option.loadImage - Init default load image
 *   @param {number} option.initMenu - Init start menu
 *   @param {Boolean} [option.menuBarPosition=bottom] - Let
 *   @param {Boolean} [option.applyCropSelectionStyle=false] - Let
 * @param {Objecdt} actions - ui action instance
 */
export default class Ui {
    constructor(element, options, actions) {
        this.options = this._initializeOption(options);

        this._actions = actions;
        this.submenu = false;
        this.imageSize = {};

        /* THEME 생성 */
        this.theme = new Theme(options.theme);

        this._selectedElement = null;
        this._mainElement = null;
        this._editorElementWrap = null;
        this._editorElement = null;
        this._menuElement = null;
        this._subMenuElement = null;
        this._makeUiElement(element);

        this._el = {
            'undo': this._menuElement.querySelector('#btn-undo'),
            'redo': this._menuElement.querySelector('#btn-redo'),
            'reset': this._menuElement.querySelector('#btn-reset'),
            'delete': this._menuElement.querySelector('#btn-delete'),
            'deleteAll': this._menuElement.querySelector('#btn-delete-all'),
            'download': this._selectedElement.querySelectorAll('.tui-image-editor-download-btn'),
            'load': this._selectedElement.querySelectorAll('.tui-image-editor-load-btn')
        };

        this._makeSubMenu();
    }

    /**
     * Change editor size
     * @param {Objecdt} imageSize - image size dimension
     *   @param {Number} imageSize.oldWidth - old width
     *   @param {Number} imageSize.oldHeight - old height
     *   @param {Number} imageSize.newWidth - new width
     *   @param {Number} imageSize.newHeight - new height
     */
    resizeEditor(imageSize = this.imageSize) {
        if (imageSize !== this.imageSize) {
            this.imageSize = imageSize;
        }
        const {width, height} = this._getEditorDimension();
        const editorElementStyle = this._editorElement.style;
        const {menuBarPosition} = this.options;

        editorElementStyle.height = `${height}px`;
        editorElementStyle.width = `${width}px`;

        const {top, bottom, left, right} = this._getEditorPosition(menuBarPosition);

        this._editorElementWrap.style.bottom = `${bottom}px`;
        this._editorElementWrap.style.top = `${top}px`;
        this._editorElementWrap.style.left = `${left}px`;
        this._editorElementWrap.style.width = `calc(100% - ${right}px)`;

        const {offsetWidth, offsetHeight} = this._editorElementWrap;

        const editortop = (offsetHeight > height) ? (offsetHeight - height) / 2 : 0;
        const editorleft = (offsetWidth - width) / 2;

        this._editorElement.style.top = `${editortop}px`;
        this._editorElement.style.left = `${editorleft}px`;
    }

    /**
     * Change undo button status
     * @param {Boolean} enableStatus - enabled status
     */
    changeUndoButtonStatus(enableStatus) {
        if (enableStatus) {
            this._el.undo.classList.add('enabled');
        } else {
            this._el.undo.classList.remove('enabled');
        }
    }

    /**
     * Change redo button status
     * @param {Boolean} enableStatus - enabled status
     */
    changeRedoButtonStatus(enableStatus) {
        if (enableStatus) {
            this._el.redo.classList.add('enabled');
        } else {
            this._el.redo.classList.remove('enabled');
        }
    }

    /**
     * Change reset button status
     * @param {Boolean} enableStatus - enabled status
     */
    changeResetButtonStatus(enableStatus) {
        if (enableStatus) {
            this._el.reset.classList.add('enabled');
        } else {
            this._el.reset.classList.remove('enabled');
        }
    }

    /**
     * Change delete-all button status
     * @param {Boolean} enableStatus - enabled status
     */
    changeDeleteAllButtonEnabled(enableStatus) {
        if (enableStatus) {
            this._el.deleteAll.classList.add('enabled');
        } else {
            this._el.deleteAll.classList.remove('enabled');
        }
    }

    /**
     * Change delete button status
     * @param {Boolean} enableStatus - enabled status
     */
    changeDeleteButtonEnabled(enableStatus) {
        if (enableStatus) {
            this._el['delete'].classList.add('enabled');
        } else {
            this._el['delete'].classList.remove('enabled');
        }
    }

    /**
     * Change delete button status
     * @param {Object} [options] - Ui setting options
     *   @param {number} option.loadImage - Init default load image
     *   @param {number} option.initMenu - Init start menu
     *   @param {Boolean} [option.menuBarPosition=bottom] - Let
     *   @param {Boolean} [option.applyCropSelectionStyle=false] - Let
     * @returns {Object} initialize option
     * @private
     */
    _initializeOption(options) {
        return snippet.extend({
            loadImage: {
                path: '',
                name: ''
            },
            menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
            initMenu: false,
            menuBarPosition: 'bottom'
        }, options);
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
            this._el[menuName] = this._menuElement.querySelector(`#btn-${menuName}`);

            console.log(this.theme.getStyle('submenu.label'));

            // submenu ui instance
            this[menuName] = new SubComponentClass(this._subMenuElement, {
                submenuIcon: this.theme.getStyle('submenu.icon'),
                submenuLabel: this.theme.getStyle('submenu.label')
            });
        });
    }

    /**
     * Make primary ui dom element
     * @param {string|jQuery|HTMLElement} element - Wrapper's element or selector
     * @private
     */
    _makeUiElement(element) {
        let selectedElement;

        window.snippet = snippet;

        if (element.jquery) {
            [selectedElement] = element;
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }
        const selector = util.getSelector(selectedElement);

        selectedElement.classList.add('tui-image-editor-container');
        selectedElement.innerHTML = controls() + mainContainer({
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
        const menuItemHtml = `
            <svg class="svg_ic-menu">
                <use xlink:href="../dist/icon-a.svg#icon-a-ic-${menuName}" class="normal"/>
                <use xlink:href="../dist/icon-b.svg#icon-b-ic-${menuName}" class="active"/>
            </svg>
        `;
        const btnElement = document.createElement('li');

        btnElement.id = `btn-${menuName}`;
        btnElement.className = 'item';
        btnElement.innerHTML = menuItemHtml;

        this._menuElement.appendChild(btnElement);
    }

    /**
     * Add help action event
     * @param {string} helpName - help menu name
     * @private
     */
    _addHelpActionEvent(helpName) {
        this._el[helpName].addEventListener('click', () => {
            this._actions.main[helpName]();
        });
    }

    /**
     * Add download event
     * @private
     */
    _addDownloadEvent() {
        snippet.forEach(this._el.download, element => {
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
        snippet.forEach(this._el.load, element => {
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
        this._el[menuName].addEventListener('click', () => {
            this.changeMenu(menuName);
            this._actions.main.modeChange(menuName);
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
     */
    getEditorArea() {
        return this._editorElement;
    }

    /**
     * Init canvas
     */
    initCanvas() {
        const loadImageInfo = this._getLoadImage();

        this._actions.main.initLoadImage(loadImageInfo.path, loadImageInfo.name, () => {
            this._addHelpActionEvent('undo');
            this._addHelpActionEvent('redo');
            this._addHelpActionEvent('reset');
            this._addHelpActionEvent('delete');
            this._addHelpActionEvent('deleteAll');

            this._addDownloadEvent();
            this._addLoadEvent();

            snippet.forEach(this.options.menu, menuName => {
                this._addMenuEvent(menuName);
                this._addSubMenuEvent(menuName);
            });
            this._initMenu();
        });

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
     * @returns {Object} loadimage optionk
     * @private
     */
    _getLoadImage() {
        return this.options.loadImage;
    }

    /**
     * change menu
     * @param {string} menuName - menu name
     */
    changeMenu(menuName) {
        if (this.submenu) {
            this._el[this.submenu].classList.remove('active');
            this._mainElement.classList.remove(this.submenu);
        }

        if (this.submenu === menuName) {
            this.submenu = '';
        } else {
            this._el[menuName].classList.add('active');
            this._mainElement.classList.add(menuName);
            this.submenu = menuName;
        }
        this._subMenuElement.style.display = this.submenu ? 'table' : 'none';
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
            setTimeout(() => {
                this._el[this.options.initMenu].dispatchEvent(evt);
                this.icon.registDefaultIcon();
            }, 700);
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
     * Get editor position
     * @param {string} menuBarPosition - top or right or bottom or left
     * @returns {Object} - positions (top, right, bottom, left)
     * @private
     */
    _getEditorPosition(menuBarPosition) {
        let bottom = 0;
        let top = 0;
        let left = 0;
        let right = 0;

        if (this.submenu) {
            switch (menuBarPosition) {
                case 'bottom':
                    bottom += 150;
                    break;
                case 'top':
                    top += 150;
                    break;
                case 'left':
                    left += 248;
                    right += 248;
                    break;
                case 'right':
                    right += 248;
                    break;
                default:
                    break;
            }
        }

        return {
            top,
            bottom,
            left,
            right
        };
    }
}
