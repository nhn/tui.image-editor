/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/icon.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Icon from '../src/js/component/icon';

describe('Icon', () => {
  let canvas, graphics, mockImage, icon;

  beforeAll(() => {
    graphics = new Graphics($('<canvas>')[0]);
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

    beforeEach((done) => {
      fEvent = { e: {} };
      icon._startPoint = {
        x: 300,
        y: 300,
      };
      icon
        .add('arrow', {
          left: icon._startPoint.x,
          top: icon._startPoint.y,
          color: '#000',
        })
        .then(() => {
          [iconObj] = canvas.getObjects();
          iconObj.set({
            width: 10,
            height: 10,
          });
          done();
        });
    });

    it('When dragging to the right-down from the starting point, the icon scale value should increase.', () => {
      spyOn(canvas, 'getPointer').and.returnValue({
        x: 500,
        y: 500,
      });

      icon._onFabricMouseMove(fEvent);

      expect(iconObj.scaleX).toBe(40);
      expect(iconObj.scaleY).toBe(40);
    });

    it('When dragging to the left-up from the starting point, the icon scale value should increase.', () => {
      spyOn(canvas, 'getPointer').and.returnValue({
        x: 100,
        y: 100,
      });

      icon._onFabricMouseMove(fEvent);

      expect(iconObj.scaleX).toBe(40);
      expect(iconObj.scaleY).toBe(40);
    });
  });

  it('add() should insert the activated icon object on canvas.', () => {
    icon.add('arrow');

    const activeObj = canvas.getActiveObject();

    expect(activeObj).not.toEqual(null);
  });

  it('add() should insert the icon object on center of canvas image.', () => {
    const centerPos = icon.getCanvasImage().getCenterPoint();

    icon.add('arrow');

    const activeObj = canvas.getActiveObject();
    const halfStrokeWidth = activeObj.strokeWidth / 2;

    expect(activeObj.left + halfStrokeWidth).toEqual(centerPos.x);
    expect(activeObj.top + halfStrokeWidth).toEqual(centerPos.y);
  });

  it('add() should create the arrow icon when parameter value is "arrow".', () => {
    const path = icon._pathMap.arrow;

    spyOn(icon, '_createIcon').and.returnValue(new fabric.Object({}));

    icon.add('arrow');

    expect(icon._createIcon).toHaveBeenCalledWith(path);
  });

  it('add() should create the cancel icon when parameter value is "cancel".', () => {
    const path = icon._pathMap.cancel;

    spyOn(icon, '_createIcon').and.returnValue(new fabric.Object({}));

    icon.add('cancel');

    expect(icon._createIcon).toHaveBeenCalledWith(path);
  });

  it('setColor() should change color of next inserted icon.', () => {
    let activeObj;
    const color = '#ffffff';

    icon.add('arrow');
    activeObj = canvas.getActiveObject();
    expect(activeObj.fill).not.toEqual(color);

    icon.setColor(color);

    icon.add('cancel');
    activeObj = canvas.getActiveObject();
    expect(activeObj.fill).toEqual(color);
  });
});
