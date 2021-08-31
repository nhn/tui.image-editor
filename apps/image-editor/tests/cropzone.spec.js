import { fabric } from 'fabric';
import Cropzone from '@/extension/cropzone';

describe('Cropzone', () => {
  const options = {
    left: 10,
    top: 10,
    width: 100,
    height: 100,
    cornerSize: 10,
    strokeWidth: 0,
    cornerColor: 'black',
    fill: 'transparent',
    hasRotatingPoint: false,
    hasBorders: false,
    lockScalingFlip: true,
    lockRotation: true,
  };
  const canvas = new fabric.Canvas();
  canvas.height = 400;
  canvas.width = 300;

  it('should return outer&inner rect coordinates(array)', () => {
    const cropzone = new Cropzone(canvas, options, {});
    const coords = cropzone._getCoordinates();

    expect(coords).toEqual({
      x: [-60, -50, 50, 240],
      y: [-60, -50, 50, 340],
    });
  });

  it('should set left and top between 0 and canvas size', () => {
    const cropzone = new Cropzone(canvas, options, {});

    jest.spyOn(cropzone.canvas, 'getWidth').mockReturnValue(300);
    jest.spyOn(cropzone.canvas, 'getHeight').mockReturnValue(400);
    cropzone.left = -1;
    cropzone.top = -1;
    cropzone._onMoving();

    expect(cropzone).toMatchObject({ top: 0, left: 0 });

    cropzone.left = 1000;
    cropzone.top = 1000;
    cropzone._onMoving();

    expect(cropzone).toMatchObject({ top: 300, left: 200 });
  });

  it('should return whether the cropzone has real area or not', () => {
    const cropzone = new Cropzone(canvas, options, {});

    cropzone.left = -1;
    expect(cropzone.isValid()).toBe(false);

    cropzone.left = 1;
    expect(cropzone.isValid()).toBe(true);

    cropzone.height = -1;
    expect(cropzone.isValid()).toBe(false);

    cropzone.height = 1;
    expect(cropzone.isValid()).toBe(true);
  });

  it('should give the expected value at run', () => {
    const cropzone = new Cropzone(canvas, options, {});
    let resizedCropzone = cropzone._resizeCropZone({ x: 30, y: 40 }, 'tl');

    expect(resizedCropzone).toEqual({
      left: 30,
      top: 40,
      width: 80,
      height: 70,
    });

    resizedCropzone = cropzone._resizeCropZone({ x: 80, y: 50 }, 'tr');

    expect(resizedCropzone).toEqual({
      left: 10,
      top: 50,
      width: 70,
      height: 60,
    });

    resizedCropzone = cropzone._resizeCropZone({ x: 30, y: 40 }, 'bl');

    expect(resizedCropzone).toEqual({
      left: 30,
      top: 10,
      width: 80,
      height: 30,
    });

    resizedCropzone = cropzone._resizeCropZone({ x: 30, y: 40 }, 'br');

    expect(resizedCropzone).toEqual({
      left: 10,
      top: 10,
      width: 20,
      height: 30,
    });
  });

  it('should yield the result of maintaining the ratio at running the resize function at a fixed rate', () => {
    const presetRatio = 5 / 4;
    const cropzone = new Cropzone(canvas, { ...options, width: 50, height: 40, presetRatio }, {});

    ['tl', 'tr', 'mt', 'ml', 'mr', 'mb', 'bl', 'br'].forEach((cornerType) => {
      const { width, height } = cropzone._resizeCropZone({ x: 20, y: 20 }, cornerType);

      expect(width / height).toEqual(presetRatio);
    });
  });
});
