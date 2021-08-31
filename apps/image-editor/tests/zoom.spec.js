import { fabric } from 'fabric';
import ImageEditor from '@/imageEditor';

import '@/command/loadImage';

import img from 'fixtures/sampleImage.jpg';

describe('Zoom', () => {
  let imageEditor, x, y, zoomLevel;

  beforeEach(async () => {
    imageEditor = new ImageEditor(document.createElement('div'), {
      cssMaxWidth: 700,
      cssMaxHeight: 500,
    });
    const image = new fabric.Image(img);
    await imageEditor.loadImageFromURL(image, 'sampleImage');
    x = 0;
    y = 0;
    zoomLevel = 1.0;
  });

  afterEach(() => {
    imageEditor.destroy();
  });

  it('should change zoom of image', () => {
    zoomLevel += 1;
    imageEditor.zoom({ x, y, zoomLevel });

    const canvas = imageEditor._graphics.getCanvas();

    expect(canvas.getZoom()).toBe(zoomLevel);
  });

  it('should reset zoom of image', () => {
    zoomLevel += 1;
    imageEditor.zoom({ x, y, zoomLevel });
    imageEditor.resetZoom();

    const canvas = imageEditor._graphics.getCanvas();

    expect(canvas.getZoom()).toBe(1.0);
  });
});
