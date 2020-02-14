/**
 * @fileoverview Test env
 * @author NHN Ent. FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import Promise from 'core-js/library/es6/promise';
import ImageEditor from '../src/js/imageEditor';
import consts from '../src/js/consts';

describe('ImageEditor', () => {
    // hostnameSent module scope variable can not be reset.
    // maintain cases with xit as it always fail, if you want to test these cases, change xit to fit one by one
    describe('constructor', () => {
        let imageEditor, el;

        beforeEach(() => {
            el = document.createElement('div');
            spyOn(snippet, 'sendHostname');

            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });
        });

        afterEach(() => {
            imageEditor.destroy();
        });

        xit('should send hostname by default', () => {
            imageEditor = new ImageEditor(el);

            expect(snippet.sendHostname).toHaveBeenCalled();
        });

        xit('should not send hostname on usageStatistics option false', () => {
            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });

            expect(snippet.sendHostname).not.toHaveBeenCalled();
        });

        it('removeObjectStream () must be executed as many times as the length of the Object array.', done => {
            const promise = new Promise(resolve => {
                resolve();
            });

            spyOn(imageEditor, '_removeObjectStream').and.callThrough();
            spyOn(imageEditor, 'removeObject').and.returnValue(promise);

            const removeJobsSequens = [1, 2, 3, 4];
            const expected = removeJobsSequens.length + 1;
            const removeObjectStremPromise = imageEditor._removeObjectStream(removeJobsSequens);

            removeObjectStremPromise.then(() => {
                expect(imageEditor._removeObjectStream.calls.count()).toBe(expected);
                done();
            });
        });

        it('`preventDefault` of BACKSPACE key events should not be executed when object is selected state.', () => {
            const spyCallback = jasmine.createSpy();

            spyOn(imageEditor._graphics, 'getActiveObject').and.returnValue(null);
            spyOn(imageEditor._graphics, 'getActiveObjects').and.returnValue(null);

            imageEditor._onKeyDown({
                keyCode: consts.keyCodes.BACKSPACE,
                preventDefault: spyCallback
            });

            expect(spyCallback).not.toHaveBeenCalled();
        });

        describe('removeActiveObject()', () => {
            it('_removeObjectStream should be executed when group exists.', () => {
                spyOn(imageEditor._graphics, 'getActiveObject');
                const activeSelection = {
                    type: 'activeSelection',
                    size() {
                        return 3;
                    },
                    getObjects() {
                        return [1, 2, 3];
                    }
                };
                spyOn(imageEditor._graphics, 'getActiveObjects').and.returnValue(activeSelection);
                spyOn(imageEditor, '_removeObjectStream');
                spyOn(imageEditor, 'discardSelection');

                imageEditor.removeActiveObject();

                expect(imageEditor.discardSelection).toHaveBeenCalled();
                expect(imageEditor._removeObjectStream).toHaveBeenCalled();
            });

            it('removeObject must be executed when group does not exist.', () => {
                spyOn(imageEditor._graphics, 'getActiveObjects').and.returnValue(null);
                spyOn(imageEditor._graphics, 'getActiveObject').and.returnValue(jasmine.any(Object));
                spyOn(imageEditor._graphics, 'getObjectId');
                spyOn(imageEditor, 'removeObject');

                imageEditor.removeActiveObject();
                expect(imageEditor.removeObject).toHaveBeenCalled();
            });
        });

        describe('_pasteFabricObject()', () => {
            let graphics, canvas, targetObject1, targetObject2;

            beforeEach(() => {
                graphics = imageEditor._graphics;
                canvas = graphics.getCanvas();
                targetObject1 = new fabric.Object({});
                targetObject2 = new fabric.Object({});

                canvas.add(targetObject1);
                canvas.add(targetObject2);
            });

            it('Group objects must be duplicated as many as the number of objects in the group.', done => {
                const groupObject = graphics.getActivateGroupFromObjects(canvas.getObjects());

                imageEditor._targetObjectForCopyPaste = groupObject;

                imageEditor._pasteFabricObject().then(() => {
                    expect(canvas.getObjects().length).toBe(4);
                    done();
                });
            });

            it('Only one object should be duplicated.', done => {
                imageEditor._targetObjectForCopyPaste = targetObject1;

                imageEditor._pasteFabricObject().then(() => {
                    expect(canvas.getObjects().length).toBe(3);
                    done();
                });
            });
        });
    });
});









