/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import Theme from '../src/js/ui/theme/theme';
import defaultTheme from '../src/js/ui/theme/standard';

describe('Theme', () => {
    let theme;
    beforeEach(() => {
        theme = new Theme(defaultTheme);
    });

    describe('getStyle()', () => {
        it('In case of icon type, the object should be returned as it is.', () => {
            const expected = {
                active: {
                    path: 'base/test/fixtures/icon-b.svg',
                    name: 'icon-b'
                },
                normal: {
                    path: 'base/test/fixtures/icon-d.svg',
                    name: 'icon-d'
                },
                disabled: {
                    path: 'base/test/fixtures/icon-a.svg',
                    name: 'icon-a'
                },
                hover: {
                    path: 'base/test/fixtures/icon-c.svg',
                    name: 'icon-c'
                }
            };

            expect(theme.getStyle('menu.icon')).toEqual(expected);
        });

        it('In normal types, cssText should be returned.', () => {
            theme.styles.normal = {
                backgroundColor: '#fdba3b',
                border: '1px solid #fdba3b',
                color: '#fff',
                fontFamily: 'NotoSans, sans-serif',
                fontSize: '12px'
            };

            const expected = 'background-color: #fdba3b;border: 1px solid #fdba3b;color: #fff;font-family: NotoSans, sans-serif;font-size: 12px';
            expect(theme.getStyle('normal')).toBe(expected);
        });

        it('If all members are objects, you must leave the structure intact and return cssText.', () => {
            theme.styles['submenu.normalLabel'] = {
                color: '#858585',
                fontWeight: 'normal'
            };
            theme.styles['submenu.activeLabel'] = {
                color: '#000',
                fontWeight: 'normal'
            };

            const expected = {
                normal: 'color: #858585;font-weight: normal',
                active: 'color: #000;font-weight: normal'
            };
            expect(theme.getStyle('submenu.label')).toEqual(expected);
        });
    });

    describe('_makeCssText()', () => {
        it('Should return the cssText of the expected value for the object.', () => {
            const styleObject = {
                backgroundColor: '#fff',
                backgroundImage: './img/bg.png',
                border: '1px solid #ddd',
                color: '#222',
                fontFamily: 'NotoSans, sans-serif',
                fontSize: '12px'
            };
            const expected = 'background-color: #fff;background-image: url(./img/bg.png);border: 1px solid #ddd;color: #222;font-family: NotoSans, sans-serif;font-size: 12px';
            expect(theme._makeCssText(styleObject)).toBe(expected);
        });
    });
});
