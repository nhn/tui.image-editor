/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/resize.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '@/graphics';
import Resize from '@/component/resize';

describe('Resize', () => {
  let graphics, resizeModule, mockImage;

  beforeAll(() => {
    graphics = new Graphics($('<canvas>')[0]);
    resizeModule = new Resize(graphics);
  });

  beforeEach(() => {
    mockImage = new fabric.Image(null, {
      width: 100,
      height: 100,
    });
    graphics.setCanvasImage('mockImage', mockImage);
  });

  it('"getCurrentDimensions()" should return current image dimensions', () => {
    const dimensions = resizeModule.getCurrentDimensions();

    expect(dimensions).toEqual({
      width: 100,
      height: 100,
    });

    const newDimensions = {
      width: 20,
      height: 20,
    };

    resizeModule.resize(newDimensions);
    expect(newDimensions).toEqual(resizeModule.getCurrentDimensions());
  });

  it('"getOriginalDimensions()" should return original image dimensions after resizing', () => {
    const originalDimensions = resizeModule.getOriginalDimensions();
    const newDimensions = {
      width: 20,
      height: 20,
    };

    resizeModule.resize(newDimensions);
    resizeModule.getOriginalDimensions();

    expect(originalDimensions).toEqual(resizeModule.getOriginalDimensions());
  });

  it('"setOriginalDimensions()" should set original dimensions', () => {
    const newDimensions = {
      width: 20,
      height: 20,
    };

    resizeModule.setOriginalDimensions(newDimensions);

    expect(newDimensions).toEqual(resizeModule.getOriginalDimensions());
  });

  it('"resize()" should resize image', () => {
    const originalDimensions = resizeModule.getOriginalDimensions();
    const newDimensions = {
      width: 20,
      height: 20,
    };

    resizeModule.resize(newDimensions);
    expect(newDimensions).toEqual(resizeModule.getCurrentDimensions());

    resizeModule.resize(originalDimensions);
    expect(originalDimensions).toEqual(resizeModule.getCurrentDimensions());
  });

  it('"start()" should setted original dimensions', () => {
    resizeModule.setOriginalDimensions(null);

    resizeModule.start();

    expect(resizeModule.getOriginalDimensions()).not.toBeNull();
  });

  it('"end()" function is defined', () => {
    expect(typeof resizeModule.end === 'function').toBeTruthy();
  });

  it('"resize()" returned promise', (done) => {
    const newDimensions = {
      width: 20,
      height: 20,
    };

    resizeModule.resize(newDimensions).then((obj) => {
      expect(obj).toBeUndefined();
      done();
    });
  });
});
