import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Invoker from '@/invoker';
import commandFactory from '@/factory/command';
import { stamp, hasStamp } from '@/util';
import { commandNames as commands } from '@/consts';

import addObjectCommand from '@/command/addObject';
import changeSelectionCommand from '@/command/changeSelection';
import loadImageCommand from '@/command/loadImage';
import flipCommand from '@/command/flip';
import addTextCommand from '@/command/addText';
import changeTextStyleCommand from '@/command/changeTextStyle';
import rotateCommand from '@/command/rotate';
import addShapeCommand from '@/command/addShape';
import changeShapeCommand from '@/command/changeShape';
import clearObjectsCommand from '@/command/clearObjects';
import removeObjectCommand from '@/command/removeObject';
import resizeCommand from '@/command/resize';

import img1 from 'fixtures/sampleImage.jpg';
import img2 from 'fixtures/TOAST UI Component.png';

describe('commandFactory', () => {
  let invoker, mockImage, canvas, graphics, dimensions;

  beforeAll(() => {
    commandFactory.register(addObjectCommand);
    commandFactory.register(changeSelectionCommand);
    commandFactory.register(loadImageCommand);
    commandFactory.register(flipCommand);
    commandFactory.register(addTextCommand);
    commandFactory.register(changeTextStyleCommand);
    commandFactory.register(rotateCommand);
    commandFactory.register(addShapeCommand);
    commandFactory.register(changeShapeCommand);
    commandFactory.register(clearObjectsCommand);
    commandFactory.register(removeObjectCommand);
    commandFactory.register(resizeCommand);
  });

  beforeEach(() => {
    dimensions = { width: 100, height: 100 };
    graphics = new Graphics(document.createElement('canvas'));
    invoker = new Invoker();
    mockImage = new fabric.Image(null, dimensions);

    graphics.setCanvasImage('', mockImage);
    canvas = graphics.getCanvas();
  });

  describe('functions', () => {
    it('should register custom command', async () => {
      const testCommand = {
        name: 'testCommand',
        execute: jest.fn(() => Promise.resolve('testCommand')),
        undo: jest.fn(() => Promise.resolve()),
      };
      commandFactory.register(testCommand);

      const command = commandFactory.create('testCommand');

      expect(command).not.toBeNull();

      const commandName = await invoker.execute('testCommand', graphics);

      expect(commandName).toBe('testCommand');
      expect(testCommand.execute).toHaveBeenCalledWith(graphics);
    });

    it('should pass parameters on execute', async () => {
      commandFactory.register({
        name: 'testCommand',
        execute(compMap, obj1, obj2, obj3) {
          expect(obj1).toBe(1);
          expect(obj2).toBe(2);
          expect(obj3).toBe(3);

          return Promise.resolve();
        },
      });

      await invoker.execute('testCommand', graphics, 1, 2, 3);
    });

    it('should pass parameters on undo', async () => {
      commandFactory.register({
        name: 'testCommand',
        execute() {
          return Promise.resolve();
        },
        undo(compMap, obj1, obj2, obj3) {
          expect(obj1).toBe(1);
          expect(obj2).toBe(2);
          expect(obj3).toBe(3);

          return Promise.resolve();
        },
      });

      await invoker.execute('testCommand', graphics, 1, 2, 3);
      await invoker.undo();
    });
  });

  describe('addObjectCommand', () => {
    let obj;

    beforeEach(() => {
      obj = new fabric.Rect();
    });

    it('should stamp object', async () => {
      await invoker.execute(commands.ADD_OBJECT, graphics, obj);

      expect(hasStamp(obj)).toBe(true);
    });

    it('should add object to canvas', async () => {
      await invoker.execute(commands.ADD_OBJECT, graphics, obj);

      expect(canvas.contains(obj)).toBe(true);
    });

    it('should remove object from canvas', async () => {
      await invoker.execute(commands.ADD_OBJECT, graphics, obj);
      await invoker.undo();

      expect(canvas.contains(obj)).toBe(false);
    });
  });

  describe('changeSelectionCommand', () => {
    let obj;

    beforeEach(() => {
      canvas.getPointer = jest.fn();
      obj = new fabric.Rect({
        width: 10,
        height: 10,
        top: 10,
        left: 10,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      });
      graphics._addFabricObject(obj);
      graphics._onMouseDown({ target: obj });

      const props = [
        {
          id: graphics.getObjectId(obj),
          width: 30,
          height: 30,
          top: 30,
          left: 30,
          scaleX: 0.5,
          scaleY: 0.5,
          angle: 10,
        },
      ];
      const makeCommand = commandFactory.create(commands.CHANGE_SELECTION, graphics, props);
      makeCommand.execute(graphics, props);
      invoker.pushUndoStack(makeCommand);
    });

    it('should work undo command correctly', async () => {
      await invoker.undo();

      expect(obj).toMatchObject({
        width: 10,
        height: 10,
        left: 10,
        top: 10,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      });
    });

    it('should work redo command correctly', async () => {
      await invoker.undo();
      await invoker.redo();

      expect(obj).toMatchObject({
        width: 30,
        height: 30,
        left: 30,
        top: 30,
        scaleX: 0.5,
        scaleY: 0.5,
        angle: 10,
      });
    });
  });

  describe('loadImageCommand', () => {
    const img = new fabric.Image(img1);

    beforeEach(() => {
      graphics.setCanvasImage('', null);
    });

    it('should clear canvas', async () => {
      jest.spyOn(canvas, 'clear');

      await invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img);

      expect(canvas.clear).toHaveBeenCalled();
    });

    it('should load new image', async () => {
      const changedSize = await invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img);

      expect(graphics.getImageName()).toBe('image');
      expect(changedSize).toMatchObject({
        oldWidth: expect.any(Number),
        oldHeight: expect.any(Number),
        newWidth: expect.any(Number),
        newHeight: expect.any(Number),
      });
    });

    it('should not include cropzone after running the LOAD_IMAGE command', async () => {
      const objCropzone = new fabric.Object({ type: 'cropzone' });

      await invoker.execute(commands.ADD_OBJECT, graphics, objCropzone);
      await invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img);

      const lastUndoIndex = invoker._undoStack.length - 1;
      const savedObjects = invoker._undoStack[lastUndoIndex].undoData.objects;

      expect(savedObjects).toHaveLength(0);
    });

    it('should be true after LOAD_IMAGE command.', async () => {
      const objCircle = new fabric.Object({ type: 'circle', evented: false });

      await invoker.execute(commands.ADD_OBJECT, graphics, objCircle);
      await invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img);

      const lastUndoIndex = invoker._undoStack.length - 1;
      const [savedObject] = invoker._undoStack[lastUndoIndex].undoData.objects;

      expect(savedObject.evented).toBe(true);
    });

    it('should clear image if not exists prev image', async () => {
      await invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img);
      await invoker.undo();

      expect(graphics.getCanvasImage()).toBeNull();
      expect(graphics.getImageName()).toBe('');
    });

    it('should restore to prev image', async () => {
      const newImg = new fabric.Image(img2);

      await invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img);
      await invoker.execute(commands.LOAD_IMAGE, graphics, 'newImage', newImg);

      expect(graphics.getImageName()).toBe('newImage');

      await invoker.undo();

      expect(graphics.getImageName()).toBe('image');
    });
  });

  describe('flipImageCommand', () => {
    it('should be flipped over to the x-axis.', async () => {
      const flipStatus = mockImage.flipX;

      await invoker.execute(commands.FLIP_IMAGE, graphics, 'flipX');

      expect(mockImage.flipX).toBe(!flipStatus);
    });

    it('should be flipped over to the y-axis.', async () => {
      const flipStatus = mockImage.flipY;

      await invoker.execute(commands.FLIP_IMAGE, graphics, 'flipY');

      expect(mockImage.flipY).toBe(!flipStatus);
    });

    it('should reset flip', async () => {
      mockImage.flipX = true;
      mockImage.flipY = true;

      await invoker.execute(commands.FLIP_IMAGE, graphics, 'reset');

      expect(mockImage).toMatchObject({ flipX: false, flipY: false });
    });

    it('should restore flipX', async () => {
      const flipStatus = mockImage.flipX;

      await invoker.execute(commands.FLIP_IMAGE, graphics, 'flipX');
      await invoker.undo();

      expect(mockImage.flipX).toBe(flipStatus);
    });

    it('should restore flipY', async () => {
      const flipStatus = mockImage.flipY;

      await invoker.execute(commands.FLIP_IMAGE, graphics, 'flipY');
      await invoker.undo();

      expect(mockImage.flipY).toBe(flipStatus);
    });
  });

  describe('textCommand', () => {
    let textObjectId;
    const fontSize = 50;
    const underline = false;
    const newFontSize = 30;
    const newUnderline = true;

    beforeEach(async () => {
      const textObject = await invoker.execute(commands.ADD_TEXT, graphics, 'text', {
        styles: {
          fontSize,
          underline,
        },
      });
      textObjectId = textObject.id;
    });

    it('should set text style', async () => {
      await invoker.execute(commands.CHANGE_TEXT_STYLE, graphics, textObjectId, {
        fontSize: newFontSize,
        underline: newUnderline,
      });

      const textObject = graphics.getObject(textObjectId);

      expect(textObject).toMatchObject({ fontSize: 30, underline: true });
    });

    it('should restore fontSize', async () => {
      await invoker.execute(commands.CHANGE_TEXT_STYLE, graphics, textObjectId, {
        fontSize: newFontSize,
        underline: newUnderline,
      });
      await invoker.undo();

      const textObject = graphics.getObject(textObjectId);

      expect(textObject).toMatchObject({ fontSize, underline });
    });
  });

  describe('rotateCommand', () => {
    it('should add angle', async () => {
      const originAngle = mockImage.angle;

      await invoker.execute(commands.ROTATE_IMAGE, graphics, 'rotate', 10);

      expect(mockImage.angle).toBe(originAngle + 10);
    });

    it('should set angle', async () => {
      mockImage.angle = 100;

      await invoker.execute(commands.ROTATE_IMAGE, graphics, 'setAngle', 30);

      expect(mockImage.angle).toBe(30);
    });

    it('should restore angle', async () => {
      const originalAngle = mockImage.angle;

      await invoker.execute(commands.ROTATE_IMAGE, graphics, 'setAngle', 100);
      await invoker.undo();

      expect(mockImage.angle).toBe(originalAngle);
    });
  });

  describe('shapeCommand', () => {
    let shapeObjectId;
    const defaultStrokeWidth = 12;
    const strokeWidth = 50;

    beforeEach(async () => {
      const shapeObject = await invoker.execute(commands.ADD_SHAPE, graphics, 'rect', {
        strokeWidth: defaultStrokeWidth,
      });
      shapeObjectId = shapeObject.id;
    });

    it('should set strokeWidth', async () => {
      await invoker.execute(commands.CHANGE_SHAPE, graphics, shapeObjectId, { strokeWidth });

      const shapeObject = graphics.getObject(shapeObjectId);

      expect(shapeObject.strokeWidth).toBe(strokeWidth);
    });

    it('should restore strokeWidth', async () => {
      await invoker.execute(commands.CHANGE_SHAPE, graphics, shapeObjectId, { strokeWidth });
      await invoker.undo();

      const shapeObject = graphics.getObject(shapeObjectId);

      expect(shapeObject.strokeWidth).toBe(defaultStrokeWidth);
    });
  });

  describe('clearCommand', () => {
    let canvasContext, objects;

    beforeEach(() => {
      canvasContext = canvas;
      objects = [new fabric.Rect(), new fabric.Rect(), new fabric.Rect()];
    });

    it('should clear all objects', async () => {
      canvas.add.apply(canvasContext, objects);

      expect(canvas.contains(objects[0])).toBe(true);
      expect(canvas.contains(objects[1])).toBe(true);
      expect(canvas.contains(objects[2])).toBe(true);

      await invoker.execute(commands.CLEAR_OBJECTS, graphics);

      expect(canvas.contains(objects[0])).toBe(false);
      expect(canvas.contains(objects[1])).toBe(false);
      expect(canvas.contains(objects[2])).toBe(false);
    });

    it('should restore all objects', async () => {
      canvas.add.apply(canvasContext, objects);

      await invoker.execute(commands.CLEAR_OBJECTS, graphics);
      await invoker.undo();

      expect(canvas.contains(objects[0])).toBe(true);
      expect(canvas.contains(objects[1])).toBe(true);
      expect(canvas.contains(objects[2])).toBe(true);
    });
  });

  describe('removeCommand', () => {
    let object, object2, group;

    beforeEach(() => {
      object = new fabric.Rect({ left: 10, top: 10 });
      object2 = new fabric.Rect({ left: 5, top: 20 });
      group = new fabric.Group();

      graphics.add(object);
      graphics.add(object2);
      graphics.add(group);
      group.add(object, object2);
    });

    it('should remove an object', async () => {
      graphics.setActiveObject(object);

      await invoker.execute(commands.REMOVE_OBJECT, graphics, stamp(object));

      expect(canvas.contains(object)).toBe(false);
    });

    it('should remove objects in group', async () => {
      canvas.setActiveObject(group);

      await invoker.execute(commands.REMOVE_OBJECT, graphics, stamp(group));

      expect(canvas.contains(object)).toBe(false);
      expect(canvas.contains(object2)).toBe(false);
    });

    it('should restore the removed object', async () => {
      canvas.setActiveObject(object);

      await invoker.execute(commands.REMOVE_OBJECT, graphics, stamp(object));
      await invoker.undo();

      expect(canvas.contains(object)).toBe(true);
    });

    it('should restore the removed objects in group', async () => {
      canvas.setActiveObject(group);

      await invoker.execute(commands.REMOVE_OBJECT, graphics, stamp(group));
      await invoker.undo();

      expect(canvas.contains(object)).toBe(true);
      expect(canvas.contains(object2)).toBe(true);
    });

    it('should restore the position of the removed object in group', async () => {
      const activeSelection = graphics.getActiveSelectionFromObjects(canvas.getObjects());
      graphics.setActiveObject(activeSelection);

      await invoker.execute(
        commands.REMOVE_OBJECT,
        graphics,
        graphics.getActiveObjectIdForRemove()
      );
      await invoker.undo();

      expect(object).toMatchObject({ left: 10, top: 10 });
      expect(object2).toMatchObject({ left: 5, top: 20 });
    });
  });

  describe('resizeCommand', () => {
    const newDimensions = { width: 20, height: 20 };

    it('should resize image', async () => {
      await invoker.execute(commands.RESIZE_IMAGE, graphics, newDimensions);

      const { width, height, scaleX, scaleY } = mockImage;

      expect({ width: width * scaleX, height: height * scaleY }).toEqual(newDimensions);
    });

    it('should restore dimensions of image', async () => {
      await invoker.execute(commands.RESIZE_IMAGE, graphics, newDimensions);
      await invoker.undo();

      const { width, height, scaleX, scaleY } = mockImage;

      expect({ width: width * scaleX, height: height * scaleY }).toEqual(dimensions);
    });
  });
});
