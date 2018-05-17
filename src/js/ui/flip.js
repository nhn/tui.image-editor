export default class Flip {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);

        this._btnElement = {
            flipButton: selector('#flip-button')
        };
    }

    addEvent({flip}) {
        this._btnElement.flipButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [flipType] = button.className.match(/(flipX|flipY|resetFlip)/);
            flip(flipType);
        });
    }
}
