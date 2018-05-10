import util from './util';
import mainContainer from './template/mainContainer';
import controls from './template/controls';

export default class Ui {
    constructor(element) {
        let selectedElement;

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
    }

    getEditorArea() {
        return this.selectedElement.querySelector('.tui-image-editor');
    }
}
