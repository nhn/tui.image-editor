/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import snippet from 'tui-code-snippet';
import ImageEditor from '../src/js/imageEditor';
import util from '../src/js/util';
import action from '../src/js/ui/action';

describe('Ui', () => {
    let actions;
    let imageEditorMock;

    beforeEach(() => {
        action.mixin(ImageEditor);
        imageEditorMock = new ImageEditor(document.createElement('div'), {
            includeUi: {
                loadImage: false,
                /* menu: ['shape', 'filter'], */
                initMenu: 'flip',
                menuBarPosition: 'bottom',
                applyCropSelectionStyle: true
            }
        });
        actions = imageEditorMock.getActions();

        spyOn(snippet, 'imagePing');
    });

    describe('mainAction', () => {
        let mainAction;
        beforeEach(() => {
            mainAction = actions.main;
        });
        it('LoadImageFromURL() API should be executed When the initLoadImage action occurs', () => {
            const callback = jasmine.createSpy('callback');
            const promise = new Promise(resolve => {
                resolve(300);
            });
            spyOn(imageEditorMock, 'loadImageFromURL').and.returnValue(promise);
            spyOn(imageEditorMock, 'clearUndoStack');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            mainAction.initLoadImage('path', 'imageName', callback);

            expect(imageEditorMock.loadImageFromURL).toHaveBeenCalled();
            promise.then(() => {
                expect(imageEditorMock.clearUndoStack).toHaveBeenCalled();
                expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
                expect(callback).toHaveBeenCalled();
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
            spyOn(imageEditorMock, 'activeObjectId').and.returnValue(true);
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
        it('loadImageFromFile() API should be executed When the load action occurs', () => {
            const promise = new Promise(resolve => {
                resolve();
            });
            spyOn(imageEditorMock, 'loadImageFromFile').and.returnValue(promise);
            spyOn(imageEditorMock, 'clearUndoStack');
            spyOn(imageEditorMock.ui, 'resizeEditor');

            mainAction.load();

            expect(imageEditorMock.loadImageFromFile).toHaveBeenCalled();
            promise.then(() => {
                expect(imageEditorMock.clearUndoStack).toHaveBeenCalled();
                expect(imageEditorMock.ui.resizeEditor).toHaveBeenCalled();
            });
        });
        it('saveAs() native API should be executed When the download action occurs', () => {
            spyOn(imageEditorMock, 'toDataURL').and.returnValue('');
            spyOn(imageEditorMock, 'getImageName').and.returnValue('');
            spyOn(util, 'base64ToBlob').and.returnValue({type: 'mockImageFile.jpg'});
            window.saveAs = jasmine.createSpy('saveAs');

            mainAction.download();

            expect(window.saveAs).toHaveBeenCalled();
        });
        describe('modeChange Action', () => {
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
            spyOn(imageEditorMock, 'activeObjectId').and.returnValue(true);
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
        it('getCropzoneRect(), stopDrawingMode(), ui.resizeEditor(), ui.changeMenu() API should be executed When the crop action occurs', () => {
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
            });
        });
        it('stopDrawingMode() API should be executed When the cancel action occurs', () => {
            spyOn(imageEditorMock, 'stopDrawingMode');

            cropAction.cancel();
            expect(imageEditorMock.stopDrawingMode).toHaveBeenCalled();
        });
    });

    describe('flipAction', () => {

    });

    describe('rotateAction', () => {
    });

    describe('textAction', () => {
    });

    describe('maskAction', () => {
    });

    describe('drawAction', () => {
    });

    describe('iconAction', () => {
    });

    describe('filterAction', () => {
    });
});
