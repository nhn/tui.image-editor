import Theme from '@/ui/theme/theme';
import defaultTheme from '@/ui/theme/standard';

describe('Theme', () => {
  let theme;

  beforeEach(() => {
    theme = new Theme(defaultTheme);
  });

  describe('getStyle()', () => {
    it('should have "path" and "name" when the user sets the icon file location', () => {
      const userIconPath = 'fixtures/icon-d.svg';
      const userIconName = 'icon-d';
      const themeForIconPathSet = new Theme({
        ...defaultTheme,
        'menu.normalIcon.path': userIconPath,
        'menu.normalIcon.name': userIconName,
      });
      const {
        normal: { path, name },
      } = themeForIconPathSet.getStyle('menu.icon');

      expect(path).toBe(userIconPath);
      expect(name).toBe(userIconName);
    });

    it('should return default icon color information', () => {
      const { normal, active, disabled, hover } = theme.getStyle('menu.icon');

      expect(normal.color).toBe('#8a8a8a');
      expect(active.color).toBe('#555555');
      expect(disabled.color).toBe('#434343');
      expect(hover.color).toBe('#e9e9e9');
    });

    it('should return cssText in normal types', () => {
      theme.styles.normal = {
        backgroundColor: '#fdba3b',
        border: '1px solid #fdba3b',
        color: '#fff',
        fontFamily: 'NotoSans, sans-serif',
        fontSize: '12px',
      };

      expect(theme.getStyle('normal')).toMatchSnapshot();
    });

    it('should return cssText if all members are objects', () => {
      theme.styles['submenu.normalLabel'] = {
        color: '#858585',
        fontWeight: 'normal',
      };
      theme.styles['submenu.activeLabel'] = {
        color: '#000',
        fontWeight: 'normal',
      };

      expect(theme.getStyle('submenu.label')).toMatchSnapshot();
    });
  });

  describe('_makeCssText()', () => {
    it('should return the cssText of the expected value for the object', () => {
      const styleObject = {
        backgroundColor: '#fff',
        backgroundImage: './img/bg.png',
        border: '1px solid #ddd',
        color: '#222',
        fontFamily: 'NotoSans, sans-serif',
        fontSize: '12px',
      };

      expect(theme._makeCssText(styleObject)).toMatchSnapshot();
    });
  });

  describe('_makeSvgItem()', () => {
    it('should create path prefix and use-default class when using the default icon', () => {
      const useTagString = theme._makeSvgItem(['normal'], 'crop');

      expect(useTagString).toMatchSnapshot();
    });

    it('should create a svg path with the prefix when set the icon file', () => {
      const themeForIconPathSet = new Theme({
        ...defaultTheme,
        'menu.normalIcon.path': 'fixtures/icon-d.svg',
        'menu.normalIcon.name': 'icon-d',
      });
      const useTagString = themeForIconPathSet._makeSvgItem(['normal'], 'crop');

      expect(useTagString).toMatchSnapshot();
    });
  });
});
