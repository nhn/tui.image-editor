import maskHtml from './template/submenu/mask';

/**
 * Mask ui class
 * @class
 */
export default class Mask {
    constructor(subMenuElement, {submenuIcon}) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement, submenuIcon);

        this._el = {
            applyButton: selector('#mask-apply'),
            maskImageButton: selector('#mask-image-file')
        };
    }

    /**
     * Add event for mask
     * @param {Object} actions - actions for crop
     *   @param {Function} loadImageFromURL - load image action
     *   @param {Function} applyFilter - apply filter action
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

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @param {Object} submenuIcon - subment icon
     * @private
     */
    _makeSubMenuElement(subMenuElement, submenuIcon) {
        const maskSubMenu = document.createElement('div');
        maskSubMenu.className = 'mask';
        maskSubMenu.innerHTML = maskHtml({submenuIcon});

        subMenuElement.appendChild(maskSubMenu);
    }
}
