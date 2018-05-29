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
        backgroundColor: 'transparent',
        label: {
            normal: {
                color: '#8e8e8e'
            },
            active: {
                color: 'red'
            }
        },
        icon: {
            normal: {
                path: '../dist',
                name: 'icon-a'
            },
            active: {
                path: '../dist',
                name: 'icon-d'
            }
        }
    }
};

export default class Theme {
    constructor(themeOption) {
        this.styles = snippet.extend(defaultStyle, themeOption);
    }

    getStyle(type) {
        if (type === 'submenu.icon') {
            return this.styles.submenu.icon;
        } else if (type === 'submenu.label') {
            const result = {};
            snippet.forEach(this.styles.submenu.label, (labelValue, labelType) => {
                result[labelType] = this._serialize(labelValue);
            });

            return result;
        }

        return this._serialize(this.styles[type]);
    }

    _serialize(styleObject) {
        const converterStack = [];

        snippet.forEach(styleObject, (value, key) => {
            if (typeof value === 'object') {
                return;
            }

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
