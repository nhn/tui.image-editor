export default class Crop {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.status = 'active';

        this.controlOption = {
            cornerStyle: 'circle',
            cornerSize: 20,
            cornerColor: '#fff',
            cornerStrokeColor: '#000',
            transparentCorners: false,
            lineWidth: 2
        };
        this._btnElement = {
            apply: selector('#crop-button .apply'),
            cancel: selector('#crop-button .cancel')
        };
    }

    addEvent({crop, cancel}) {
        this._btnElement.apply.addEventListener('click', () => {
            crop();
            this._btnElement.apply.classList.remove('active');
        });

        this._btnElement.cancel.addEventListener('click', () => {
            cancel();
            this._btnElement.apply.classList.remove('active');
        });
    }
}
