export default class Flip {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);

        this._el = {
            flipButton: selector('#flip-button')
        };
    }

    addEvent({flip}) {
        this._el.flipButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [flipType] = button.className.match(/(flipX|flipY|resetFlip)/);
            flip(flipType);
        });
    }
}
