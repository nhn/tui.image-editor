/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/ui.js"
 */
import snippet from 'tui-code-snippet';
import {Promise} from '../src/js/util';
import UI from '../src/js/ui';
import {HELP_MENUS} from '../src/js/consts';

describe('UI', () => {
    let ui;
    let uiOptions;
    beforeEach(() => {
        uiOptions = {
            loadImage: {
                path: 'mockImagePath',
                name: ''
            },
            menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
            initMenu: 'shape',
            menuBarPosition: 'bottom'
        };
        ui = new UI(document.createElement('div'), uiOptions, {});
    });

    describe('Destroy()', () => {
        it('"_destroyAllMenu()" The "destroy" function of all menu instances must be executed.', () => {
            snippet.forEach(uiOptions.menu, menuName => {
                spyOn(ui[menuName], 'destroy');
            });

            ui._destroyAllMenu();

            snippet.forEach(uiOptions.menu, menuName => {
                expect(ui[menuName].destroy).toHaveBeenCalled();
            });
        });

        it('"_removeUiEvent()" must execute "removeEventListener" of all menus.', () => {
            const allUiButtonElementName = [...uiOptions.menu, ...HELP_MENUS];
            snippet.forEach(allUiButtonElementName, elementName => {
                spyOn(ui._buttonElements[elementName], 'removeEventListener');
            });

            ui._removeUiEvent();

            snippet.forEach(allUiButtonElementName, elementName => {
                expect(ui._buttonElements[elementName].removeEventListener).toHaveBeenCalled();
            });
        });
    });

    describe('_changeMenu()', () => {
        beforeEach(() => {
            ui.submenu = 'shape';
            spyOn(ui, 'resizeEditor');
            spyOn(ui.shape, 'changeStandbyMode');
            spyOn(ui.filter, 'changeStartMode');
            ui._actions.main = {
                changeSelectableAll: jasmine.createSpy('changeSelectableAll')
            };
            ui._changeMenu('filter', false, false);
        });
        it('When the menu changes, the changeStartMode () of the menu instance to be changed must be executed.', () => {
            expect(ui.shape.changeStandbyMode).toHaveBeenCalled();
        });

        it('When the menu changes, the changeStandbyMode () of the existing menu instance must be executed.', () => {
            expect(ui.filter.changeStartMode).toHaveBeenCalled();
        });
    });

    describe('_makeSubMenu()', () => {
        it('MakeMenuElement should be executed for the number of menus specified in the option.', () => {
            spyOn(ui, '_makeMenuElement');

            ui._makeSubMenu();
            expect(ui._makeMenuElement.calls.count()).toBe(uiOptions.menu.length);
        });

        it('Instance of the menu specified in the option must be created.', () => {
            spyOn(ui, '_makeMenuElement');
            const getConstructorName = constructor => (
                constructor.toString().match(/^function\s(.+?)\(/)[1]
            );

            ui._makeSubMenu();
            snippet.forEach(uiOptions.menu, menuName => {
                const constructorNameOfInstance = getConstructorName(ui[menuName].constructor);
                const expected = menuName.replace(/^[a-z]/, $0 => $0.toUpperCase());
                expect(constructorNameOfInstance).toBe(expected);
            });
        });
    });

    describe('initCanvas()', () => {
        let promise;

        beforeEach(() => {
            promise = new Promise(resolve => {
                resolve();
            });
            ui._editorElement = {
                querySelector: jasmine.createSpy('querySelector').and.returnValue(document.createElement('div'))
            };
            ui._actions.main = {
                initLoadImage: jasmine.createSpy('initLoadImage').and.returnValue(promise)
            };
        });

        it('When initCanvas is executed, some internal methods must be run as required.', done => {
            spyOn(ui, 'activeMenuEvent');
            spyOn(ui, '_addLoadEvent');

            ui.initCanvas();
            promise.then(() => {
                expect(ui.activeMenuEvent).toHaveBeenCalled();
                expect(ui._addLoadEvent).toHaveBeenCalled();
                done();
            });
        });

        it('`initLoadImage()` should not be run when has not image path.', () => {
            spyOn(ui, '_getLoadImage').and.returnValue({path: ''});

            ui.initCanvas();

            expect(ui._actions.main.initLoadImage).not.toHaveBeenCalled();
        });

        it('`_AddLoadEvent()` should be executed even if there is no image path.', () => {
            spyOn(ui, '_getLoadImage').and.returnValue({path: ''});
            spyOn(ui, '_addLoadEvent');

            ui.initCanvas();

            expect(ui._addLoadEvent).toHaveBeenCalled();
        });
    });

    describe('_setEditorPosition()', () => {
        beforeEach(() => {
            ui._editorElement = document.createElement('div');
            spyOn(ui, '_getCanvasMaxDimension').and.returnValue({
                width: 300,
                height: 300
            });
        });

        it('Position is bottom, it should be reflected in the bottom of the editor position.', () => {
            ui.submenu = true;
            ui._setEditorPosition('bottom');

            expect(ui._editorElement.style.top).toBe('150px');
            expect(ui._editorElement.style.left).toBe('0px');
        });

        it('Position is top, it should be reflected in the top of the editor position.', () => {
            ui.submenu = true;
            ui._setEditorPosition('top');

            expect(ui._editorElement.style.top).toBe('-150px');
            expect(ui._editorElement.style.left).toBe('0px');
        });
        it('Position is left, it should be reflected in the left, right of the editor position.', () => {
            ui.submenu = true;
            ui._setEditorPosition('left');

            expect(ui._editorElement.style.top).toBe('0px');
            expect(ui._editorElement.style.left).toBe('-150px');
        });
        it('Position is right, it should be reflected in the right of the editor position.', () => {
            ui.submenu = true;
            ui._setEditorPosition('right');

            expect(ui._editorElement.style.top).toBe('0px');
            expect(ui._editorElement.style.left).toBe('150px');
        });
    });
});
