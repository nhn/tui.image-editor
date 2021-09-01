import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Line from '@/component/line';
import { eventNames } from '@/consts';

describe('Line', () => {
  let canvas, graphics, mockImage, line, fEvent;

  beforeEach(() => {
    graphics = new Graphics(document.createElement('canvas'));
    canvas = graphics.getCanvas();
    jest.spyOn(canvas, 'getPointer').mockReturnValue({ x: 30, y: 60 });
    line = new Line(graphics);
    line._line = new fabric.Line([10, 20, 10, 20]);
    mockImage = new fabric.Image();
    graphics.setCanvasImage('mockImage', mockImage);
    fEvent = { e: {} };
  });

  afterEach(() => {
    canvas.forEachObject((obj) => {
      canvas.remove(obj);
    });
  });

  it('should insert the line', () => {
    line._onFabricMouseDown(fEvent);

    expect(canvas.getObjects()).toHaveLength(1);
  });

  it('should draw line located by mouse pointer', () => {
    canvas.add(line._line);
    const [object] = canvas.getObjects();

    expect(object).toMatchObject({ x2: 10, y2: 20 });

    line._onFabricMouseMove(fEvent);

    expect(object).toMatchObject({ x2: 30, y2: 60 });
  });

  it('should restore all drawing objects activated', () => {
    const path = new fabric.Path();
    canvas.add(path);
    const [object] = canvas.getObjects();

    line.start();

    expect(object.evented).toBe(false);

    line.end();

    expect(object.evented).toBe(true);
  });

  it('should fire after the line is drawn', () => {
    line.fire = jest.fn();

    line._onFabricMouseUp(fEvent);

    expect(line.fire).toHaveBeenCalledWith(eventNames.OBJECT_ADDED, expect.any(Object));
  });
});
