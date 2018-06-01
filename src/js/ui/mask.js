import Submenu from './submenuBase';
import templateHtml from './template/submenu/mask';

/**
 * Mask ui class
 * @class
 */
export default class Mask extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'mask',
            iconStyle,
            templateHtml
        });

        this._el = {
            applyButton: this.selector('#mask-apply'),
            maskImageButton: this.selector('#mask-image-file')
        };
    }

    /**
     * Add event for mask
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.loadImageFromURL - load image action
     *   @param {Function} actions.applyFilter - apply filter action
     */
    addEvent({loadImageFromURL, applyFilter}) {
        this._el.maskImageButton.addEventListener('change', event => {
            const supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
            let imgUrl;

            if (!supportingFileAPI) {
                alert('This browser does not support file-api');
            }

            const [file] = event.target.files;

            if (file) {
                imgUrl = URL.createObjectURL(file);
                loadImageFromURL(imgUrl, file);
                this._el.applyButton.classList.add('active');
            }
        });

        this._el.applyButton.addEventListener('click', () => {
            applyFilter();
            this._el.applyButton.classList.remove('active');
        });
    }
}
