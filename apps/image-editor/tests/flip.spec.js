import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Flip from '@/component/flip';

describe('Flip', () => {
  let graphics, flip, mockImage;

  beforeAll(() => {
    graphics = new Graphics(document.createElement('canvas'));
    flip = new Flip(graphics);
  });

  beforeEach(() => {
    mockImage = new fabric.Image();
    graphics.setCanvasImage('mockImage', mockImage);
  });

  it('should return current flip-setting', () => {
    let setting = flip.getCurrentSetting();

    expect(setting).toEqual({ flipX: false, flipY: false });

    mockImage.set({ flipX: true });
    setting = flip.getCurrentSetting();

    expect(setting).toEqual({ flipX: true, flipY: false });
  });

  it('should set flip-setting', () => {
    flip.set({ flipX: false, flipY: true });

    expect(flip.getCurrentSetting()).toEqual({ flipX: false, flipY: true });
  });

  it('should reset flip-setting to false', () => {
    mockImage.set({ flipX: true, flipY: true });
    flip.reset();

    expect(flip.getCurrentSetting()).toEqual({ flipX: false, flipY: false });
  });

  it('should be flipped over relative to the x-axis', () => {
    flip.flipX();

    expect(flip.getCurrentSetting()).toEqual({ flipX: true, flipY: false });

    flip.flipX();

    expect(flip.getCurrentSetting()).toEqual({ flipX: false, flipY: false });
  });

  it('should be flipped over relative to the y-axis', () => {
    flip.flipY();

    expect(flip.getCurrentSetting()).toEqual({ flipX: false, flipY: true });

    flip.flipY();

    expect(flip.getCurrentSetting()).toEqual({ flipX: false, flipY: false });
  });

  describe('Promise is returned with settings and angle,', () => {
    beforeEach(() => {
      mockImage.angle = 10;
    });

    it('should be changed if it is flipped over relative to the x-axis', async () => {
      const obj = await flip.flipX();

      expect(obj).toEqual({ flipX: true, flipY: false, angle: -10 });
    });

    it('should be changed if it is flipped over relative to the y-axis', async () => {
      const obj = await flip.flipY();

      expect(obj).toEqual({ flipX: false, flipY: true, angle: -10 });
    });

    it('should be changed if it is flipped over relative to the x-axis and y-axis', async () => {
      const obj = await flip.set({ flipX: true, flipY: false });

      expect(obj).toEqual({ flipX: true, flipY: false, angle: -10 });
    });
  });
});
