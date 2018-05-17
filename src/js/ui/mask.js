export default class Mask {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);

        this._btnElement = {
            applyButton: selector('#mask-apply'),
            maskImageButton: selector('#mask-image-file')
        };
    }
    addEvent({loadImageFromURL, applyFilter}) {
        this._btnElement.maskImageButton.addEventListener('change', event => {
            const supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
            let imgUrl;

            if (!supportingFileAPI) {
                alert('This browser does not support file-api');
            }

            const [file] = event.target.files;

            if (file) {
                imgUrl = URL.createObjectURL(file);
                loadImageFromURL(imgUrl, file);
            }
        });

        this._btnElement.applyButton.addEventListener('click', () => {
            applyFilter();
        });
    }
}
