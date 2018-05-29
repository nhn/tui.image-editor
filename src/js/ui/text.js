import Range from './tools/range';
import Colorpicker from './tools/colorpicker';
import textHtml from './template/submenu/text';

/**
 * Crop ui class
 * @class
 */
export default class Text {
    constructor(subMenuElement, theme) {
        const selector = str => subMenuElement.querySelector(str);
        this.theme = theme;
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
        this._styleLoader();
    }
    _styleLoader() {
        console.log('aa');
        const myStringOfstyles = `
            .tui-image-editor-container .tui-image-editor-submenu .button:hover > label {
                color: #fff;
            }
            .tui-image-editor-container .tui-image-editor-submenu .menu .button {
                position: relative;
                cursor: pointer;
                display: inline-block;
                color: #8e8e8e;
                font-weight: normal;
                font-size: 11px;
                margin: 0 7px 0 7px;
            }
        `;

        const head = document.getElementsByTagName('head')[0];
        const linkElement = document.createElement('link');
        // myStringOfstyles
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(myStringOfstyles));
        head.appendChild(linkElement);
    }

    /**
     * Add event for text
     * @param {Object} actions - actions for text
     *   @param {Function} changeTextStyle - change text style
     */
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

    /**
     * Get text color
     * @returns {string} - text color
     */
    getTextColor() {
        return this._el.textColorpicker.getColor();
    }

    /**
     * Get text size
     * @returns {string} - text size
     */
    getFontSize() {
        return this._el.textRange.getValue();
    }

    /**
     * Set text size
     * @param {Number} value - text size
     */
    setFontSize(value) {
        this._el.textRange.setValue(value, false);
        this._el.textRangeValue.value = value;
    }

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @private
     */
    _makeSubMenuElement(subMenuElement) {
        const textSubMenu = document.createElement('div');
        textSubMenu.className = 'text';
        textSubMenu.innerHTML = textHtml({
            submenuIcon: this.theme.submenuIcon
        });

        subMenuElement.appendChild(textSubMenu);
    }
}
