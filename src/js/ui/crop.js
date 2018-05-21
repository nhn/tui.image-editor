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
        this._el = {
            apply: selector('#crop-button .apply'),
            cancel: selector('#crop-button .cancel')
        };
    }

    addEvent({crop, cancel}) {
        this._el.apply.addEventListener('click', () => {
            crop();
            this._el.apply.classList.remove('active');
        });

        this._el.cancel.addEventListener('click', () => {
            cancel();
            this._el.apply.classList.remove('active');
        });
    }
}
