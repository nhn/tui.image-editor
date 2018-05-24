import Range from './range';
import Colorpicker from './colorpicker';
import textHtml from '../template/submenu/text';

export default class Text {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);

        this.effect = {
            bold: false,
            italic: false,
            underline: false
        };
        this.align = 'left';
        this._el = {
            textEffectButton: selector('#text-effect-button'),
            textAlignButton: selector('#text-align-button'),
            textColorpicker: new Colorpicker(selector('#text-color'), '#ffbb3b'),
            textRange: new Range(selector('#text-range'), {
                min: 10,
                max: 100,
                value: 50
            }),
            textRangeValue: selector('#text-range-value')
        };
    }

    getTextColor() {
        return this._el.textColorpicker.getColor();
    }

    getFontSize() {
        return this._el.textRange.getValue();
    }

    setFontSize(value) {
        this._el.textRange.setValue(value, false);
        this._el.textRangeValue.value = value;
    }

    _makeSubMenuElement(subMenuElement) {
        const textSubMenu = document.createElement('div');
        textSubMenu.className = 'text';
        textSubMenu.innerHTML = textHtml;

        subMenuElement.appendChild(textSubMenu);
    }

    addEvent({changeTextStyle}) {
        this._el.textEffectButton.addEventListener('click', event => {
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
        this._el.textAlignButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [styleType] = button.className.match(/(left|center|right)/);
            event.currentTarget.classList.remove(this.align);
            if (this.align !== styleType) {
                event.currentTarget.classList.add(styleType);
            }

            changeTextStyle({textAlign: styleType});

            this.align = styleType;
        });
        this._el.textRange.on('change', value => {
            value = parseInt(value, 10);
            this._el.textRangeValue.value = value;

            changeTextStyle({
                fontSize: parseInt(value, 10)
            });
        });
        this._el.textRangeValue.value = this._el.textRange.getValue();

        this._el.textColorpicker.on('change', color => {
            color = color || 'transparent';
            changeTextStyle({
                'fill': color
            });
        });
    }
}
