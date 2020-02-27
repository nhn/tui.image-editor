/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import snippet from 'tui-code-snippet';
import Theme from '../src/js/ui/theme/theme';
import defaultTheme from '../src/js/ui/theme/standard';

describe('Theme', () => {
    let theme;
    beforeEach(() => {
        theme = new Theme(defaultTheme);
    });
    describe('getStyle()', () => {

        it('When the user sets the icon file location, the path and name information must be included.', () => {
            const addUserIconPath = 'base/test/fixtures/icon-d.svg';
            const addUserIconName = 'icon-d';
            const themeForIconPathSet = new Theme(snippet.extend({}, defaultTheme, {
                'menu.normalIcon.path': addUserIconPath,
                'menu.normalIcon.name': addUserIconName
            }));
            const {normal: {path, name}} = themeForIconPathSet.getStyle('menu.icon');

            expect(path).toEqual('base/test/fixtures/icon-d.svg');
            expect(name).toEqual('icon-d');
        });

        it('should return default icon color information.', () => {
            const {normal, active, disabled, hover} = theme.getStyle('menu.icon');

            expect(normal.color).toEqual('#8a8a8a');
            expect(active.color).toEqual('#555555');
            expect(disabled.color).toEqual('#434343');
            expect(hover.color).toEqual('#e9e9e9');
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

    describe('_makeSvgItem()', () => {
        it('When using the default icon, a svg set with the path prefix and no use-default class should be created.', () => {
            const useTagString = theme._makeSvgItem(['normal'], 'crop');

            expect(useTagString).toBe('<use xlink:href="#ic-crop" class="normal use-default"/>');
        });

        it('Setting the icon file should create a svg path with the prefix.', () => {
            const themeForIconPathSet = new Theme(snippet.extend({}, defaultTheme, {
                'menu.normalIcon.path': 'base/test/fixtures/icon-d.svg',
                'menu.normalIcon.name': 'icon-d'
            }));
            const useTagString = themeForIconPathSet._makeSvgItem(['normal'], 'crop');

            expect(useTagString).toBe('<use xlink:href="base/test/fixtures/icon-d.svg#icon-d-ic-crop" class="normal"/>');
        });
    });
});
