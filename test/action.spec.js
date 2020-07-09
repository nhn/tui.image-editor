/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/action.js"
 */
import snippet from 'tui-code-snippet';
import {Promise} from '../src/js/util';
import ImageEditor from '../src/js/imageEditor';
import action from '../src/js/action';

describe('Ui', () => {
    let actions;
    let imageEditorMock;

    beforeEach(() => {
        action.mixin(ImageEditor);
        imageEditorMock = new ImageEditor(document.createElement('div'), {
            includeUI: {
                loadImage: false,
                initMenu: 'flip',
                menuBarPosition: 'bottom',
                applyCropSelectionStyle: true
            }
        });
        actions = imageEditorMock.getActions();

        spyOn(snippet, 'imagePing');
    });

    afterEach(() => {
        imageEditorMock.destroy();
    });

    describe('mainAction', () => {
        let mainAction;
        beforeEach(() => {
            mainAction = actions.main;
        });

        it('LoadImageFromURL() API should be executed When the initLoadImage action occurs', done => {
            const promise = new Promise(resolve => {
                resolve(300);
            });
            spyOn(imageEditorMock, 'loadImageFromURL').and.returnValue(promise);
            spyOn(imageEditorMock, 'clearUndoStack');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            mainAction.initLoadImage('path', 'imageName').then(() => {
                expect(imageEditorMock.clearUndoStack).toHaveBeenCalled();
                expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
                expect(imageEditorMock.loadImageFromURL).toHaveBeenCalled();
                done();
            });
        });

        it('Undo() API should be executed When the undo action occurs', () => {
            spyOn(imageEditorMock, 'isEmptyUndoStack').and.returnValue(false);
            spyOn(imageEditorMock, 'undo').and.returnValue({then: () => {}});

            mainAction.undo();

            expect(imageEditorMock.undo).toHaveBeenCalled();
        });

        it('Redo() API should be executed When the redo action occurs', () => {
            spyOn(imageEditorMock, 'isEmptyRedoStack').and.returnValue(false);
            spyOn(imageEditorMock, 'redo').and.returnValue({then: () => {}});

            mainAction.redo();

            expect(imageEditorMock.redo).toHaveBeenCalled();
        });

        it('removeObject() API should be executed When the delete action occurs', () => {
            imageEditorMock.activeObjectId = 10;
            spyOn(imageEditorMock, 'removeActiveObject');

            mainAction['delete']();

            expect(imageEditorMock.removeActiveObject).toHaveBeenCalled();
            expect(imageEditorMock.activeObjectId).toBe(null);
        });

        it('clearObjects() API should be run and the enabled state should be changed When the deleteAll action occurs', () => {
            spyOn(imageEditorMock, 'clearObjects');
            spyOn(imageEditorMock.ui, 'changeHelpButtonEnabled');

            mainAction.deleteAll();

            const changeHelpButtonCalls = imageEditorMock.ui.changeHelpButtonEnabled.calls;

            expect(imageEditorMock.clearObjects).toHaveBeenCalled();
            expect(changeHelpButtonCalls.argsFor(0)[0]).toBe('delete');
            expect(changeHelpButtonCalls.argsFor(1)[0]).toBe('deleteAll');
        });

        it('loadImageFromFile() API should be executed When the load action occurs', done => {
            const promise = new Promise(resolve => {
                resolve();
            });

            spyOn(imageEditorMock, 'loadImageFromFile').and.returnValue(promise);
            spyOn(imageEditorMock, 'clearUndoStack');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            window.URL = {
                createObjectURL: jasmine.createSpy('URL')
            };

            mainAction.load();

            promise.then(() => {
                expect(imageEditorMock.loadImageFromFile).toHaveBeenCalled();
                expect(imageEditorMock.clearUndoStack).toHaveBeenCalled();
                expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('shapeAction', () => {
        let shapeAction;

        beforeEach(() => {
            shapeAction = actions.shape;
        });

        it('changeShape() API should be executed When the changeShape action occurs', () => {
            imageEditorMock.activeObjectId = 10;
            spyOn(imageEditorMock, 'changeShape');

            shapeAction.changeShape({
                strokeWidth: '#000000'
            });
            expect(imageEditorMock.changeShape).toHaveBeenCalled();
        });

        it('setDrawingShape() API should be executed When the setDrawingShape action occurs', () => {
            spyOn(imageEditorMock, 'setDrawingShape');

            shapeAction.setDrawingShape();
            expect(imageEditorMock.setDrawingShape).toHaveBeenCalled();
        });
    });

    describe('cropAction', () => {
        let cropAction;
        beforeEach(() => {
            cropAction = actions.crop;
        });
        it('getCropzoneRect(), stopDrawingMode(), ui.resizeEditor(), ui.changeMenu() API should be executed When the crop action occurs', done => {
            const promise = new Promise(resolve => {
                resolve();
            });
            spyOn(imageEditorMock, 'crop').and.returnValue(promise);
            spyOn(imageEditorMock, 'getCropzoneRect').and.returnValue(true);
            spyOn(imageEditorMock, 'stopDrawingMode');
            spyOn(imageEditorMock.ui, 'resizeEditor');
            spyOn(imageEditorMock.ui, 'changeMenu');

            cropAction.crop();

            expect(imageEditorMock.getCropzoneRect).toHaveBeenCalled();
            expect(imageEditorMock.crop).toHaveBeenCalled();
            promise.then(() => {
                expect(imageEditorMock.stopDrawingMode).toHaveBeenCalled();
                expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
                expect(imageEditorMock.ui.changeMenu).toHaveBeenCalled();
                done();
            });
        });

        it('stopDrawingMode() API should be executed When the cancel action occurs', () => {
            spyOn(imageEditorMock, 'stopDrawingMode');
            spyOn(imageEditorMock.ui, 'changeMenu');

            cropAction.cancel();
            expect(imageEditorMock.stopDrawingMode).toHaveBeenCalled();
            expect(imageEditorMock.ui.changeMenu).toHaveBeenCalled();
        });
    });

    describe('flipAction', () => {
        let flipAction;
        beforeEach(() => {
            flipAction = actions.flip;
        });
        it('{flipType}() API should be executed When the flip(fliptype) action occurs', () => {
            spyOn(imageEditorMock, 'flipX');
            spyOn(imageEditorMock, 'flipY');

            flipAction.flip('flipX');
            expect(imageEditorMock.flipX).toHaveBeenCalled();

            flipAction.flip('flipY');
            expect(imageEditorMock.flipY).toHaveBeenCalled();
        });
    });

    describe('rotateAction', () => {
        let rotateAction;
        beforeEach(() => {
            rotateAction = actions.rotate;
        });

        it('rotate() API should be executed When the rotate action occurs', () => {
            spyOn(imageEditorMock, 'rotate');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            rotateAction.rotate(30);
            expect(imageEditorMock.rotate).toHaveBeenCalled();
            expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
        });

        it('setAngle() API should be executed When the setAngle action occurs', () => {
            spyOn(imageEditorMock, 'setAngle');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            rotateAction.setAngle(30);
            expect(imageEditorMock.setAngle).toHaveBeenCalled();
            expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
        });
    });

    describe('textAction', () => {
        let textAction;
        beforeEach(() => {
            textAction = actions.text;
        });

        it('changeTextStyle() API should be executed When the changeTextStyle action occurs', () => {
            imageEditorMock.activeObjectId = 10;
            spyOn(imageEditorMock, 'changeTextStyle');

            textAction.changeTextStyle({fontSize: 10});
            expect(imageEditorMock.changeTextStyle.calls.mostRecent().args[0]).toBe(10);
            expect(imageEditorMock.changeTextStyle.calls.mostRecent().args[1]).toEqual({fontSize: 10});
        });
    });

    describe('maskAction', () => {
        let maskAction;
        beforeEach(() => {
            maskAction = actions.mask;
        });

        it('applyFilter() API should be executed When the applyFilter action occurs', () => {
            imageEditorMock.activeObjectId = 10;
            spyOn(imageEditorMock, 'applyFilter');

            maskAction.applyFilter();
            expect(imageEditorMock.applyFilter.calls.mostRecent().args[1]).toEqual({maskObjId: 10});
        });
    });

    describe('drawAction', () => {
        let drawAction, expected;
        beforeEach(() => {
            drawAction = actions.draw;
        });

        it('startDrawingMode("FREE_DRAWING") API should be executed When the setDrawMode("free") action occurs', () => {
            spyOn(imageEditorMock, 'startDrawingMode');
            drawAction.setDrawMode('free');

            expected = imageEditorMock.startDrawingMode.calls.mostRecent().args[0];
            expect(expected).toBe('FREE_DRAWING');
        });

        it('setBrush() API should be executed When the setColor() action occurs', () => {
            spyOn(imageEditorMock, 'setBrush');
            drawAction.setColor('#000000');

            expected = imageEditorMock.setBrush.calls.mostRecent().args[0].color;
            expect(expected).toBe('#000000');
        });
    });

    describe('iconAction', () => {
        let iconAction, expected;
        beforeEach(() => {
            iconAction = actions.icon;
        });

        it('add once event mousedown should be executed When the addIcon action occurs', () => {
            const promise = new Promise(resolve => {
                resolve(300);
            });

            spyOn(imageEditorMock, 'changeCursor');
            spyOn(imageEditorMock, 'addIcon').and.returnValue(promise);

            iconAction.addIcon('iconTypeA');
            expect(imageEditorMock.changeCursor).toHaveBeenCalled();

            imageEditorMock.fire('mousedown', null, {
                x: 10,
                y: 10
            });
            expected = imageEditorMock.addIcon.calls.mostRecent().args[0];
            expect(expected).toBe('iconTypeA');
        });
    });

    describe('filterAction', () => {
        let filterAction;
        beforeEach(() => {
            filterAction = actions.filter;
        });

        it('removeFilter() API should be executed When the type of applyFilter is false', () => {
            spyOn(imageEditorMock, 'removeFilter');
            spyOn(imageEditorMock, 'hasFilter').and.returnValue(true);
            filterAction.applyFilter(false, {});

            expect(imageEditorMock.removeFilter).toHaveBeenCalled();
        });

        it('applyFilter() API should be executed When the type of applyFilter is true', () => {
            spyOn(imageEditorMock, 'applyFilter');
            filterAction.applyFilter(true, {});

            expect(imageEditorMock.applyFilter).toHaveBeenCalled();
        });
    });

    describe('commonAction', () => {
        it('Each action returned to the getActions method must contain commonAction.', () => {
            const submenus = ['shape', 'crop', 'flip', 'rotate', 'text', 'mask', 'draw', 'icon', 'filter'];
            snippet.forEach(submenus, submenu => {
                expect(actions[submenu].modeChange).toBeDefined();
                expect(actions[submenu].deactivateAll).toBeDefined();
                expect(actions[submenu].changeSelectableAll).toBeDefined();
                expect(actions[submenu].discardSelection).toBeDefined();
                expect(actions[submenu].stopDrawingMode).toBeDefined();
            });
        });

        describe('modeChange()', () => {
            let commonAction;
            beforeEach(() => {
                commonAction = actions.main;
            });

            it('_changeActivateMode("TEXT") API should be executed When the modeChange("text") action occurs', () => {
                spyOn(imageEditorMock, '_changeActivateMode');

                commonAction.modeChange('text');
                expect(imageEditorMock._changeActivateMode).toHaveBeenCalled();
            });

            it('startDrawingMode() API should be executed When the modeChange("crop") action occurs', () => {
                spyOn(imageEditorMock, 'startDrawingMode');

                commonAction.modeChange('crop');
                expect(imageEditorMock.startDrawingMode).toHaveBeenCalled();
            });

            it('stopDrawingMode(), setDrawingShape(), _changeActivateMode()  API should be executed When the modeChange("shape") action occurs', () => {
                spyOn(imageEditorMock, 'setDrawingShape');
                spyOn(imageEditorMock, '_changeActivateMode');

                commonAction.modeChange('shape');
                expect(imageEditorMock.setDrawingShape).toHaveBeenCalled();
                expect(imageEditorMock._changeActivateMode).toHaveBeenCalled();
            });
        });
    });

    describe('reAction', () => {
        beforeEach(() => {
            imageEditorMock.setReAction();
            spyOn(imageEditorMock.ui, 'changeHelpButtonEnabled');
        });

        describe('undoStackChanged', () => {
            it('If the undo stack has a length greater than zero, the state of changeUndoButtonStatus, changeResetButtonStatus should be true.', () => {
                imageEditorMock.fire('undoStackChanged', 1);

                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(0)).toEqual(['undo', true]);
                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(1)).toEqual(['reset', true]);
            });

            it('If the undo stack has a length of 0, the state of changeUndoButtonStatus, changeResetButtonStatus should be false.', () => {
                imageEditorMock.fire('undoStackChanged', 0);

                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(0)).toEqual(['undo', false]);
                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(1)).toEqual(['reset', false]);
            });
        });

        describe('redoStackChanged', () => {
            it('If the redo stack is greater than zero length, the state of changeRedoButtonStatus should be true.', () => {
                imageEditorMock.fire('redoStackChanged', 1);
                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(0)).toEqual(['redo', true]);
            });

            it('If the redo stack has a length of zero, the state of changeRedoButtonStatus should be false.', () => {
                imageEditorMock.fire('redoStackChanged', 0);
                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(0)).toEqual(['redo', false]);
            });
        });

        describe('objectActivated', () => {
            it('When objectActivated occurs, the state of the delete button should be enabled.', () => {
                imageEditorMock.fire('objectActivated', {id: 1});
                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(0)).toEqual(['delete', true]);
                expect(imageEditorMock.ui.changeHelpButtonEnabled.calls.argsFor(1)).toEqual(['deleteAll', true]);
            });

            it('When objectActivated\'s target is cropzone, changeApplyButtonStatus should be enabled.', () => {
                spyOn(imageEditorMock.ui.crop, 'changeApplyButtonStatus');
                imageEditorMock.fire('objectActivated', {
                    id: 1,
                    type: 'cropzone'
                });
                expect(imageEditorMock.ui.crop.changeApplyButtonStatus.calls.mostRecent().args[0]).toBe(true);
            });

            it('If the target of objectActivated is shape and the existing menu is not shpe, the menu should be changed to shape.', () => {
                imageEditorMock.ui.submenu = 'crop';
                spyOn(imageEditorMock.ui, 'changeMenu');
                spyOn(imageEditorMock.ui.shape, 'setShapeStatus');
                spyOn(imageEditorMock.ui.shape, 'setMaxStrokeValue');
                imageEditorMock.fire('objectActivated', {
                    id: 1,
                    type: 'circle'
                });

                expect(imageEditorMock.ui.changeMenu.calls.mostRecent().args[0]).toBe('shape');
                expect(imageEditorMock.ui.shape.setMaxStrokeValue).toHaveBeenCalled();
            });

            it('If the target of objectActivated is text and the existing menu is not text, the menu should be changed to text.', () => {
                imageEditorMock.ui.submenu = 'crop';
                spyOn(imageEditorMock.ui, 'changeMenu');
                imageEditorMock.fire('objectActivated', {
                    id: 1,
                    type: 'i-text'
                });

                expect(imageEditorMock.ui.changeMenu.calls.mostRecent().args[0]).toBe('text');
            });

            it('If the target of objectActivated is icon and the existing menu is not icon, the menu should be changed to icon.', () => {
                imageEditorMock.ui.submenu = 'crop';
                spyOn(imageEditorMock.ui, 'changeMenu');
                spyOn(imageEditorMock.ui.icon, 'setIconPickerColor');
                imageEditorMock.fire('objectActivated', {
                    id: 1,
                    type: 'icon'
                });

                expect(imageEditorMock.ui.changeMenu.calls.mostRecent().args[0]).toBe('icon');
                expect(imageEditorMock.ui.icon.setIconPickerColor).toHaveBeenCalled();
            });
        });

        describe('addObjectAfter', () => {
            it('When addObjectAfter occurs, the shape\'s maxStrokeValue should be changed to match the size of the added object.', () => {
                spyOn(imageEditorMock.ui.shape, 'setMaxStrokeValue');
                spyOn(imageEditorMock.ui.shape, 'changeStandbyMode');
                imageEditorMock.fire('addObjectAfter', {
                    type: 'circle',
                    width: 100,
                    height: 200
                });

                expect(imageEditorMock.ui.shape.setMaxStrokeValue.calls.mostRecent().args[0]).toBe(100);
                expect(imageEditorMock.ui.shape.changeStandbyMode).toHaveBeenCalled();
            });
        });

        describe('objectScaled', () => {
            it('If objectScaled occurs on an object of type text, fontSize must be changed.', () => {
                imageEditorMock.ui.text.fontSize = 0;
                imageEditorMock.fire('objectScaled', {
                    type: 'i-text',
                    fontSize: 20
                });

                expect(imageEditorMock.ui.text.fontSize).toBe(20);
            });

            it('If objectScaled is for a shape type object and strokeValue is greater than the size of the object, the value should change.', () => {
                spyOn(imageEditorMock.ui.shape, 'getStrokeValue').and.returnValue(20);
                spyOn(imageEditorMock.ui.shape, 'setStrokeValue');
                imageEditorMock.fire('objectScaled', {
                    type: 'rect',
                    width: 10,
                    height: 10
                });
                expect(imageEditorMock.ui.shape.setStrokeValue.calls.mostRecent().args[0]).toBe(10);
            });
        });

        describe('selectionCleared', () => {
            it('If selectionCleared occurs in the text menu state, the menu should be closed.', () => {
                imageEditorMock.ui.submenu = 'text';
                spyOn(imageEditorMock, 'changeCursor');

                imageEditorMock.fire('selectionCleared');
                expect(imageEditorMock.changeCursor.calls.mostRecent().args[0]).toBe('text');
            });
        });
    });
});
