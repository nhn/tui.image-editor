import { fabric } from 'fabric';
import Graphics from '@/graphics';
import { stamp } from '@/util';
import { drawingModes, componentNames as components } from '@/consts';

describe('Graphics', () => {
  const cssMaxWidth = 900;
  const cssMaxHeight = 700;
  let graphics, canvas;

  beforeEach(() => {
    graphics = new Graphics(document.createElement('canvas'), { cssMaxWidth, cssMaxHeight });
    canvas = graphics.getCanvas();
  });

  afterEach(() => {
    graphics.stopDrawingMode();
  });

  it('should have several properties', () => {
    expect(canvas).not.toBeNull();
    expect(canvas).toEqual(expect.any(fabric.Canvas));
    expect(graphics.cssMaxWidth).toBe(900);
    expect(graphics.cssMaxHeight).toBe(700);
    expect(graphics.canvasImage).toBeNull();
    expect(graphics.imageName).toBe('');
    expect(graphics._drawingMode).toBe(drawingModes.NORMAL);
    expect(graphics._componentMap).not.toBeNull();
  });

  it('should be changed after the path has been drawn', () => {
    const pathObj = new fabric.Path('M 0 0 L 100 0 L 100 100 L 0 100 z');
    const { x, y } = pathObj.getCenterPoint();

    graphics._onPathCreated({ path: pathObj });

    expect(pathObj.originX).toBe('center');
    expect(pathObj.originY).toBe('center');
    expect(pathObj.left).toBe(x);
    expect(pathObj.top).toBe(y);
  });

  it('should attach canvas events', () => {
    const onMousedown = jest.fn();
    const onObjectAdded = jest.fn();
    const onObjectSelected = jest.fn();

    graphics.on({ mousedown: onMousedown, 'object:added': onObjectAdded });
    graphics.once('object:selected', onObjectSelected);
    graphics.fire('mousedown');
    graphics.fire('mousedown');
    graphics.fire('object:added');
    graphics.fire('object:added');
    graphics.fire('object:selected');
    graphics.fire('object:selected');

    expect(onMousedown).toHaveBeenCalledTimes(2);
    expect(onObjectAdded).toHaveBeenCalledTimes(2);
    expect(onObjectSelected).toHaveBeenCalledTimes(1);
  });

  it('should deactivate all objects', () => {
    const triangle = new fabric.Triangle({ width: 20, height: 30 });

    canvas.add(triangle).setActiveObject(triangle);
    expect(canvas.getActiveObject()).not.toBeNull();

    graphics.deactivateAll();
    expect(canvas.getActiveObject()).toBeNull();
  });

  it('should render objects', () => {
    let beforeRender = false;
    const triangle = new fabric.Triangle({ width: 20, height: 30 });

    canvas.add(triangle);
    canvas.on('before:render', () => {
      beforeRender = true;
    });
    canvas.on('after:render', () => expect(beforeRender).toBe(true));
    graphics.renderAll();
  });

  it('should remove a object or group by id', () => {
    const triangle = new fabric.Triangle({ width: 20, height: 30 });

    graphics.add(triangle);
    const objectId = stamp(triangle);
    graphics.removeObjectById(objectId);

    expect(graphics.getObjects()).toHaveLength(0);
  });

  it('should switch drawing modes', () => {
    Object.keys(drawingModes).forEach((modeName) => {
      graphics.startDrawingMode(modeName);
      expect(graphics.getDrawingMode()).toBe(modeName);

      graphics.stopDrawingMode();
      expect(graphics.getDrawingMode()).toBe(drawingModes.NORMAL);
    });
  });

  it('should get the cropped image data', () => {
    const cropper = graphics.getComponent(components.CROPPER);
    graphics.startDrawingMode(drawingModes.CROPPER);
    jest.spyOn(cropper._cropzone, 'isValid').mockReturnValue(true);
    const cropzoneRect = graphics.getCropzoneRect();

    expect(cropzoneRect).not.toBeNull();
    expect(graphics.getCroppedImageData(cropzoneRect)).toEqual({
      imageName: expect.any(String),
      url: expect.any(String),
    });
  });

  it('should be hidden initially and then redisplayed after completion at toDataURL is executed with a cropzone present', () => {
    const cropper = graphics.getComponent(components.CROPPER);
    const changeVisibilitySpy = jest.spyOn(cropper, 'changeVisibility');

    graphics.startDrawingMode(drawingModes.CROPPER);
    graphics.toDataURL();

    expect(changeVisibilitySpy).toHaveBeenNthCalledWith(1, false);
    expect(changeVisibilitySpy).toHaveBeenNthCalledWith(2, true);
  });

  it('should set brush setting into LINE_DRAWING, FREE_DRAWING', () => {
    graphics.startDrawingMode(drawingModes.LINE_DRAWING);
    graphics.setBrush({ width: 12, color: 'FFFF00' });
    const brush = canvas.freeDrawingBrush;

    expect(brush).toMatchObject({ width: 12, color: 'rgba(255,255,0,1)' });
  });

  it('should change a drawing shape', () => {
    const shapeComp = graphics.getComponent(components.SHAPE);
    graphics.setDrawingShape('circle', {
      fill: 'transparent',
      stroke: 'blue',
      strokeWidth: 3,
      rx: 10,
      ry: 100,
    });

    expect(shapeComp._type).toBe('circle');
    expect(shapeComp._options).toEqual({
      strokeWidth: 3,
      stroke: 'blue',
      fill: 'transparent',
      width: 1,
      height: 1,
      rx: 10,
      ry: 100,
      lockSkewingX: true,
      lockSkewingY: true,
      bringForward: true,
      isRegular: false,
    });
  });

  it('should register custom icon', () => {
    const pathMap = { customIcon: 'M 0 0 L 20 20 L 10 10 Z' };
    const iconComp = graphics.getComponent(components.ICON);
    graphics.registerPaths(pathMap);

    expect(iconComp._pathMap).toMatchObject(pathMap);
  });

  it('should not have the filter', () => {
    expect(graphics.hasFilter('Grayscale')).toBe(false);
  });

  describe('pasteObject()', () => {
    let targetObject1, targetObject2;

    beforeEach(() => {
      targetObject1 = new fabric.Object({});
      targetObject2 = new fabric.Object({});

      canvas.add(targetObject1);
      canvas.add(targetObject2);
    });

    it('should be duplicated as many as the number of objects in the group', async () => {
      const groupObject = graphics.getActiveSelectionFromObjects(canvas.getObjects());
      graphics.setActiveObject(groupObject);
      graphics.resetTargetObjectForCopyPaste();

      await graphics.pasteObject();

      expect(canvas.getObjects()).toHaveLength(4);
    });

    it('should be duplicated', async () => {
      graphics.setActiveObject(targetObject1);
      graphics.resetTargetObjectForCopyPaste();

      await graphics.pasteObject();

      expect(canvas.getObjects()).toHaveLength(3);
    });
  });
});
