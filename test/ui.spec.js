/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/ui.js"
 */
import snippet from 'tui-code-snippet';
import Promise from 'core-js/library/es6/promise';
import UI from '../src/js/ui';

describe('UI', () => {
    let ui;
    let uiOptions;
    beforeEach(() => {
        uiOptions = {
            loadImage: {
                path: '',
                name: ''
            },
            menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
            initMenu: false,
            menuBarPosition: 'bottom'
        };
        ui = new UI(document.createElement('div'), uiOptions, {});
    });
    describe('_changeMenu()', () => {
        it('메뉴가 변경되면 변경되는 메뉴 인스턴스의 changeStartMode()가 실행 되어야 한다.', () => {
        });

        it('메뉴가 변경되면 기존 메뉴 인스턴스의 changeStandbyMode()가 실행 되어야 한다.', () => {
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
                constructor.toString().match(/^function\s(.+)\(/)[1]
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
        it('When initCanvas is executed, some internal methods must be run as required.', done => {
            const promise = new Promise(resolve => {
                resolve();
            });
            ui._editorElement = {
                querySelector: jasmine.createSpy('querySelector').and.returnValue(document.createElement('div'))
            };
            ui._actions.main = {
                initLoadImage: jasmine.createSpy('initLoadImage').and.returnValue(promise)
            };

            spyOn(ui, '_addDownloadEvent');
            spyOn(ui, '_addLoadEvent');
            spyOn(ui, '_addMenuEvent');
            spyOn(ui, '_addSubMenuEvent');
            spyOn(ui, '_addHelpActionEvent');

            ui.initCanvas();
            promise.then(() => {
                expect(ui._addDownloadEvent).toHaveBeenCalled();
                expect(ui._addLoadEvent).toHaveBeenCalled();
                expect(ui._addMenuEvent).toHaveBeenCalled();
                expect(ui._addSubMenuEvent).toHaveBeenCalled();
                expect(ui._addHelpActionEvent).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('_getEditorPosition()', () => {
        it('Position is bottom, it should be reflected in the bottom of the editor position.', () => {
            ui.submenu = true;
            expect(ui._getEditorPosition('bottom')).toEqual({
                top: 0,
                bottom: 150,
                left: 0,
                right: 0
            });
        });

        it('Position is top, it should be reflected in the top of the editor position.', () => {
            ui.submenu = true;
            expect(ui._getEditorPosition('top')).toEqual({
                top: 150,
                bottom: 0,
                left: 0,
                right: 0
            });
        });
        it('Position is left, it should be reflected in the left, right of the editor position.', () => {
            ui.submenu = true;
            expect(ui._getEditorPosition('left')).toEqual({
                top: 0,
                bottom: 0,
                left: 248,
                right: 248
            });
        });
        it('Position is right, it should be reflected in the right of the editor position.', () => {
            ui.submenu = true;
            expect(ui._getEditorPosition('right')).toEqual({
                top: 0,
                bottom: 0,
                left: 0,
                right: 248
            });
        });
    });
});
