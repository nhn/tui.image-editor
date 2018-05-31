/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import snippet from 'tui-code-snippet';
import Promise from 'core-js/library/es6/promise';
import ImageEditor from '../src/js/imageEditor';
import action from '../src/js/action';

describe('Ui', () => {
    let actions;
    let imageEditorMock;

    beforeEach(() => {
        action.mixin(ImageEditor);
        imageEditorMock = new ImageEditor(document.createElement('div'), {
            includeUi: {
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
            spyOn(imageEditorMock, 'undo');

            mainAction.undo();

            expect(imageEditorMock.undo).toHaveBeenCalled();
        });

        it('Redo() API should be executed When the redo action occurs', () => {
            spyOn(imageEditorMock, 'isEmptyRedoStack').and.returnValue(false);
            spyOn(imageEditorMock, 'redo');

            mainAction.redo();

            expect(imageEditorMock.redo).toHaveBeenCalled();
        });

        it('removeObject() API should be executed When the delete action occurs', () => {
            imageEditorMock.activeObjectId = 10;
            spyOn(imageEditorMock, 'removeObject');

            mainAction['delete']();

            expect(imageEditorMock.removeObject).toHaveBeenCalled();
            expect(imageEditorMock.activeObjectId).toBe(null);
        });

        it('clearObjects() API should be run and the enabled state should be changed When the deleteAll action occurs', () => {
            spyOn(imageEditorMock, 'clearObjects');
            spyOn(imageEditorMock.ui, 'changeDeleteButtonEnabled');
            spyOn(imageEditorMock.ui, 'changeDeleteAllButtonEnabled');

            mainAction.deleteAll();
            expect(imageEditorMock.clearObjects).toHaveBeenCalled();
            expect(imageEditorMock.ui.changeDeleteButtonEnabled).toHaveBeenCalled();
            expect(imageEditorMock.ui.changeDeleteAllButtonEnabled).toHaveBeenCalled();
        });

        it('loadImageFromFile() API should be executed When the load action occurs', done => {
            const promise = new Promise(resolve => {
                resolve();
            });
            spyOn(imageEditorMock, 'loadImageFromFile').and.returnValue(promise);
            spyOn(imageEditorMock, 'clearUndoStack');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            mainAction.load();

            promise.then(() => {
                expect(imageEditorMock.loadImageFromFile).toHaveBeenCalled();
                expect(imageEditorMock.clearUndoStack).toHaveBeenCalled();
                expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
                done();
            });
        });

        describe('modeChange()', () => {
            it('_changeActivateMode("TEXT") API should be executed When the modeChange("text") action occurs', () => {
                spyOn(imageEditorMock, '_changeActivateMode');

                mainAction.modeChange('text');
                expect(imageEditorMock._changeActivateMode).toHaveBeenCalled();
            });

            it('startDrawingMode() API should be executed When the modeChange("crop") action occurs', () => {
                spyOn(imageEditorMock, 'startDrawingMode');

                mainAction.modeChange('crop');
                expect(imageEditorMock.startDrawingMode).toHaveBeenCalled();
            });

            it('stopDrawingMode(), setDrawingShape(), _changeActivateMode()  API should be executed When the modeChange("shape") action occurs', () => {
                spyOn(imageEditorMock, 'stopDrawingMode');
                spyOn(imageEditorMock, 'setDrawingShape');
                spyOn(imageEditorMock, '_changeActivateMode');

                mainAction.modeChange('shape');
                expect(imageEditorMock.stopDrawingMode).toHaveBeenCalled();
                expect(imageEditorMock.setDrawingShape).toHaveBeenCalled();
                expect(imageEditorMock._changeActivateMode).toHaveBeenCalled();
            });

            it('ui.draw.setDrawMode API should be executed When the modeChange("draw") action occurs', () => {
                spyOn(imageEditorMock.ui.draw, 'setDrawMode');

                mainAction.modeChange('draw');
                expect(imageEditorMock.ui.draw.setDrawMode).toHaveBeenCalled();
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

            cropAction.cancel();
            expect(imageEditorMock.stopDrawingMode).toHaveBeenCalled();
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
            spyOn(imageEditorMock, 'once').and.callThrough();
            spyOn(imageEditorMock, 'addIcon');

            iconAction.addIcon('iconTypeA');
            expect(imageEditorMock.once).toHaveBeenCalled();

            imageEditorMock.fire('mousedown', null, {
                x: 10,
                y: 10
            });
            expected = imageEditorMock.addIcon.calls.mostRecent().args[0];
            expect(expected).toBe('iconTypeA');
        });

        it('registerIcons() API should be executed When the registDefalutIcons action occurs', () => {
            spyOn(imageEditorMock, 'registerIcons');
            iconAction.registDefalutIcons('testType1', 'M1,20L2,10');

            expected = imageEditorMock.registerIcons.calls.mostRecent().args[0];
            expect(expected).toEqual({'testType1': 'M1,20L2,10'});
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
});
