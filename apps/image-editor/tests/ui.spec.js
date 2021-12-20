import UI from '@/ui';
import { HELP_MENUS } from '@/consts';

describe('UI', () => {
  let ui, options;

  beforeEach(() => {
    options = {
      loadImage: { path: 'mockImagePath', name: '' },
      menu: ['resize', 'crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
      initMenu: 'shape',
      menuBarPosition: 'bottom',
    };
    ui = new UI(document.createElement('div'), options, {});
  });

  describe('Destroy()', () => {
    it('should be executed for all menu instances', () => {
      const spies = [];
      options.menu.forEach((menu) => {
        spies.push(jest.spyOn(ui[menu], 'destroy'));
      });

      ui._destroyAllMenu();

      spies.forEach((spy) => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('should execute "removeEventListener" for all menus', () => {
      const allUiButtonElementName = [...options.menu, ...HELP_MENUS];
      allUiButtonElementName.forEach((element) => {
        jest.spyOn(ui._buttonElements[element], 'removeEventListener');
      });

      ui._removeUiEvent();

      allUiButtonElementName.forEach((element) => {
        expect(ui._buttonElements[element].removeEventListener).toHaveBeenCalled();
      });
    });
  });

  describe('_changeMenu()', () => {
    it('should execute when the menu changes', () => {
      ui.submenu = 'shape';
      jest.spyOn(ui, 'resizeEditor');
      ui.shape.changeStandbyMode = jest.fn();
      jest.spyOn(ui.filter, 'changeStartMode');
      ui._actions.main = { changeSelectableAll: jest.fn() };
      ui.resizeEditor = jest.fn();

      ui._changeMenu('filter', false, false);

      expect(ui.shape.changeStandbyMode).toHaveBeenCalled();
      expect(ui.filter.changeStartMode).toHaveBeenCalled();
    });
  });

  describe('_makeSubMenu()', () => {
    it('should execute for the number of menus specified in the option.', () => {
      const makeMenuElementSpy = jest.spyOn(ui, '_makeMenuElement');

      ui._makeSubMenu();

      expect(makeMenuElementSpy).toHaveBeenCalledTimes(options.menu.length);
    });

    it('should create instance of the menu specified in the option', () => {
      jest.spyOn(ui, '_makeMenuElement');
      const getConstructorName = (constructor) => constructor.toString().match(/^class (.+?) /)[1];

      ui._makeSubMenu();

      options.menu.forEach((menu) => {
        const constructorNameOfInstance = getConstructorName(ui[menu].constructor);
        const expected = menu.replace(/^[a-z]/, ($0) => $0.toUpperCase());

        expect(constructorNameOfInstance).toBe(expected);
      });
    });
  });

  describe('initCanvas()', () => {
    beforeEach(() => {
      ui._editorElement = {
        querySelector: jest.fn(() => document.createElement('div')),
      };
      ui._actions.main = {
        initLoadImage: jest.fn(() => Promise.resolve()),
      };
    });

    it('should be run as required when initCanvas is executed', async () => {
      ui.activeMenuEvent = jest.fn();
      const addLoadEventSpy = jest.spyOn(ui, '_addLoadEvent');

      await ui.initCanvas();

      expect(addLoadEventSpy).toHaveBeenCalled();
    });

    it('should not be run when has not image path', () => {
      jest.spyOn(ui, '_getLoadImage').mockReturnValue({ path: '' });

      ui.initCanvas();

      expect(ui._actions.main.initLoadImage).not.toHaveBeenCalled();
    });

    it('should be executed even if there is no image path', () => {
      jest.spyOn(ui, '_getLoadImage').mockReturnValue({ path: '' });
      jest.spyOn(ui, '_addLoadEvent');

      ui.initCanvas();

      expect(ui._addLoadEvent).toHaveBeenCalled();
    });
  });

  describe('_setEditorPosition()', () => {
    beforeEach(() => {
      ui._editorElement = document.createElement('div');
      jest.spyOn(ui, '_getCanvasMaxDimension').mockReturnValue({ width: 300, height: 300 });
    });

    it('should be reflected in the bottom of the editor position', () => {
      ui.submenu = true;

      ui._setEditorPosition('bottom');

      expect(ui._editorElement.style).toMatchObject({ top: '150px', left: '0px' });
    });

    it('should be reflected in the top of the editor position', () => {
      ui.submenu = true;

      ui._setEditorPosition('top');

      expect(ui._editorElement.style).toMatchObject({ top: '-150px', left: '0px' });
    });

    it('should be reflected in the left, right of the editor position', () => {
      ui.submenu = true;

      ui._setEditorPosition('left');

      expect(ui._editorElement.style).toMatchObject({ top: '0px', left: '-150px' });
    });

    it('should be reflected in the right of the editor position', () => {
      ui.submenu = true;

      ui._setEditorPosition('right');

      expect(ui._editorElement.style).toMatchObject({ top: '0px', left: '150px' });
    });
  });
});
