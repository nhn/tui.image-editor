/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/zoom.js"
 */
import ImageEditor from '../src/js/imageEditor';

describe('Zoom', () => {
  let imageEditor, x, y, zoomLevel;
  const imageURL = 'base/test/fixtures/sampleImage.jpg';

  beforeEach((done) => {
    imageEditor = new ImageEditor(document.createElement('div'), {
      cssMaxWidth: 700,
      cssMaxHeight: 500,
    });
    imageEditor.loadImageFromURL(imageURL, 'sampleImage').then(() => {
      done();
    });

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
