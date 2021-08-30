import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Shape from '@/component/shape';
import { resize } from '@/helper/shapeResizeHelper';
import { getFillImageFromShape, getCachedCanvasImageElement } from '@/helper/shapeFilterFillHelper';

describe('Shape', () => {
  let canvas, graphics, mockImage, fEvent, shape, shapeObj;

  beforeAll(() => {
    graphics = new Graphics(document.createElement('canvas'));
    canvas = graphics.getCanvas();
    shape = new Shape(graphics);
  });

  beforeEach(() => {
    mockImage = new fabric.Image();
    graphics.setCanvasImage('mockImage', mockImage);
    fEvent = { e: {} };
  });

  afterEach(() => {
    canvas.forEachObject((obj) => {
      canvas.remove(obj);
    });
  });

  it('should be calculated correctly.', () => {
    const pointer = canvas.getPointer(fEvent.e);
    const settings = {
      strokeWidth: 0,
      type: 'rect',
      left: 150,
      top: 200,
      width: 40,
      height: 40,
      originX: 'center',
      originY: 'center',
    };
    shape.add('rect', settings);
    [shapeObj] = canvas.getObjects();
    const setSpy = jest.spyOn(shapeObj, 'set');

    resize(shapeObj, pointer);

    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        left: settings.left - settings.width / 2,
        top: settings.top - settings.height / 2,
      })
    );
  });

  it('should be created on canvas(rect)', () => {
    shape.add('rect');
    [shapeObj] = canvas.getObjects();

    expect(shapeObj.get('type')).toBe('rect');
  });

  it('should be created on canvas(circle)', () => {
    shape.add('circle');
    [shapeObj] = canvas.getObjects();

    expect(shapeObj.get('type')).toBe('circle');
  });

  it('should be created on canvas(triangle)', () => {
    shape.add('triangle');

    [shapeObj] = canvas.getObjects();

    expect(shapeObj.type).toBe('triangle');
  });

  it('should be set the rectangle object when add() is called with no options', () => {
    shape.add('rect');
    [shapeObj] = canvas.getObjects();

    expect(shapeObj).toMatchObject({ width: 1, height: 1 }); // strokeWidth: 1, width: 1, height: 1
  });

  it('should be set the circle object when add() is called with no options', () => {
    shape.add('circle');
    [shapeObj] = canvas.getObjects();

    expect(shapeObj).toMatchObject({ width: 0, height: 0 });
  });

  it('should be set the triangle object when add() is called with no options', () => {
    shape.add('triangle');
    [shapeObj] = canvas.getObjects();

    expect(shapeObj).toMatchObject({ width: 1, height: 1 }); // strokeWidth: 1, width: 1, height: 1
  });

  it('should be set the rectangle object when add() is called with the options', () => {
    const settings = {
      fill: 'blue',
      stroke: 'red',
      strokeWidth: 10,
      type: 'rect',
      width: 100,
      height: 100,
    };
    shape.add('rect', settings);
    [shapeObj] = canvas.getObjects();

    expect(shapeObj).toMatchObject(settings);
  });

  it('should be set the circle object when add() is called with the options', () => {
    const settings = {
      fill: 'blue',
      stroke: 'red',
      strokeWidth: 3,
      type: 'circle',
      rx: 100,
      ry: 50,
    };
    shape.add('circle', settings);
    [shapeObj] = canvas.getObjects();

    expect(shapeObj).toMatchObject(settings);
  });

  it('should be set the triangle object when add() is called with the options', () => {
    const settings = {
      fill: 'blue',
      stroke: 'red',
      strokeWidth: 0,
      type: 'triangle',
      width: 100,
      height: 100,
    };
    shape.add('triangle', settings);
    [shapeObj] = canvas.getObjects();

    expect(shapeObj).toMatchObject(settings);
  });

  it('should be changed when change() is called(rect)', () => {
    const settings = { fill: 'blue', stroke: 'red', width: 10, height: 20 };
    shape.add('rect');
    [shapeObj] = canvas.getObjects();
    shape.change(shapeObj, settings);

    expect(shapeObj).toMatchObject(settings);
  });

  it('should be changed when change() is called(circle)', () => {
    const settings = { fill: 'blue', stroke: 'red', rx: 10, ry: 20 };
    shape.add('circle');
    [shapeObj] = canvas.getObjects();
    shape.change(shapeObj, settings);

    expect(shapeObj).toMatchObject(settings);
  });

  it('should be changed when change() is called(triangle)', () => {
    const settings = { fill: 'blue', stroke: 'red', width: 10, height: 20 };
    shape.add('triangle');
    [shapeObj] = canvas.getObjects();
    shape.change(shapeObj, settings);

    expect(shapeObj).toMatchObject(settings);
  });

  describe('Fill - filter type', () => {
    beforeEach(() => {
      getCachedCanvasImageElement(canvas, true);
      mockImage = new fabric.Image();
      graphics.setCanvasImage('mockImage', mockImage);
      shape.add('rect', {
        strokeWidth: 0,
        left: 20,
        top: 30,
        width: 100,
        height: 80,
        fill: {
          type: 'filter',
          filter: [{ pixelate: 20 }],
        },
      });
      [shapeObj] = canvas.getObjects();
    });

    it('should be executed when a movement, rotation, and scaling event of a filter type fill is applied', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 10, y: 10 });
      const _resetPositionFillFilterSpy = jest.spyOn(shape, '_resetPositionFillFilter');
      shapeObj.fire('moving');
      shapeObj.fire('rotating');
      shapeObj.fire('scaling');

      expect(_resetPositionFillFilterSpy).toHaveBeenCalledTimes(3);
    });

    it('should be changed cropX and cropY values of the image filled with the shape background', () => {
      shape._resetPositionFillFilter(shapeObj);
      const fillImage = getFillImageFromShape(shapeObj);

      expect(fillImage).toMatchObject({ cropX: -30, cropY: -10 });
    });

    it('should be the same size as the shape', () => {
      shape._resetPositionFillFilter(shapeObj);
      const fillImage = getFillImageFromShape(shapeObj);

      expect(fillImage).toMatchObject({ width: 100, height: 80 });
    });

    it('should be the same size as the rectangle that draws the rotated object border', () => {
      shapeObj.set({ angle: 40 });
      shape._resetPositionFillFilter(shapeObj);
      const fillImage = getFillImageFromShape(shapeObj);

      expect(fillImage).toMatchSnapshot();
    });

    it('should have the shape reverse rotation value if repositioning is performed while the angle is changed', () => {
      shapeObj.set({ angle: 40 });
      shape._resetPositionFillFilter(shapeObj);
      const { angle } = getFillImageFromShape(shapeObj);

      expect(angle).toBe(-40);
    });

    it('should give the expected result for shapes that go outside the bottom right area of the canvas', async () => {
      const obj = await shape.add('rect', {
        strokeWidth: 0,
        left: 250,
        top: 100,
        width: 200,
        height: 200,
        fill: {
          type: 'filter',
          filter: [{ pixelate: 20 }],
        },
      });
      shapeObj = graphics.getObject(obj.id);
      const fillImage = getFillImageFromShape(shapeObj);

      expect(fillImage).toMatchObject({ top: 75, left: 75, width: 150, height: 150 });
    });

    it('should give the expected result for shapes that go outside the top left area of the canvas', async () => {
      const obj = await shape.add('rect', {
        strokeWidth: 0,
        left: 50,
        top: 30,
        width: 200,
        height: 70,
        fill: {
          type: 'filter',
          filter: [{ pixelate: 20 }],
        },
      });
      shapeObj = graphics.getObject(obj.id);
      const fillImage = getFillImageFromShape(shapeObj);

      expect(fillImage).toMatchSnapshot();
    });

    it('should have the applied filter', () => {
      const fillImage = getFillImageFromShape(shapeObj);

      expect(fillImage.filters).not.toHaveLength(0);
    });
  });

  describe('_onFabricMouseMove()', () => {
    beforeEach(() => {
      shape.add('rect', { left: 100, top: 100 });
      [shapeObj] = canvas.getObjects();
      shape._shapeObj = shapeObj;
    });

    it('should be set to "left" and "top" when the mouse direction is in 1th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 200, y: 120 });

      shape._onFabricMouseMove(fEvent);

      expect(shapeObj).toMatchObject({ originX: 'left', originY: 'top' });
    });

    it('should be set to "right" and "top" when the mouse direction is in 2th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 80, y: 100 });

      shape._onFabricMouseMove(fEvent);

      expect(shapeObj).toMatchObject({ originX: 'right', originY: 'top' });
    });

    it('should be set to "right" and "bottom" when the mouse direction is in 3th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 80, y: 80 });

      shape._onFabricMouseMove(fEvent);

      expect(shapeObj).toMatchObject({ originX: 'right', originY: 'bottom' });
    });

    it('should be set to "left" and "bottom" when the mouse direction is in 4th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 200, y: 80 });

      shape._onFabricMouseMove(fEvent);

      expect(shapeObj).toMatchObject({ originX: 'left', originY: 'bottom' });
    });
  });

  describe('_onFabricMouseUp()', () => {
    let startPoint;

    beforeEach(() => {
      shape.add('circle', { left: 100, top: 100 });
      [shapeObj] = canvas.getObjects();
      shape._shapeObj = shapeObj;
    });

    it('should be the same as start point when the drawing shape is in 1th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 200, y: 120 });
      startPoint = shapeObj.getPointByOrigin('left', 'top');

      shape._onFabricMouseMove(fEvent);
      shape._onFabricMouseUp();

      expect(shapeObj.getPointByOrigin('left', 'top')).toEqual(startPoint);
    });

    it('should be the same as start point when the drawing shape is in 2th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 80, y: 120 });

      startPoint = shapeObj.getPointByOrigin('right', 'top');

      shape._onFabricMouseMove(fEvent);
      shape._onFabricMouseUp();

      expect(shapeObj.getPointByOrigin('right', 'top')).toEqual(startPoint);
    });

    it('should be the same as start point when the drawing shape is in 3th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 80, y: 80 });

      startPoint = shapeObj.getPointByOrigin('right', 'bottom');

      shape._onFabricMouseMove(fEvent);
      shape._onFabricMouseUp();

      expect(shapeObj.getPointByOrigin('right', 'bottom')).toEqual(startPoint);
    });

    it('should be the same as start point when the drawing shape is in 4th quadrant', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 120, y: 80 });

      startPoint = shapeObj.getPointByOrigin('left', 'bottom');

      shape._onFabricMouseMove(fEvent);
      shape._onFabricMouseUp();

      expect(shapeObj.getPointByOrigin('left', 'bottom')).toEqual(startPoint);
    });
  });

  it('should have the same "width" and "height" values when drawing the shape with mouse and the "isRegular" option set to true(x-axis)', () => {
    shape.add('rect', { left: 0, top: 0 });
    shape._withShiftKey = true;
    [shapeObj] = canvas.getObjects();
    shape._shapeObj = shapeObj;
    jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 200, y: 100 });

    shape._onFabricMouseMove(fEvent);
    shape._onFabricMouseUp();

    expect(shapeObj).toMatchObject({ width: 200, height: 200 });
  });

  it('should have the same "width" and "height" values when drawing the shape with mouse and the "isRegular" option set to true(y-axis)', () => {
    shape.add('rect', { left: 0, top: 0 });
    shape._withShiftKey = true;
    [shapeObj] = canvas.getObjects();
    shape._shapeObj = shapeObj;
    jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 100, y: 200 });

    shape._onFabricMouseMove(fEvent);
    shape._onFabricMouseUp();

    expect(shapeObj).toMatchObject({ width: 200, height: 200 });
  });
});
