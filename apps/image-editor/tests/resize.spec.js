import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Resize from '@/component/resize';

describe('Resize', () => {
  let graphics, resize, mockImage;

  beforeAll(() => {
    graphics = new Graphics(document.createElement('canvas'));
    resize = new Resize(graphics);
  });

  beforeEach(() => {
    mockImage = new fabric.Image(null, { width: 100, height: 100 });
    graphics.setCanvasImage('mockImage', mockImage);
  });

  it('should return current image dimensions', () => {
    let currentDimensions = resize.getCurrentDimensions();

    expect(currentDimensions).toEqual({ width: 100, height: 100 });

    const newDimensions = { width: 20, height: 20 };

    resize.resize(newDimensions);
    currentDimensions = resize.getCurrentDimensions();

    expect(newDimensions).toEqual(currentDimensions);
  });

  it('should return original image dimensions after resizing', () => {
    const originalDimensionsBeforeResizing = resize.getOriginalDimensions();
    const newDimensions = { width: 20, height: 20 };

    resize.resize(newDimensions);
    const originalDimensionsAfterResizing = resize.getOriginalDimensions();

    expect(originalDimensionsBeforeResizing).toEqual(originalDimensionsAfterResizing);
  });

  it('should set original dimensions', () => {
    const newDimensions = { width: 20, height: 20 };

    resize.setOriginalDimensions(newDimensions);
    const originalDimensions = resize.getOriginalDimensions();

    expect(newDimensions).toEqual(originalDimensions);
  });

  it('should resize image', () => {
    const originalDimensions = resize.getOriginalDimensions();
    const newDimensions = { width: 20, height: 20 };

    resize.resize(newDimensions);
    let currentDimensions = resize.getCurrentDimensions();

    expect(newDimensions).toEqual(currentDimensions);

    resize.resize(originalDimensions);
    currentDimensions = resize.getCurrentDimensions();

    expect(originalDimensions).toEqual(currentDimensions);
  });

  it('should set original dimensions when drawing mode is started', () => {
    resize.setOriginalDimensions(null);

    resize.start();

    expect(resize.getOriginalDimensions()).not.toBeNull();
  });

  it('should have end method', () => {
    expect(typeof resize.end === 'function').toBe(true);
  });

  it('should return promise', async () => {
    const newDimensions = { width: 20, height: 20 };

    const obj = await resize.resize(newDimensions);

    expect(obj).toBeUndefined();
  });
});
