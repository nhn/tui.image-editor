import Range from './range';
import Colorpicker from './colorpicker';
export default class Text {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.effect = {
            bold: false,
            italic: false,
            underline: false
        };
        this.align = 'left';
        this.rangeTimeout = null;
        this.controlOption = {
            cornerStyle: 'circle',
            cornerSize: 20,
            borderColor: '#fff',
            cornerColor: '#fff',
            cornerStrokeColor: '#000',
            transparentCorners: false,
            padding: 20,
            lineWidth: 2
        };
        this._btnElement = {
            textEffectButton: selector('#text-effect-button'),
            textAlignButton: selector('#text-align-button'),
            textColorpicker: new Colorpicker(selector('#text-color'), '#ffbb3b'),
            textRange: new Range(selector('#text-range'), 10),
            textRangeValue: selector('#text-range-value')
        };
    }
    addEvent({changeTextStyle}) {
        this._btnElement.textEffectButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [styleType] = button.className.match(/(bold|italic|underline)/);
            const styleObj = {
                'bold': {fontWeight: 'bold'},
                'italic': {fontStyle: 'italic'},
                'underline': {textDecoration: 'underline'}
            }[styleType];

            this.effect[styleType] = !this.effect[styleType];
            button.classList.toggle('active');

            changeTextStyle(styleObj);
        });
        this._btnElement.textAlignButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [styleType] = button.className.match(/(left|center|right)/);
            event.currentTarget.classList.remove(this.align);
            if (this.align !== styleType) {
                event.currentTarget.classList.add(styleType);
            }

            changeTextStyle({textAlign: styleType});

            this.align = styleType;
        });
        this._btnElement.textRange.on('change', value => {
            value = parseInt(value, 10);
            this._btnElement.textRangeValue.value = value;

            clearTimeout(this.rangeTimeout);
            this.rangeTimeout = setTimeout(() => {
                changeTextStyle({
                    fontSize: parseInt(value, 10)
                });
            }, 100);
        });
        this._btnElement.textColorpicker.on('change', value => {
            const color = value.color || 'transparent';
            changeTextStyle({
                'fill': color
            });
        });
    }
}
