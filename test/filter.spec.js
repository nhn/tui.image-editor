/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/filter.js"
 */
import ImageEditor from '../src/js/imageEditor';

describe('Filter', () => {
    let imageEditor;
    const imageURL = 'base/test/fixtures/sampleImage.jpg';

    beforeEach(done => {
        imageEditor = new ImageEditor(document.createElement('div'), {
            cssMaxWidth: 700,
            cssMaxHeight: 500
        });
        imageEditor.loadImageFromURL(imageURL, 'sampleImage').then(() => {
            imageEditor.clearUndoStack();
            done();
        });
    });

    afterEach(() => {
        imageEditor.destroy();
    });

    it('applyFilter() can add undo stack', done => {
        imageEditor.applyFilter('colorFilter').then(() => {
            expect(imageEditor.isEmptyUndoStack()).toBe(false);
            done();
        })['catch'](() => {
            fail();
            done();
        });
    });

    it('applyFilter() can not add undo stack at isSilent', done => {
        const isSilent = true;

        imageEditor.applyFilter('colorFilter', {}, isSilent).then(() => {
            expect(imageEditor.isEmptyUndoStack()).toBe(true);
            done();
        })['catch'](() => {
            fail();
            done();
        });
    });

    it('hasFilter', () => {
        imageEditor.applyFilter('colorFilter');

        expect(imageEditor.hasFilter('invert')).toBe(false);
        expect(imageEditor.hasFilter('colorFilter')).toBe(true);
    });

    it('removeFilter() can remove added filter', done => {
        imageEditor.applyFilter('colorFilter').then(() => imageEditor.removeFilter('colorFilter')
        ).then(() => {
            expect(imageEditor.hasFilter('colorFilter')).toBe(false);
            expect(imageEditor.isEmptyUndoStack()).toBe(false);
            done();
        })['catch'](() => {
            fail();
            done();
        });
    });
});
