import Range from './range';
export default class Rotate {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);

        this._btnElement = {
            rotateButton: selector('#retate-button'),
            rotateRange: new Range(selector('#rotate-range'), 0),
            rotateRangeValue: selector('#ratate-range-value')
        };
    }

    addEvent({rotate, setAngle}) {
        this._btnElement.rotateButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [rotateType] = button.className.match(/(counterclockwise|clockwise)/);
            const rotateAngle = {
                'clockwise': 30,
                'counterclockwise': -30
            }[rotateType];
            rotate(rotateAngle);
        });
        this._btnElement.rotateRange.on('change', value => {
            const angle = parseInt(value, 10);
            this._btnElement.rotateRangeValue.value = angle;
            setAngle(angle);
        });
    }
}
