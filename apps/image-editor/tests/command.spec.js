import snippet from 'tui-code-snippet';
import { fabric } from 'fabric';
import Graphics from '@/graphics';
import Invoker from '@/invoker';
import commandFactory from '@/factory/command';
import { Promise } from '@/util';
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
    it('should register custom command', () => {
      const testCommand = { name: 'testCommand', execute() {}, undo() {} };

      jest.spyOn(testCommand, 'execute').mockReturnValue(Promise.resolve('testCommand'));
      jest.spyOn(testCommand, 'undo').mockReturnValue(Promise.resolve());

      commandFactory.register(testCommand);

      const command = commandFactory.create('testCommand');

      expect(command).not.toBeNull();

      return invoker.execute('testCommand', graphics).then((commandName) => {
        expect(commandName).toBe('testCommand');
        expect(testCommand.execute).toHaveBeenCalledWith(graphics);
      });
    });

    it('should pass parameters on execute', () => {
      commandFactory.register({
        name: 'testCommand',
        execute(compMap, obj1, obj2, obj3) {
          expect(obj1).toBe(1);
          expect(obj2).toBe(2);
          expect(obj3).toBe(3);

          return Promise.resolve();
        },
      });

      return invoker.execute('testCommand', graphics, 1, 2, 3).then(() => {});
    });

    it('should pass parameters on undo', () => {
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

      return invoker.execute('testCommand', graphics, 1, 2, 3).then(() => invoker.undo());
    });
  });

  describe('addObjectCommand', () => {
    let obj;

    beforeEach(() => {
      obj = new fabric.Rect();
    });

    it('should stamp object', () => {
      return invoker.execute(commands.ADD_OBJECT, graphics, obj).then(() => {
        expect(snippet.hasStamp(obj)).toBe(true);
      });
    });

    it('should add object to canvas', () => {
      return invoker.execute(commands.ADD_OBJECT, graphics, obj).then(() => {
        expect(canvas.contains(obj)).toBe(true);
      });
    });

    it('should remove object from canvas', () => {
      return invoker
        .execute(commands.ADD_OBJECT, graphics, obj)
        .then(() => invoker.undo())
        .then(() => expect(canvas.contains(obj)).toBe(false));
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

    it('should work undo command correctly', () => {
      return invoker.undo().then(() => {
        expect(obj).toEqual(
          expect.objectContaining({
            width: 10,
            height: 10,
            left: 10,
            top: 10,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
          })
        );
      });
    });

    it('should work redo command correctly', () => {
      return invoker.undo().then(() => {
        invoker.redo().then(() => {
          expect(obj).toEqual(
            expect.objectContaining({
              width: 30,
              height: 30,
              left: 30,
              top: 30,
              scaleX: 0.5,
              scaleY: 0.5,
              angle: 10,
            })
          );
        });
      });
    });
  });

  describe('loadImageCommand', () => {
    const img = new fabric.Image(img1);

    beforeEach(() => {
      graphics.setCanvasImage('', null);
    });

    it('should clear canvas', () => {
      jest.spyOn(canvas, 'clear');

      return invoker
        .execute(commands.LOAD_IMAGE, graphics, 'image', img)
        .then(() => expect(canvas.clear).toHaveBeenCalled());
    });

    it('should load new image', () => {
      return invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img).then((changedSize) => {
        expect(graphics.getImageName()).toBe('image');
        expect(changedSize).toEqual(
          expect.objectContaining({
            oldWidth: expect.any(Number),
            oldHeight: expect.any(Number),
            newWidth: expect.any(Number),
            newHeight: expect.any(Number),
          })
        );
      });
    });

    it('should not include cropzone after running the LOAD_IMAGE command', () => {
      const objCropzone = new fabric.Object({ type: 'cropzone' });

      return invoker.execute(commands.ADD_OBJECT, graphics, objCropzone).then(() => {
        invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img).then(() => {
          const lastUndoIndex = invoker._undoStack.length - 1;
          const savedObjects = invoker._undoStack[lastUndoIndex].undoData.objects;

          expect(savedObjects).toHaveLength(0);
        });
      });
    });

    it('should be true after LOAD_IMAGE.', () => {
      const objCircle = new fabric.Object({ type: 'circle', evented: false });

      return invoker.execute(commands.ADD_OBJECT, graphics, objCircle).then(() => {
        invoker.execute(commands.LOAD_IMAGE, graphics, 'image', img).then(() => {
          const lastUndoIndex = invoker._undoStack.length - 1;
          const [savedObject] = invoker._undoStack[lastUndoIndex].undoData.objects;

          expect(savedObject.evented).toBe(true);
        });
      });
    });

    it('should clear image if not exists prev image', () => {
      return invoker
        .execute(commands.LOAD_IMAGE, graphics, 'image', img)
        .then(() => invoker.undo())
        .then(() => {
          expect(graphics.getCanvasImage()).toBeNull();
          expect(graphics.getImageName()).toBe('');
        });
    });

    it('should restore to prev image', () => {
      const newImg = new fabric.Image(img2);

      return invoker
        .execute(commands.LOAD_IMAGE, graphics, 'image', img)
        .then(() => invoker.execute(commands.LOAD_IMAGE, graphics, 'newImage', newImg))
        .then(() => {
          expect(graphics.getImageName()).toBe('newImage');

          return invoker.undo();
        })
        .then(() => {
          expect(graphics.getImageName()).toBe('image');
        });
    });
  });

  describe('flipImageCommand', () => {
    it('should be flipped over to the x-axis.', () => {
      const flipStatus = mockImage.flipX;

      return invoker.execute(commands.FLIP_IMAGE, graphics, 'flipX').then(() => {
        expect(mockImage.flipX).toBe(!flipStatus);
      });
    });

    it('should be flipped over to the y-axis.', () => {
      const flipStatus = mockImage.flipY;

      return invoker.execute(commands.FLIP_IMAGE, graphics, 'flipY').then(() => {
        expect(mockImage.flipY).toBe(!flipStatus);
      });
    });

    it('should reset flip', () => {
      mockImage.flipX = true;
      mockImage.flipY = true;

      return invoker.execute(commands.FLIP_IMAGE, graphics, 'reset').then(() => {
        expect(mockImage).toEqual(expect.objectContaining({ flipX: false, flipY: false }));
      });
    });

    it('should restore flipX', () => {
      const flipStatus = mockImage.flipX;

      return invoker
        .execute(commands.FLIP_IMAGE, graphics, 'flipX')
        .then(() => invoker.undo())
        .then(() => {
          expect(mockImage.flipX).toBe(flipStatus);
        });
    });

    it('should restore flipY', () => {
      const flipStatus = mockImage.flipY;

      return invoker
        .execute(commands.FLIP_IMAGE, graphics, 'flipY')
        .then(() => invoker.undo())
        .then(() => {
          expect(mockImage.flipY).toBe(flipStatus);
        });
    });
  });

  describe('textCommand', () => {
    let textObjectId;
    const fontSize = 50;
    const underline = false;
    const newFontSize = 30;
    const newUnderline = true;

    beforeEach(() => {
      return invoker
        .execute(commands.ADD_TEXT, graphics, 'text', {
          styles: {
            fontSize,
            underline,
          },
        })
        .then((textObject) => {
          textObjectId = textObject.id;
        });
    });

    it('should set text style', () => {
      return invoker
        .execute(commands.CHANGE_TEXT_STYLE, graphics, textObjectId, {
          fontSize: newFontSize,
          underline: newUnderline,
        })
        .then(() => {
          const textObject = graphics.getObject(textObjectId);

          expect(textObject).toEqual(expect.objectContaining({ fontSize: 30, underline: true }));
        });
    });

    it('should restore fontSize', () => {
      return invoker
        .execute(commands.CHANGE_TEXT_STYLE, graphics, textObjectId, {
          fontSize: newFontSize,
          underline: newUnderline,
        })
        .then(() => invoker.undo())
        .then(() => {
          const textObject = graphics.getObject(textObjectId);

          expect(textObject).toEqual(expect.objectContaining({ fontSize, underline }));
        });
    });
  });

  describe('rotateCommand', () => {
    it('should add angle', () => {
      const originAngle = mockImage.angle;

      return invoker.execute(commands.ROTATE_IMAGE, graphics, 'rotate', 10).then(() => {
        expect(mockImage.angle).toBe(originAngle + 10);
      });
    });

    it('should set angle', () => {
      mockImage.angle = 100;

      return invoker.execute(commands.ROTATE_IMAGE, graphics, 'setAngle', 30).then(() => {
        expect(mockImage.angle).toBe(30);
      });
    });

    it('should restore angle', () => {
      const originalAngle = mockImage.angle;

      return invoker
        .execute(commands.ROTATE_IMAGE, graphics, 'setAngle', 100)
        .then(() => invoker.undo())
        .then(() => {
          expect(mockImage.angle).toBe(originalAngle);
        });
    });
  });

  describe('shapeCommand', () => {
    let shapeObjectId;
    const defaultStrokeWidth = 12;
    const strokeWidth = 50;

    beforeEach(() => {
      return invoker
        .execute(commands.ADD_SHAPE, graphics, 'rect', {
          strokeWidth: defaultStrokeWidth,
        })
        .then((shapeObject) => {
          shapeObjectId = shapeObject.id;
        });
    });

    it('should set strokeWidth', () => {
      return invoker
        .execute(commands.CHANGE_SHAPE, graphics, shapeObjectId, { strokeWidth })
        .then(() => {
          const shapeObject = graphics.getObject(shapeObjectId);

          expect(shapeObject.strokeWidth).toBe(strokeWidth);
        });
    });

    it('should restore strokeWidth', () => {
      return invoker
        .execute(commands.CHANGE_SHAPE, graphics, shapeObjectId, { strokeWidth })
        .then(() => invoker.undo())
        .then(() => {
          const shapeObject = graphics.getObject(shapeObjectId);

          expect(shapeObject.strokeWidth).toBe(defaultStrokeWidth);
        });
    });
  });

  describe('clearCommand', () => {
    let canvasContext, objects;

    beforeEach(() => {
      canvasContext = canvas;
      objects = [new fabric.Rect(), new fabric.Rect(), new fabric.Rect()];
    });

    it('should clear all objects', () => {
      canvas.add.apply(canvasContext, objects);

      expect(canvas.contains(objects[0])).toBe(true);
      expect(canvas.contains(objects[1])).toBe(true);
      expect(canvas.contains(objects[2])).toBe(true);

      return invoker.execute(commands.CLEAR_OBJECTS, graphics).then(() => {
        expect(canvas.contains(objects[0])).toBe(false);
        expect(canvas.contains(objects[1])).toBe(false);
        expect(canvas.contains(objects[2])).toBe(false);
      });
    });

    it('should restore all objects', () => {
      canvas.add.apply(canvasContext, objects);

      return invoker
        .execute(commands.CLEAR_OBJECTS, graphics)
        .then(() => invoker.undo())
        .then(() => {
          expect(canvas.contains(objects[0])).toBe(true);
          expect(canvas.contains(objects[1])).toBe(true);
          expect(canvas.contains(objects[2])).toBe(true);
        });
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

    it('should remove an object', () => {
      graphics.setActiveObject(object);

      return invoker.execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(object)).then(() => {
        expect(canvas.contains(object)).toBe(false);
      });
    });

    it('should remove objects in group', () => {
      canvas.setActiveObject(group);

      return invoker.execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(group)).then(() => {
        expect(canvas.contains(object)).toBe(false);
        expect(canvas.contains(object2)).toBe(false);
      });
    });

    it('should restore the removed object', () => {
      canvas.setActiveObject(object);

      return invoker
        .execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(object))
        .then(() => invoker.undo())
        .then(() => {
          expect(canvas.contains(object)).toBe(true);
        });
    });

    it('should restore the removed objects in group', () => {
      canvas.setActiveObject(group);

      return invoker
        .execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(group))
        .then(() => invoker.undo())
        .then(() => {
          expect(canvas.contains(object)).toBe(true);
          expect(canvas.contains(object2)).toBe(true);
        });
    });

    it('should restore the position of the removed object in group', () => {
      const activeSelection = graphics.getActiveSelectionFromObjects(canvas.getObjects());
      graphics.setActiveObject(activeSelection);

      return invoker
        .execute(commands.REMOVE_OBJECT, graphics, graphics.getActiveObjectIdForRemove())
        .then(() => invoker.undo())
        .then(() => {
          expect(object).toEqual(expect.objectContaining({ left: 10, top: 10 }));
          expect(object2).toEqual(expect.objectContaining({ left: 5, top: 20 }));
        });
    });
  });

  describe('resizeCommand', () => {
    const newDimensions = { width: 20, height: 20 };

    it('should resize image', () => {
      return invoker.execute(commands.RESIZE_IMAGE, graphics, newDimensions).then(() => {
        const { width, height, scaleX, scaleY } = mockImage;

        expect({
          width: width * scaleX,
          height: height * scaleY,
        }).toEqual(newDimensions);
      });
    });

    it('should restore dimensions of image', () => {
      return invoker
        .execute(commands.RESIZE_IMAGE, graphics, newDimensions)
        .then(() => invoker.undo())
        .then(() => {
          const { width, height, scaleX, scaleY } = mockImage;

          expect({
            width: width * scaleX,
            height: height * scaleY,
          }).toEqual(dimensions);
        });
    });
  });
});
