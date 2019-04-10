/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/imageEditor.js"
 */
import ImageEditor from '../src/js/imageEditor';

describe('DrawingMode', () => {
    let imageEditor;
    const imageURL = 'base/test/fixtures/sampleImage.jpg';

    beforeEach(done => {
        imageEditor = new ImageEditor(document.createElement('div'), {
            cssMaxWidth: 700,
            cssMaxHeight: 500
        });
        imageEditor.loadImageFromURL(imageURL, 'sampleImage').then(() => {
            done();
        });
    });

    afterEach(() => {
        imageEditor.destroy();
    });

    it('enter a drawing mode with startDrawingMode, CROPPER', () => {
        imageEditor.startDrawingMode('CROPPER');

        expect(imageEditor.getDrawingMode()).toBe('CROPPER');
    });

    it('stop a drawing mode with stopDrawingMode, ie, to normal', () => {
        imageEditor.stopDrawingMode();

        expect(imageEditor.getDrawingMode()).toBe('NORMAL');
    });

    it('enter all drawing mode with startDrawingMode in consecutive order', () => {
        const drawingModes = ['CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'];
        const {length} = drawingModes;
        let i;

        for (i = 0; i < length; i += 1) {
            imageEditor.startDrawingMode(drawingModes[i]);

            expect(imageEditor.getDrawingMode()).toBe(drawingModes[i]);
        }

        expect(imageEditor.startDrawingMode('CROPPER')).toBe(true);
        expect(imageEditor.startDrawingMode('CROPPER')).toBe(true); // call again, should return true
        expect(imageEditor.startDrawingMode('NOT_A_DRAWING_MODE')).toBe(false);
    });
});
