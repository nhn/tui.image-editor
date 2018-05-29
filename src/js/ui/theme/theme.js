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
        this.styleBuffer = [];
        this.styleMaker();
    }

    getStyle(type) {
        if (type === 'submenu.icon') {
            return this.styles.submenu.icon;
        } else if (type === 'submenu.checkbox') {
            return this._serialize(this.styles.submenu.checkbox);
        } else if (type === 'submenu.range') {
            const {color} = this.styles.submenu.range.pointer;
            this.styles.submenu.range.pointer.backgroundColor = color;

            return {
                pointer: this._serialize(this.styles.submenu.range.pointer),
                title: this._serialize(this.styles.submenu.range.title),
                value: this._serialize(this.styles.submenu.range.value)
            };
        } else if (type === 'submenu.partition') {
            const {color} = this.styles.submenu.partition;
            const result = {
                topBottom: this._serialize(snippet.extend({}, this.styles.submenu.partition, {borderLeft: `1px solid ${color}`})),
                leftRight: this._serialize(snippet.extend({}, this.styles.submenu.partition, {borderBottom: `1px solid ${color}`}))
            };

            return result;
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

    styleLoader() {
        const [head] = document.getElementsByTagName('head');
        const linkElement = document.createElement('link');
        const styleData = encodeURIComponent(this.styleBuffer.join(''));
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', `data:text/css;charset=UTF-8,${styleData}`);
        head.appendChild(linkElement);
    }

    styleMaker() {
        this.styleBuffer.push(`
            .tui-image-editor-container #icon-add-button.icon-bubble .button[data-icontype="icon-bubble"] label,
            .tui-image-editor-container #icon-add-button.icon-heart .button[data-icontype="icon-heart"] label,
            .tui-image-editor-container #icon-add-button.icon-location .button[data-icontype="icon-location"] label,
            .tui-image-editor-container #icon-add-button.icon-polygon .button[data-icontype="icon-polygon"] label,
            .tui-image-editor-container #icon-add-button.icon-star .button[data-icontype="icon-star"] label,
            .tui-image-editor-container #icon-add-button.icon-arrow-3 .button[data-icontype="icon-arrow-3"] label,
            .tui-image-editor-container #icon-add-button.icon-arrow-2 .button[data-icontype="icon-arrow-2"] label,
            .tui-image-editor-container #icon-add-button.icon-arrow .button[data-icontype="icon-arrow"] label,
            .tui-image-editor-container #icon-add-button.icon-bubble .button[data-icontype="icon-bubble"] label,
            .tui-image-editor-container #draw-line-select-button.line .button.line label,
            .tui-image-editor-container #draw-line-select-button.free .button.free label,
            .tui-image-editor-container #flip-button.flipX .button.flipX label,
            .tui-image-editor-container #flip-button.flipY .button.flipY label,
            .tui-image-editor-container #flip-button.resetFlip .button.resetFlip label,
            .tui-image-editor-container #crop-button .button.apply.active label,
            .tui-image-editor-container #shape-button.rect .button.rect label,
            .tui-image-editor-container #shape-button.circle .button.circle label,
            .tui-image-editor-container #shape-button.triangle .button.triangle label,
            .tui-image-editor-container #text-effect-button .button.active label,
            .tui-image-editor-container #text-align-button.left .button.left label,
            .tui-image-editor-container #text-align-button.center .button.center label,
            .tui-image-editor-container #text-align-button.right .button.right label,
            .tui-image-editor-container .tui-image-editor-submenu .button:hover > label,
            .tui-image-editor-container .tui-image-editor-checkbox input + label {
                ${this.getStyle('submenu.label').active}
            }
            .tui-image-editor-container .tui-image-editor-submenu .button > label {
                ${this.getStyle('submenu.label').normal}
            }
            .tui-image-editor-container .tui-image-editor-range-wrap label {
                ${this.getStyle('submenu.range').title}
            }
            .tui-image-editor-container .tui-image-editor-partition > div {
                ${this.getStyle('submenu.partition').topBottom}
            }
            .tui-image-editor-container.left .tui-image-editor-submenu .tui-image-editor-partition > div,
            .tui-image-editor-container.right .tui-image-editor-submenu .tui-image-editor-partition > div {
                ${this.getStyle('submenu.partition').leftRight}
            }
            .tui-image-editor-container .tui-image-editor-range-wrap.newline.short label {
                ${this.getStyle('submenu.label').normal}
            }
            .tui-image-editor-container .tui-image-editor-checkbox input + label:before {
                ${this.getStyle('submenu.checkbox')}
            }
            .tui-image-editor-container .tui-image-editor-virtual-range-pointer {
                ${this.getStyle('submenu.range').pointer}
            }
            .tui-image-editor-container .tui-image-editor-range-value {
                ${this.getStyle('submenu.range').value}
            }
        `);
    }
}
