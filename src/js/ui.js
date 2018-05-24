import snippet from 'tui-code-snippet';
import mainContainer from './template/mainContainer';
import controls from './template/controls';

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

export default class Ui {
    constructor(element, options, actions) {
        this.options = this._initializeOption(options);

        this._actions = actions;
        this._btnElement = {};

        this.submenu = false;
        this.imageSize = {};

        this._selectedElement = null;
        this._mainElement = null;
        this._editorElementWrap = null;
        this._editorElement = null;
        this._menuElement = null;
        this._subMenuElement = null;
        this._makeUiElement(element);

        this._btnElement = {
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

    _makeSubMenu() {
        snippet.forEach(this.options.menu, menuName => {
            const SubComponentClass = SUB_UI_COMPONENT[menuName.replace(/^[a-z]/, $0 => $0.toUpperCase())];

            // make menu element
            this._makeMenuElement(menuName);

            // menu btn element
            this._btnElement[menuName] = this._menuElement.querySelector(`#btn-${menuName}`);

            // submenu ui instance
            this[menuName] = new SubComponentClass(this._subMenuElement);
        });
    }

    _makeUiElement(element) {
        let selectedElement;

        if (element.jquery) {
            [selectedElement] = element;
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }

        selectedElement.innerHTML = controls + mainContainer;
        this._selectedElement = selectedElement;
        this._selectedElement.classList.add(this.options.menuBarPosition);
        this._mainElement = this._selectedElement.querySelector('.tui-image-editor-main');
        this._editorElementWrap = this._selectedElement.querySelector('.tui-image-editor-wrap');
        this._editorElement = this._selectedElement.querySelector('.tui-image-editor');
        this._menuElement = this._selectedElement.querySelector('.tui-image-editor-menu');
        this._subMenuElement = this._mainElement.querySelector('.tui-image-editor-submenu');
    }

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

    getControlStyle() {
        return this.options.controlStyle;
    }

    addHelpActionEvent(helpName) {
        this._btnElement[helpName].addEventListener('click', () => {
            this._actions.main[helpName]();
        });
    }

    addDownloadEvent() {
        snippet.forEach(this._btnElement.download, element => {
            element.addEventListener('click', () => {
                this._actions.main.download();
            });
        });
    }

    addLoadEvent() {
        snippet.forEach(this._btnElement.load, element => {
            element.addEventListener('change', event => {
                this._actions.main.load(event.target.files[0]);
            });
        });
    }

    addMenuEvent(menuName) {
        this._btnElement[menuName].addEventListener('click', () => {
            this.changeMenu(menuName);
            this._actions.main.modeChange(menuName);
        });
    }

    addSubMenuEvent(menuName) {
        this[menuName].addEvent(this._actions[menuName]);
    }

    getEditorArea() {
        return this._editorElement;
    }

    getLoadImage() {
        return this.options.loadImage;
    }

    changeMenu(menuName) {
        if (this.submenu) {
            this._btnElement[this.submenu].classList.remove('active');
            this._mainElement.classList.remove(this.submenu);
        }

        if (this.submenu === menuName) {
            this.submenu = '';
        } else {
            this._btnElement[menuName].classList.add('active');
            this._mainElement.classList.add(menuName);
            this.submenu = menuName;
        }
        this._subMenuElement.style.display = this.submenu ? 'table' : 'none';
        this.resizeEditor();
    }

    initCanvas() {
        const loadImageInfo = this.getLoadImage();

        this._actions.main.initLoadImage(loadImageInfo.path, loadImageInfo.name, () => {
            this.addHelpActionEvent('undo');
            this.addHelpActionEvent('redo');
            this.addHelpActionEvent('reset');
            this.addHelpActionEvent('delete');
            this.addHelpActionEvent('deleteAll');

            this.addDownloadEvent();
            this.addLoadEvent();

            snippet.forEach(this.options.menu, menuName => {
                this.addMenuEvent(menuName);
                this.addSubMenuEvent(menuName);
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

    _initMenu() {
        if (this.options.initMenu) {
            const evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, false);
            setTimeout(() => {
                this._btnElement[this.options.initMenu].dispatchEvent(evt);
                this.icon.registDefaultIcon();
            }, 700);
        }
    }

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

        const {offsetWidth} = this._editorElementWrap;
        const {offsetHeight} = this._editorElementWrap;

        const editortop = (offsetHeight > height) ? (offsetHeight - height) / 2 : 0;
        const editorleft = (offsetWidth - width) / 2;

        this._editorElement.style.top = `${editortop}px`;
        this._editorElement.style.left = `${editorleft}px`;
    }

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
