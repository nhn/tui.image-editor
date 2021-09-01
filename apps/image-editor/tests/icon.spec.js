import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Icon from '@/component/icon';

describe('Icon', () => {
  let canvas, graphics, mockImage, icon;

  beforeAll(() => {
    graphics = new Graphics(document.createElement('canvas'));
    canvas = graphics.getCanvas();
    icon = new Icon(graphics);
  });

  beforeEach(() => {
    mockImage = new fabric.Image();
    graphics.setCanvasImage('mockImage', mockImage);
  });

  afterEach(() => {
    canvas.forEachObject((obj) => {
      canvas.remove(obj);
    });
  });

  describe('_onFabricMouseMove()', () => {
    let iconObj, fEvent;

    beforeEach(async () => {
      fEvent = { e: {} };
      icon._startPoint = { x: 300, y: 300 };

      await icon.add('arrow', { left: icon._startPoint.x, top: icon._startPoint.y, color: '#000' });

      [iconObj] = canvas.getObjects();
      iconObj.set({ width: 10, height: 10 });
    });

    it('should increase when dragging to the right-down from the starting point', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 500, y: 500 });

      icon._onFabricMouseMove(fEvent);

      expect(iconObj).toMatchObject({ scaleX: 40, scaleY: 40 });
    });

    it('should increase when dragging to the left-up from the starting point', () => {
      jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 100, y: 100 });

      icon._onFabricMouseMove(fEvent);

      expect(iconObj).toMatchObject({ scaleX: 40, scaleY: 40 });
    });
  });

  it('should insert the activated icon object on canvas', () => {
    icon.add('arrow');

    const activeObj = canvas.getActiveObject();

    expect(activeObj).not.toBeNull();
  });

  it('should insert the icon object on center of canvas image', () => {
    const centerPos = icon.getCanvasImage().getCenterPoint();

    icon.add('arrow');

    const { left, top, strokeWidth } = canvas.getActiveObject();
    const halfStrokeWidth = strokeWidth / 2;

    expect({ x: left + halfStrokeWidth, y: top + halfStrokeWidth }).toEqual(centerPos);
  });

  it('should create the arrow icon when parameter value is arrow', () => {
    const path = icon._pathMap.arrow;

    const createIconSpy = jest.spyOn(icon, '_createIcon').mockReturnValue(new fabric.Object({}));

    icon.add('arrow');

    expect(createIconSpy).toHaveBeenCalledWith(path);
  });

  it('should create the cancel icon when parameter value is cancel', () => {
    const path = icon._pathMap.cancel;

    const createIconSpy = jest.spyOn(icon, '_createIcon').mockReturnValue(new fabric.Object({}));

    icon.add('cancel');

    expect(createIconSpy).toHaveBeenCalledWith(path);
  });

  it('should change color of next inserted icon', () => {
    const color = '#ffffff';

    icon.add('arrow');

    expect(canvas.getActiveObject().fill).not.toBe(color);

    icon.setColor(color);
    icon.add('cancel');

    expect(canvas.getActiveObject().fill).toBe(color);
  });
});
