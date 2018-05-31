/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import Theme from '../src/js/ui/theme/theme';
import defaultTheme from '../src/js/ui/theme/standard';

describe('Theme', () => {
    let theme;
    beforeEach(() => {
        theme = new Theme(defaultTheme);
    });

    describe('_styleLoad()', () => {
        it('Style links with custom styles should be added to the head.', () => {
            const expected = 'data:text/css;charset=UTF-8,color%3A%20%23000%3B%20border%3A%201px';
            const head = {
                appendChild: jasmine.createSpy('head')
            };
            spyOn(document, 'getElementsByTagName').and.returnValue([head]);

            theme._styleLoad('color: #000; border: 1px');

            expect(head.appendChild.calls.mostRecent().args[0].getAttribute('href')).toBe(expected);
        });
    });

    describe('_getTargetOption()', () => {
        it('If the key contains a dot, you will need to find the object under 2depth.', () => {
            theme.styles = {
                range: {
                    value: {
                        color: '#000',
                        fontWeight: 'normal',
                        backgroundColor: '#f5f5f5'
                    }
                }
            };
            expect(theme._getTargetOption('range.value')).toEqual({
                color: '#000',
                fontWeight: 'normal',
                backgroundColor: '#f5f5f5'
            });
        });
    });

    describe('getStyle()', () => {
        it('In case of icon type, the object should be returned as it is.', () => {
            const resources = {
                normal: {
                    path: '../dist',
                    name: 'icon-a'
                },
                active: {
                    path: '../dist',
                    name: 'icon-d'
                }
            };
            spyOn(theme, '_getTargetOption').and.returnValue(resources);
            expect(theme.getStyle('menu.icon')).toBe(resources);
        });

        it('In normal types, cssText should be returned.', () => {
            const resources = {
                backgroundColor: '#fdba3b',
                border: '1px solid #fdba3b',
                color: '#fff',
                fontFamily: 'NotoSans, sans-serif',
                fontSize: '12px'
            };
            const expected = 'background-color: #fdba3b;border: 1px solid #fdba3b;color: #fff;font-family: NotoSans, sans-serif;font-size: 12px';
            spyOn(theme, '_getTargetOption').and.returnValue(resources);
            expect(theme.getStyle('normal')).toBe(expected);
        });

        it('If all members are objects, you must leave the structure intact and return cssText.', () => {
            const resources = {
                normal: {
                    color: '#858585',
                    fontWeight: 'normal'
                },
                active: {
                    color: '#000',
                    fontWeight: 'normal'
                }
            };
            const expected = {
                normal: 'color: #858585;font-weight: normal',
                active: 'color: #000;font-weight: normal'
            };
            spyOn(theme, '_getTargetOption').and.returnValue(resources);
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
        it('objects inside objects should be ignored.', () => {
            const styleObject = {
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                color: '#222',
                fontFamily: 'NotoSans, sans-serif',
                fontSize: '12px',
                subMenu: {
                    fontSize: '12px'
                }
            };
            const expected = 'background-color: #fff;border: 1px solid #ddd;color: #222;font-family: NotoSans, sans-serif;font-size: 12px';
            expect(theme._makeCssText(styleObject)).toBe(expected);
        });
    });
});
