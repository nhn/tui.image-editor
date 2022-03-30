import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Cropper from '@/component/cropper';
import { eventNames, CROPZONE_DEFAULT_OPTIONS } from '@/consts';

describe('Cropper', () => {
  let cropper, graphics, canvas;

  beforeEach(() => {
    graphics = new Graphics(document.createElement('canvas'));
    canvas = graphics.getCanvas();
    cropper = new Cropper(graphics);
  });

  describe('start()', () => {
    it('should create a cropzone', () => {
      cropper.start();

      expect(cropper._cropzone).toBeDefined();
    });

    it('should be applied predefined default options When creating a cropzone', () => {
      cropper.start();
      const cropzone = cropper._cropzone;

      Object.entries(CROPZONE_DEFAULT_OPTIONS).forEach(([optionName, optionValue]) => {
        expect(cropzone[optionName]).toBe(optionValue);
      });
    });

    it('should add a cropzone to canvas', () => {
      const addSpy = jest.spyOn(canvas, 'add');
      cropper.start();

      expect(addSpy).toHaveBeenCalledWith(cropper._cropzone);
    });

    it('should no action if a croppzone has been defined', () => {
      cropper._cropzone = {};
      const addSpy = jest.spyOn(canvas, 'add');
      cropper.start();

      expect(addSpy).not.toHaveBeenCalled();
    });

    it('should set "evented" of all objects to false', () => {
      const eventedOptions = { evented: true };
      const objects = [
        new fabric.Rect(eventedOptions),
        new fabric.Rect(eventedOptions),
        new fabric.Rect(eventedOptions),
      ];
      canvas.add(...objects);

      cropper.start();

      expect(objects[0].evented).toBe(false);
      expect(objects[1].evented).toBe(false);
      expect(objects[2].evented).toBe(false);
    });
  });

  describe('onFabricMouseDown()', () => {
    let fEvent;

    beforeEach(() => {
      fEvent = { e: {} };
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 10, y: 20 });
    });

    it('should set "selection" to false', () => {
      cropper._onFabricMouseDown(fEvent);

      expect(canvas.selection).toBe(false);
    });

    it('should set "startX, startY"', () => {
      cropper._onFabricMouseDown(fEvent);

      expect(cropper._startX).toEqual(10);
      expect(cropper._startY).toEqual(20);
    });
  });

  describe('onFabricMouseMove()', () => {
    beforeEach(() => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 10, y: 20 });
      jest.spyOn(canvas, 'getWidth').mockReturnValue(100);
      jest.spyOn(canvas, 'getHeight').mockReturnValue(200);
    });

    it('should re-render(remove->set->add) cropzone if the mouse moving is over the threshold(=10)', () => {
      cropper._startX = 0;
      cropper._startY = 0;

      cropper.start();
      const removeSpy = jest.spyOn(canvas, 'remove');
      const setSpy = jest.spyOn(cropper._cropzone, 'set');
      const addSpy = jest.spyOn(canvas, 'add');
      cropper._onFabricMouseMove({ e: {} });

      expect(removeSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalled();
      expect(addSpy).toHaveBeenCalled();
    });

    it('should not re-render cropzone if the mouse moving is under the threshold', () => {
      cropper._startX = 14;
      cropper._startY = 18;

      cropper.start();
      const removeSpy = jest.spyOn(canvas, 'remove');
      const setSpy = jest.spyOn(cropper._cropzone, 'set');
      const addSpy = jest.spyOn(canvas, 'add');
      cropper._onFabricMouseMove({ e: {} });

      expect(removeSpy).not.toHaveBeenCalled();
      expect(setSpy).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();
    });
  });

  describe('_calcRectDimensionFromPoint()', () => {
    beforeEach(() => {
      cropper._startX = 10;
      cropper._startY = 20;
      jest.spyOn(canvas, 'getWidth').mockReturnValue(100);
      jest.spyOn(canvas, 'getHeight').mockReturnValue(200);
    });

    it('should return cropzone-left&top (min: 0, max: startX,Y)', () => {
      const dimension = cropper._calcRectDimensionFromPoint(20, -1);

      expect(dimension).toEqual({
        left: 10,
        top: 0,
        width: expect.any(Number),
        height: expect.any(Number),
      });
    });

    it('should calculate and return cropzone-width&height', () => {
      let dimension;

      dimension = cropper._calcRectDimensionFromPoint(30, 40);
      expect(dimension).toEqual({
        left: 10,
        top: 20,
        width: 20,
        height: 20,
      });

      dimension = cropper._calcRectDimensionFromPoint(300, 400);
      expect(dimension).toEqual({
        left: 10,
        top: 20,
        width: 90,
        height: 180,
      });
    });

    it('should create cropzone that has fixed ratio during shift key is pressed.', () => {
      cropper._withShiftKey = true;

      const dimension = cropper._calcRectDimensionFromPoint(100, 200);

      expect(dimension).toEqual({
        left: 10,
        top: 20,
        width: 180,
        height: 180,
      });
    });

    it('should create cropzone that inverted current mouse position during shift key is pressed.', () => {
      cropper._withShiftKey = true;

      const dimension = cropper._calcRectDimensionFromPoint(-10, -20);

      expect(dimension).toEqual({
        left: -10,
        top: 0,
        width: 20,
        height: 20,
      });
    });

    it('should restrict cropzone dimensions to presetRatio', () => {
      const dimension = cropper._calcRectDimensionFromPoint(50, 100, 16 / 9);

      expect(dimension).toEqual({
        left: 10,
        top: 20,
        width: 40,
        height: 22.5, // width / presetRatio -> 60 / 1,777777778
      });
    });

    it('should restrict cropzone within canvas and keep presetRatio when width too large', () => {
      const dimension = cropper._calcRectDimensionFromPoint(110, 100, 16 / 9);

      expect(dimension).toEqual({
        left: 10,
        top: 20,
        width: 90, // maxwidth (100) minus start (10)
        height: 50.625, // width / presetRatio -> 90 / (16/9)
      });
    });

    it('should restrict cropzone within canvas and keep presetRatio when height too large', () => {
      cropper._startY = 177.5;
      const dimension = cropper._calcRectDimensionFromPoint(100, 250, 16 / 9);

      expect(dimension).toEqual({
        left: 10,
        top: 177.5,
        width: 40, // height * presetRatio -> 22.5 * (16/9)
        height: 22.5, // maxwidth (200) minus start (177.5)
      });
    });
  });

  it('should activate cropzone', () => {
    canvas.setActiveObject = jest.fn();
    cropper.start();
    cropper._onFabricMouseUp();

    expect(canvas.setActiveObject).toHaveBeenCalledWith(cropper._cropzone);
  });

  describe('crop()', () => {
    beforeEach(() => {
      cropper.start();
    });

    afterEach(() => {
      cropper.end();
    });

    it('should return cropzone rect', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      const cropzoneRect = cropper.getCropzoneRect();

      expect(cropzoneRect).not.toBeNull();
    });

    it('should return cropzone data if the cropzone is valid', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      const cropzoneRect = cropper.getCropzoneRect();
      const croppedImageData = cropper.getCroppedImageData(cropzoneRect);

      expect(croppedImageData).toEqual({
        imageName: expect.any(String),
        url: expect.any(String),
      });
    });
  });

  describe('presets - setCropzoneRect()', () => {
    beforeEach(() => {
      cropper.start();
    });

    afterEach(() => {
      cropper.end();
    });

    it('should return cropzone rect as a square', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      cropper.setCropzoneRect(1);
      const { width, height } = cropper.getCropzoneRect();

      expect(width).toBe(height);
    });

    it('should return cropzone rect as a 3:2 aspect box', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      cropper.setCropzoneRect(3 / 2);
      const { width, height } = cropper.getCropzoneRect();

      expect((width / height).toFixed(1)).toBe((3 / 2).toFixed(1));
    });

    it('should return cropzone rect as a 4:3 aspect box', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      cropper.setCropzoneRect(4 / 3);
      const { width, height } = cropper.getCropzoneRect();

      expect((width / height).toFixed(1)).toBe((4 / 3).toFixed(1));
    });

    it('should return cropzone rect as a 5:4 aspect box', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      cropper.setCropzoneRect(5 / 4);
      const { width, height } = cropper.getCropzoneRect();

      expect((width / height).toFixed(1)).toBe((5 / 4).toFixed(1));
    });

    it('should return cropzone rect as a 7:5 aspect box', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      cropper.setCropzoneRect(7 / 5);
      const { width, height } = cropper.getCropzoneRect();

      expect((width / height).toFixed(1)).toBe((7 / 5).toFixed(1));
    });

    it('should return cropzone rect as a 16:9 aspect box', () => {
      jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
      cropper.setCropzoneRect(16 / 9);
      const { width, height } = cropper.getCropzoneRect();

      expect((width / height).toFixed(1)).toBe((16 / 9).toFixed(1));
    });

    it('Even in situations with floating point problems, should calculate the exact width you expect.', () => {
      jest.spyOn(canvas, 'getWidth').mockReturnValue(408);
      jest.spyOn(canvas, 'getHeight').mockReturnValue(312);
      const setSpy = jest.spyOn(cropper._cropzone, 'set');

      cropper.setCropzoneRect(16 / 9);

      expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({ width: 408 }));
    });

    it('should remove cropzone of cropper when falsy is passed', () => {
      cropper.setCropzoneRect();
      expect(cropper.getCropzoneRect()).toBeNull();

      cropper.setCropzoneRect(0);
      expect(cropper.getCropzoneRect()).toBeNull();

      cropper.setCropzoneRect(null);
      expect(cropper.getCropzoneRect()).toBeNull();
    });
  });

  describe('end()', () => {
    it('should set cropzone of cropper to null', () => {
      cropper.start();
      cropper.end();

      expect(cropper._cropzone).toBeNull();
    });

    it('should set "evented" of all objects to true', () => {
      const eventedOptions = { evented: false };
      const objects = [
        new fabric.Rect(eventedOptions),
        new fabric.Rect(eventedOptions),
        new fabric.Rect(eventedOptions),
      ];
      canvas.add(...objects);

      cropper.start();
      cropper.end();
      expect(objects[0].evented).toBe(true);
      expect(objects[1].evented).toBe(true);
      expect(objects[2].evented).toBe(true);
    });
  });

  describe('canvas event delegator', () => {
    it('The event of an object with an eventDelegator must fire the graphics.fire registered with the trigger.', () => {
      cropper.start();
      const fireSpy = jest.spyOn(graphics, 'fire');
      const cropzone = cropper._cropzone;

      canvas.fire('object:scaling', { target: cropper._cropzone });

      expect(fireSpy).not.toHaveBeenCalled();
      cropzone.canvasEventTrigger[eventNames.OBJECT_SCALED](cropzone);
      expect(fireSpy).toHaveBeenCalled();
    });
  });
});
