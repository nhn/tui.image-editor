import snippet from 'tui-code-snippet';
import style from '../template/style';
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
        partition: {
            color: '#858585'
        },
        label: {
            normal: {
                color: '#858585',
                fontWeight: 'normal'
            },
            active: {
                color: '#000',
                fontWeight: 'normal'
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
        },
        checkbox: {
            border: '1px solid #ccc',
            backgroundColor: '#fff'
        },
        range: {
            pointer: {
                color: '#333'
            },
            value: {
                color: '#000',
                fontWeight: 'normal',
                backgroundColor: '#f5f5f5'
            },
            title: {
                color: '#000'
            }
        }
    }
};

export default class Theme {
    constructor(themeOption) {
        this.styles = snippet.extend(defaultStyle, themeOption);
        this.styleBuffer = '';
        this._styleMaker();
        this._styleLoader();
    }

    _getTargetOption(type) {
        let option = null;

        if (type.indexOf('.') > -1) {
            const explodeType = type.split('.');
            option = this.styles[explodeType[0]][explodeType[1]];
        } else {
            option = this.styles[type];
        }

        return option;
    }

    getStyle(type) {
        const option = this._getTargetOption(type);
        let result = null;

        switch (type) {
            case 'submenu.icon':
                result = option;
                break;
            case 'submenu.checkbox':
                result = this._serialize(this.styles.submenu.checkbox);
                break;
            case 'submenu.range':
                option.pointer.backgroundColor = option.pointer.color;

                result = {
                    pointer: this._serialize(option.pointer),
                    title: this._serialize(option.title),
                    value: this._serialize(option.value)
                };
                break;
            case 'submenu.partition':
                result = {
                    vertical: this._serialize(snippet.extend({}, option, {borderLeft: `1px solid ${option.color}`})),
                    horizontal: this._serialize(snippet.extend({}, option, {borderBottom: `1px solid ${option.color}`}))
                };
                break;
            case 'submenu.label':
                result = {
                    normal: this._serialize(option.normal),
                    active: this._serialize(option.active)
                };
                break;
            default:
                result = this._serialize(option);
                break;
        }

        return result;
    }

    _serialize(styleObject) {
        const converterStack = [];

        snippet.forEach(styleObject, (value, key) => {
            if (typeof value === 'object') {
                return;
            } else if (['backgroundImage'].indexOf(key) > -1 && value !== 'none') {
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

    _styleLoader() {
        const [head] = document.getElementsByTagName('head');
        const linkElement = document.createElement('link');
        const styleData = encodeURIComponent(this.styleBuffer);
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', `data:text/css;charset=UTF-8,${styleData}`);
        head.appendChild(linkElement);
    }

    _styleMaker() {
        this.styleBuffer = style({
            subMenuLabelActive: this.getStyle('submenu.label').active,
            subMenuLabelNormal: this.getStyle('submenu.label').normal,
            subMenuRangeTitle: this.getStyle('submenu.range').title,
            submenuPartitionVertical: this.getStyle('submenu.partition').vertical,
            submenuPartitionHorizontal: this.getStyle('submenu.partition').horizontal,
            submenuCheckbox: this.getStyle('submenu.checkbox'),
            submenuRangePointer: this.getStyle('submenu.range').pointer,
            submenuRangeValue: this.getStyle('submenu.range').value
        });
    }
}
