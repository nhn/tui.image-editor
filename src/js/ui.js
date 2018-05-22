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
import util from './util';

export default class Ui {
    constructor(element, options, actions) {
        let selectedElement;

        this.options = this.initializeOption(options);

        this._actions = actions;

        if (element.jquery) {
            [selectedElement] = element;
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }

        selectedElement.innerHTML = controls + mainContainer;
        this.selectedElement = selectedElement;
        this.selectedElement.classList.add(this.options.menuBarPosition);
        this._mainElement = this.selectedElement.querySelector('.tui-image-editor-main');
        this._editorElementWrap = this.selectedElement.querySelector('.tui-image-editor-wrap');
        this._editorElement = this.selectedElement.querySelector('.tui-image-editor');
        this._menuElement = this.selectedElement.querySelector('.tui-image-editor-menu');
        this._subMenuElement = this._mainElement.querySelector('.tui-image-editor-submenu');
        this._makeMenuElement();

        this._btnElement = {
            crop: this._menuElement.querySelector('#btn-crop'),
            flip: this._menuElement.querySelector('#btn-flip'),
            rotate: this._menuElement.querySelector('#btn-rotate'),
            shape: this._menuElement.querySelector('#btn-shape'),
            text: this._menuElement.querySelector('#btn-text'),
            mask: this._menuElement.querySelector('#btn-mask'),
            icon: this._menuElement.querySelector('#btn-icon'),
            draw: this._menuElement.querySelector('#btn-draw'),
            filter: this._menuElement.querySelector('#btn-filter')
        };

        this.submenu = false;
        this.imageSize = {};

        this.mask = new Mask(this._subMenuElement);
        this.shape = new Shape(this._subMenuElement);
        this.crop = new Crop(this._subMenuElement);
        this.flip = new Flip(this._subMenuElement);
        this.rotate = new Rotate(this._subMenuElement);
        this.text = new Text(this._subMenuElement);
        this.icon = new Icon(this._subMenuElement);
        this.draw = new Draw(this._subMenuElement);
        this.filter = new Filter(this._subMenuElement);
    }

    _makeMenuElement() {
        const menu = ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'];
        const menuItemHtml = `
            <li id="btn-{{menuName}}" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-{{menuName}}" class="normal"/>
                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-{{menuName}}" class="active"/>
                </svg>
            </li>
        `;

        snippet.forEach(menu, menuName => {
            const btnElement = document.createElement('li');
            btnElement.id = `btn-${menuName}`;
            btnElement.className = 'item';

            btnElement.innerHTML = util.applyTemplate(menuItemHtml, {
                menuName
            });

            this._menuElement.appendChild(btnElement);
        });
    }

    menuAddEvent() {
        const changeMode = this._actions.main.modeChange;
        this._btnElement.text.addEventListener('click', () => {
            this.changeMenu('text');
            changeMode('text');
        });
        this._btnElement.crop.addEventListener('click', () => {
            this.changeMenu('crop');
            changeMode('crop');
        });
        this._btnElement.flip.addEventListener('click', () => {
            this.changeMenu('flip');
            changeMode('flip');
        });
        this._btnElement.rotate.addEventListener('click', () => {
            this.changeMenu('rotate');
            changeMode('rotate');
        });
        this._btnElement.shape.addEventListener('click', () => {
            this.changeMenu('shape');
            changeMode('shape');
        });
        this._btnElement.mask.addEventListener('click', () => {
            this.changeMenu('mask');
            changeMode('mask');
        });
        this._btnElement.icon.addEventListener('click', () => {
            this.changeMenu('icon');
            changeMode('icon');
        });
        this._btnElement.draw.addEventListener('click', () => {
            this.changeMenu('draw');
            changeMode('draw');
        });
        this._btnElement.filter.addEventListener('click', () => {
            this.changeMenu('filter');
            changeMode('filter');
        });
    }

    subMenuAddEvent() {
        this.shape.addEvent(this._actions.shape);
        this.crop.addEvent(this._actions.crop);
        this.flip.addEvent(this._actions.flip);
        this.rotate.addEvent(this._actions.rotate);
        this.text.addEvent(this._actions.text);
        this.mask.addEvent(this._actions.mask);
        this.icon.addEvent(this._actions.icon);
        this.draw.addEvent(this._actions.draw);
        this.filter.addEvent(this._actions.filter);
    }

    initializeOption(options) {
        return snippet.extend({
            loadImage: {
                path: '',
                name: ''
            },
            initMenu: false,
            menuBarPosition: 'bottom'
        }, options);
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
        this._actions.main.initLoadImage(loadImageInfo.path, loadImageInfo.name);

        this.menuAddEvent();
        this.subMenuAddEvent();

        this._initMenu();

        this.gridVisual = document.createElement('div');
        this.gridVisual.className = 'tui-image-editor-grid-visual';
        const grid = `<table>
           <tr><td class="dot left-top"></td><td></td><td class="dot right-top"></td></tr>
           <tr><td></td><td></td><td></td></tr>
           <tr><td class="dot left-bottom"></td><td></td><td class="dot right-bottom"></td></tr>
         </table>`;
        this.gridVisual.innerHTML = grid;
        this._editorContainerElement = this._editorElement.querySelector('.tui-image-editor-canvas-container');
        this._editorContainerElement.appendChild(this.gridVisual);
    }

    _initMenu() {
        if (this.options.initMenu) {
            const evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, false);
            setTimeout(() => {
                this._btnElement[this.options.initMenu].dispatchEvent(evt);
                this.icon.registDefaultIcon();
                this.draw.setDrawMode();
            }, 700);
        }
    }

    resizeEditor(imageSize = this.imageSize) {
        if (imageSize !== this.imageSize) {
            this.imageSize = imageSize;
        }

        const maxHeight = parseFloat(this._editorContainerElement.style.maxHeight);
        const height = (this.imageSize.newHeight > maxHeight) ? maxHeight : this.imageSize.newHeight;

        const maxWidth = parseFloat(this._editorContainerElement.style.maxWidth);
        const width = (this.imageSize.newWidth > maxWidth) ? maxWidth : this.imageSize.newWidth;

        const editorElementStyle = this._editorElement.style;
        const {menuBarPosition} = this.options;

        editorElementStyle.height = `${height}px`;
        editorElementStyle.width = `${width}px`;

        let bottom = 0;
        let top = 0;
        let left = 0;
        let right = 0;

        if (this.submenu && menuBarPosition === 'bottom') {
            bottom += 150;
        }
        if (this.submenu && menuBarPosition === 'top') {
            top += 150;
        }

        if (this.submenu && menuBarPosition === 'left') {
            left += 248;
            right += 248;
        }
        if (this.submenu && menuBarPosition === 'right') {
            right += 248;
        }

        this._editorElementWrap.style.bottom = `${bottom}px`;
        this._editorElementWrap.style.top = `${top}px`;
        this._editorElementWrap.style.left = `${left}px`;
        this._editorElementWrap.style.width = `calc(100% - ${right}px)`;

        const {offsetWidth} = this._editorElementWrap;
        const {offsetHeight} = this._editorElementWrap;

        const editortop = (offsetHeight - height) / 2;
        const editorleft = (offsetWidth - width) / 2;

        this._editorElement.style.top = `${editortop}px`;
        this._editorElement.style.left = `${editorleft}px`;
    }
}
