/**
 * @fileoverview Test env
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

import snippet from 'tui-code-snippet';
import ImageEditor from '../src/js/imageEditor';

describe('ImageEditor', () => {
    // hostnameSent module scope variable can not be reset.
    // maintain cases with xit as it always fail, if you want to test these cases, change xit to fit one by one
    describe('constructor', () => {
        let imageEditor, el;

        beforeEach(() => {
            el = document.createElement('div');
            spyOn(snippet, 'imagePing');
        });

        afterEach(() => {
            imageEditor.destroy();
        });

        xit('should send hostname by default', () => {
            imageEditor = new ImageEditor(el);

            expect(snippet.imagePing).toHaveBeenCalled();
        });

        xit('should not send hostname on usageStatistics option false', () => {
            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });

        it('그룹이 존재할때 removeActiveObject()', () => {
            spyOn(imageEditor._graphics, 'getActiveGroupObject').and.returnValue({
                activeObjectGroup: () => [1, 2, 3]
            });
            spyOn(imageEditor, '_removeObjectStream');
            spyOn(imageEditor, 'discardSelection');

            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });
            imageEditor._reomveActiveObject();

            expect(imageEditor._removeObjectStream).toHaveHeenCalled();
        });
        /*
        it('그룹이 존재하지 않을때 removeActiveObject()', () => {
            spyOn(imageEditor._graphics, 'getActiveGroupObject').and.returnValue(null);
            spyOn(imageEditor, '_removeObjectStream');
            spyOn(imageEditor, 'getActiveObject');
            //spyOn(imageEditor, 'getActiveObject');

            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });
            imageEditor._reomveActiveObject();

            expect(imageEditor._removeObjectStream).toHaveHeenCalled();
        });
        */

        it('_removeObjectStream()', done => {
            const promise = new Promise(resolve => {
                resolve();
            });

            imageEditor = new ImageEditor(el, {
                usageStatistics: false
            });

            spyOn(imageEditor, '_removeObjectStream').and.callThrough();
            spyOn(imageEditor, 'removeObject').and.returnValue(promise);

            const removeJobsSequens = [1, 2, 3, 4];
            const removeObjectStremPromise = imageEditor._removeObjectStream(removeJobsSequens);
            const expected = removeJobsSequens.length + 1;

            removeObjectStremPromise.then(() => {
                expect(imageEditor._removeObjectStream.calls.count()).toBe(expected);
                done();
            });
        });
    });
});
