import snippet from 'tui-code-snippet';
const defaultStyle = {
    common: {
        backgroundImage: './img/bg.png',
        backgroundColor: '#fff',
        border: '0px'
    },
    header: {
        backgroundImage: 'none',
        backgroundColor: 'transparent',
        border: '0px'
    },
    loadButton: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        color: '#222',
        fontFamily: 'NotoSans, sans-serif',
        fontSize: '12px'
    },
    downloadButton: {
        backgroundColor: '#fdba3b',
        border: '1px solid #fdba3b',
        color: '#fff',
        fontFamily: 'NotoSans, sans-serif',
        fontSize: '12px'
    },
    submenu: {
        backgroundColor: 'transparent'
    },
    submenuIcon: {
        normal: {
            iconName: 'icon-a',
            iconPath: '../dist'
        },
        active: {
            iconName: 'icon-a',
            iconPath: '../dist'
        }
    }
};

export default class Theme {
    constructor(themeOption) {
        this.styles = snippet.extend(defaultStyle, themeOption);
    }

    getStyle(type) {
        if (type === 'submenuIcon') {
            return this.styles[type];
        }

        return this._serialize(this.styles[type]);
    }

    _serialize(styleObject) {
        const converterStack = [];

        snippet.forEach(styleObject, (value, key) => {
            if (['backgroundImage'].indexOf(key) > -1 && value !== 'none') {
                value = `url(${value})`;
            }

            converterStack.push(`${this._toUnderScore(key)}: ${value}`);
        });

        return converterStack.join(';');
    }

    /**
     * String to camelcase string
     * @param {string} targetString - change target
     * @returns {string}
     * @private
     */
    _toUnderScore(targetString) {
        return targetString.replace(/([A-Z])/g, ($0, $1) => `-${$1.toLowerCase()}`);
    }
}
