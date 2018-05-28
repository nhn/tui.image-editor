/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import snippet from 'tui-code-snippet';
import ImageEditor from '../src/js/imageEditor';
import action from '../src/js/ui/action';

describe('Ui', () => {
    let actions;
    let imageEditorMock;

    /*
    class ImageEditor {
        constructor() {
            this.ui = {};
        }
    }
    */

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
        beforeEach(() => {
            jasmine.clock().install();
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('should not send hostname on usageStatistics option false', () => {
            const mainAction = actions.main;
            const callback = jasmine.createSpy('callback');
            spyOn(imageEditorMock.ui, 'resizeEditor');
            spyOn(imageEditorMock, 'clearUndoStack');
            spyOn(imageEditorMock, 'loadImageFromURL').and.returnValue(new Promise(resolve => {
                resolve(300);
            }));

            mainAction.initLoadImage('path', 'imageName', callback);

            jasmine.clock().tick(1000);
            console.log(imageEditorMock.ui.resizeEditor.calls.count());
        });
    });
    describe('shapeAction', () => {
    });

    describe('cropAction', () => {
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
