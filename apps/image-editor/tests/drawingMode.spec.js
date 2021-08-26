import { fabric } from 'fabric';
import ImageEditor from '@/imageEditor';
import '@/command/loadImage';

import img from 'fixtures/sampleImage.jpg';

describe('DrawingMode', () => {
  let imageEditor;

  beforeEach(async () => {
    imageEditor = new ImageEditor(document.createElement('div'), {
      cssMaxWidth: 700,
      cssMaxHeight: 500,
    });
    const image = new fabric.Image(img);

    await imageEditor.loadImageFromURL(image, 'sampleImage');
  });

  afterEach(() => {
    imageEditor.destroy();
  });

  it('should enter a drawing mode with startDrawingMode, CROPPER', () => {
    imageEditor.startDrawingMode('CROPPER');

    expect(imageEditor.getDrawingMode()).toBe('CROPPER');
  });

  it('should stop a drawing mode with stopDrawingMode, ie, to normal', () => {
    imageEditor.stopDrawingMode();

    expect(imageEditor.getDrawingMode()).toBe('NORMAL');
  });

  it('should enter all drawing mode with startDrawingMode in consecutive order', () => {
    ['CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE', 'RESIZE'].forEach(
      (drawingMode) => {
        imageEditor.startDrawingMode(drawingMode);

        expect(imageEditor.getDrawingMode()).toBe(drawingMode);
      }
    );

    expect(imageEditor.startDrawingMode('CROPPER')).toBe(true);
    expect(imageEditor.startDrawingMode('CROPPER')).toBe(true); // call again, should return true
    expect(imageEditor.startDrawingMode('NOT_A_DRAWING_MODE')).toBe(false);
  });
});
