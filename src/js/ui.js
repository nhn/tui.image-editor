import util from './util';
import snippet from 'tui-code-snippet';
import mainContainer from './template/mainContainer';
import controls from './template/controls';

export default class Ui {
    constructor(element, options) {
        let selectedElement;

        this.options = this.initializeOption(options);

        if (element.jquery) {
            [selectedElement] = element;
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }

        // util.applyTemplate
        selectedElement.innerHTML = controls + mainContainer;

        this.selectedElement = selectedElement;

        this.selectedElement.classList.add(this.options.menuBarPosition);

        this._mainElement = this.selectedElement.querySelector('.main');

        this._editorElement = this.selectedElement.querySelector('.tui-image-editor');

        this._subMenuElement = this._mainElement.querySelector('.sub-menu');

        this._btnElement = {
            crop: this.selectedElement.querySelector('#btn-crop'),
            flip: this.selectedElement.querySelector('#btn-flip'),
            rotate: this.selectedElement.querySelector('#btn-rotate'),
            shape: this.selectedElement.querySelector('#btn-shape')
        };

        this.submenu = false;
        this.imageSize = {};

        this.shape = {
            type: 'rect',
            options: {
                stroke: '#000000',
                fill: '#ffffff',
                strokeWidth: 3
            }
        };
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
            this._subMenuElement.classList.remove(this.submenu);
        }

        if (this.submenu === menuName) {
            this.submenu = '';
        } else {
            this._btnElement[menuName].classList.add('active');
            this._subMenuElement.classList.add(menuName);
            this.submenu = menuName;
        }
        this._subMenuElement.style.display = this.submenu ? 'table' : 'none';

        this.resizeEditor();
    }

    resizeEditor(imageSize = this.imageSize) {
        if (imageSize !== this.imageSize) {
            this.imageSize = imageSize;
        }

        this._editorContainerElement = this._editorElement.querySelector('.tui-image-editor-canvas-container');

        const maxHeight = parseFloat(this._editorContainerElement.style.maxHeight);
        const height = (imageSize.newHeight > maxHeight) ? maxHeight : imageSize.newHeight;

        const maxWidth = parseFloat(this._editorContainerElement.style.maxWidth);
        const width = (imageSize.newWidth > maxWidth) ? maxWidth : imageSize.newWidth;

        const editorElementStyle = this._editorElement.style;
        const menuBarPosition = this.options.menuBarPosition;

        editorElementStyle.height = `${height}px`;
        editorElementStyle.width = `${width}px`;

        let {offsetWidth} = this._mainElement;
        let {offsetHeight} = this._mainElement;

        if (this.submenu && menuBarPosition === 'bottom') {
            offsetHeight -= 150;
        }
        if (this.submenu && menuBarPosition === 'top') {
            offsetHeight += 150;
        }

        if (this.submenu && menuBarPosition === 'left') {
            offsetWidth += 248;
        }
        if (this.submenu && menuBarPosition === 'right') {
            offsetWidth -= 248;
        }

        const top = (offsetHeight - height) / 2;
        const left = (offsetWidth - width) / 2;
        this._editorElement.style.top = `${top}px`;
        this._editorElement.style.left = `${left}px`;
    }
}










