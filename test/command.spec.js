/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Tests command with command-factory
 */
import snippet from 'tui-code-snippet';
import {Promise} from '../src/js/util';
import fabric from 'fabric';
import Invoker from '../src/js/invoker';
import commandFactory from '../src/js/factory/command';
import Graphics from '../src/js/graphics';
import {commandNames as commands} from '../src/js/consts';

describe('commandFactory', () => {
    let invoker, mockImage, canvas, graphics;

    beforeEach(() => {
        graphics = new Graphics(document.createElement('canvas'));
        invoker = new Invoker();
        mockImage = new fabric.Image();

        graphics.setCanvasImage('', mockImage);
        canvas = graphics.getCanvas();
    });

    describe('functions', () => {
        it('can register custom command', done => {
            const testCommand = {
                name: 'testCommand',
                execute() {
                },
                undo() {
                }
            };

            spyOn(testCommand, 'execute').and.returnValue(Promise.resolve('testCommand'));
            spyOn(testCommand, 'undo').and.returnValue(Promise.resolve());

            commandFactory.register(testCommand);

            const command = commandFactory.create('testCommand');
            expect(command).not.toBe(null);

            invoker.execute('testCommand', graphics).then(commandName => {
                expect(commandName).toBe('testCommand');
                expect(testCommand.execute).toHaveBeenCalledWith(graphics);
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('can pass parameters on execute', done => {
            commandFactory.register({
                name: 'testCommand',
                execute(compMap, obj1, obj2, obj3) {
                    expect(obj1).toBe(1);
                    expect(obj2).toBe(2);
                    expect(obj3).toBe(3);

                    return Promise.resolve();
                }
            });

            invoker.execute('testCommand', graphics, 1, 2, 3).then(() => {
                done();
            })['catch'](message => {
                fail(message);
                done();
            });
        });

        it('can pass parameters on undo', done => {
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
                }
            });

            invoker.execute('testCommand', graphics, 1, 2, 3).then(() => (
                invoker.undo()
            )).then(() => done()
            )['catch'](message => {
                fail(message);
                done();
            });
        });
    });

    describe('addObjectCommand', () => {
        let obj;

        it('should stamp object', done => {
            obj = new fabric.Rect();
            invoker.execute(commands.ADD_OBJECT, graphics, obj).then(() => {
                expect(snippet.hasStamp(obj)).toBe(true);
                done();
            });
        });

        it('should add object to canvas', done => {
            obj = new fabric.Rect();
            invoker.execute(commands.ADD_OBJECT, graphics, obj).then(() => {
                expect(canvas.contains(obj)).toBe(true);
                done();
            });
        });

        it('"undo()" should remove object from canvas', done => {
            obj = new fabric.Rect();
            invoker.execute(commands.ADD_OBJECT, graphics, obj).then(() => invoker.undo()).then(() => {
                expect(canvas.contains(obj)).toBe(false);
                done();
            });
        });
    });

    describe('loadImageCommand', () => {
        const imageURL = 'base/test/fixtures/sampleImage.jpg';

        beforeEach(() => {
            graphics.setCanvasImage('', null);
        });

        it('should clear canvas', () => {
            spyOn(canvas, 'clear');
            invoker.execute(commands.LOAD_IMAGE, graphics, 'image', imageURL);

            expect(canvas.clear).toHaveBeenCalled();
        });

        it('should load new image', done => {
            invoker.execute(commands.LOAD_IMAGE, graphics, 'image', imageURL).then(sizeChange => {
                expect(graphics.getImageName()).toEqual('image');
                expect(graphics.getCanvasImage().getSrc()).toContain(imageURL);
                expect(sizeChange.oldWidth).toEqual(jasmine.any(Number));
                expect(sizeChange.oldHeight).toEqual(jasmine.any(Number));
                expect(sizeChange.newWidth).toEqual(jasmine.any(Number));
                expect(sizeChange.newHeight).toEqual(jasmine.any(Number));
                done();
            });
        });

        it('After running the LOAD_IMAGE command, existing objects should not include cropzone.', done => {
            const objCropzone = new fabric.Object({type: 'cropzone'});

            invoker.execute(commands.ADD_OBJECT, graphics, objCropzone).then(() => {
                invoker.execute(commands.LOAD_IMAGE, graphics, 'image', imageURL).then(() => {
                    const lastUndoIndex = invoker._undoStack.length - 1;
                    const savedObjects = invoker._undoStack[lastUndoIndex].undoData.objects;

                    expect(savedObjects.length).toBe(0);
                    done();
                });
            });
        });

        it('`evented` attribute of the saved object must be true after LOAD_IMAGE.', done => {
            const objCircle = new fabric.Object({
                type: 'circle',
                evented: false
            });

            invoker.execute(commands.ADD_OBJECT, graphics, objCircle).then(() => {
                invoker.execute(commands.LOAD_IMAGE, graphics, 'image', imageURL).then(() => {
                    const lastUndoIndex = invoker._undoStack.length - 1;
                    const [savedObject] = invoker._undoStack[lastUndoIndex].undoData.objects;

                    expect(savedObject.evented).toBe(true);
                    done();
                });
            });
        });

        it('"undo()" should clear image if not exists prev image', done => {
            invoker.execute(commands.LOAD_IMAGE, graphics, 'image', imageURL).then(() => (
                invoker.undo()
            )).then(() => {
                expect(graphics.getCanvasImage()).toBe(null);
                expect(graphics.getImageName()).toBe('');
                done();
            });
        });

        it('"undo()" should restore to prev image', done => {
            const newImageURL = 'base/test/fixtures/TOAST%20UI%20Component.png';

            invoker.execute(commands.LOAD_IMAGE, graphics, 'image', imageURL).then(() => (
                invoker.execute(commands.LOAD_IMAGE, graphics, 'newImage', newImageURL)
            )).then(() => {
                expect(graphics.getImageName()).toBe('newImage');
                expect(graphics.getCanvasImage().getSrc()).toContain(newImageURL);

                return invoker.undo();
            }).then(() => {
                expect(graphics.getImageName()).toEqual('image');
                expect(graphics.getCanvasImage().getSrc()).toContain(imageURL);
                done();
            });
        });
    });

    describe('flipImageCommand', () => {
        it('flipX', () => {
            const originFlipX = mockImage.flipX;

            invoker.execute(commands.FLIP_IMAGE, graphics, 'flipX');

            expect(mockImage.flipX).toBe(!originFlipX);
        });

        it('flipY', () => {
            const originFlipY = mockImage.flipY;

            invoker.execute(commands.FLIP_IMAGE, graphics, 'flipY');

            expect(mockImage.flipY).toBe(!originFlipY);
        });

        it('resetFlip', () => {
            mockImage.flipX = true;
            mockImage.flipY = true;

            invoker.execute(commands.FLIP_IMAGE, graphics, 'reset');

            expect(mockImage.flipX).toBe(false);
            expect(mockImage.flipY).toBe(false);
        });

        it('"undo()" should restore flipX', done => {
            const originFlipX = mockImage.flipX;

            invoker.execute(commands.FLIP_IMAGE, graphics, 'flipX').then(() => (
                invoker.undo()
            )).then(() => {
                expect(mockImage.flipX).toBe(originFlipX);
                done();
            });
        });

        it('"undo()" should restore filpY', done => {
            const originFlipY = mockImage.flipY;

            invoker.execute(commands.FLIP_IMAGE, graphics, 'flipY').then(() => (
                invoker.undo()
            )).then(() => {
                expect(mockImage.flipY).toBe(originFlipY);
                done();
            });
        });
    });

    describe('textCommand', () => {
        let textObjectId;
        const defaultFontSize = 50;
        const defaultUnderline = false;
        beforeEach(done => {
            invoker.execute(commands.ADD_TEXT, graphics, 'text', {
                styles: {
                    fontSize: defaultFontSize,
                    underline: false
                }
            }).then(textObject => {
                textObjectId = textObject.id;
                done();
            });
        });
        it('"changeTextStyle" should set text style', done => {
            invoker.execute(commands.CHANGE_TEXT_STYLE, graphics, textObjectId, {
                fontSize: 30,
                underline: true
            }).then(() => {
                const textObject = graphics.getObject(textObjectId);
                expect(textObject.fontSize).toBe(30);
                expect(textObject.underline).toBe(true);
                done();
            });
        });
        it('"undo()" should restore fontSize', done => {
            invoker.execute(commands.CHANGE_TEXT_STYLE, graphics, textObjectId, {
                fontSize: 30,
                underline: true
            }).then(() => invoker.undo()).then(() => {
                const textObject = graphics.getObject(textObjectId);
                expect(textObject.fontSize).toBe(defaultFontSize);
                expect(textObject.underline).toBe(defaultUnderline);
                done();
            });
        });
    });

    describe('rotationImageCommand', () => {
        it('"rotate()" should add angle', () => {
            const originAngle = mockImage.angle;

            invoker.execute(commands.ROTATE_IMAGE, graphics, 'rotate', 10);

            expect(mockImage.angle).toBe(originAngle + 10);
        });

        it('"setAngle()" should set angle', () => {
            mockImage.angle = 100;
            invoker.execute(commands.ROTATE_IMAGE, graphics, 'setAngle', 30);

            expect(mockImage.angle).toBe(30);
        });

        it('"undo()" should restore angle', done => {
            const originalAngle = mockImage.angle;

            invoker.execute(commands.ROTATE_IMAGE, graphics, 'setAngle', 100).then(() => (
                invoker.undo()
            )).then(() => {
                expect(mockImage.angle).toBe(originalAngle);
                done();
            });
        });
    });

    describe('shapeCommand', () => {
        let shapeObjectId;
        const defaultStrokeWidth = 12;
        beforeEach(done => {
            invoker.execute(commands.ADD_SHAPE, graphics, 'rect', {
                strokeWidth: defaultStrokeWidth
            }).then(shapeObject => {
                shapeObjectId = shapeObject.id;
                done();
            });
        });
        it('"changeShape" should set strokeWidth', done => {
            invoker.execute(commands.CHANGE_SHAPE, graphics, shapeObjectId, {
                strokeWidth: 50
            }).then(() => {
                const shapeObject = graphics.getObject(shapeObjectId);
                expect(shapeObject.strokeWidth).toBe(50);
                done();
            });
        });
        it('"redo()" should restore strokeWidth', done => {
            invoker.execute(commands.CHANGE_SHAPE, graphics, shapeObjectId, {
                strokeWidth: 50
            }).then(() => invoker.undo()).then(() => {
                const shapeObject = graphics.getObject(shapeObjectId);
                expect(shapeObject.strokeWidth).toBe(defaultStrokeWidth);
                done();
            });
        });
    });

    describe('clearCommand', () => {
        let canvasContext;

        beforeEach(() => {
            canvasContext = canvas;
        });

        it('should clear all objects', () => {
            const objects = [
                new fabric.Rect(),
                new fabric.Rect(),
                new fabric.Rect()
            ];
            canvas.add.apply(canvasContext, objects);

            expect(canvas.contains(objects[0])).toBe(true);
            expect(canvas.contains(objects[1])).toBe(true);
            expect(canvas.contains(objects[2])).toBe(true);

            invoker.execute(commands.CLEAR_OBJECTS, graphics);

            expect(canvas.contains(objects[0])).toBe(false);
            expect(canvas.contains(objects[1])).toBe(false);
            expect(canvas.contains(objects[2])).toBe(false);
        });

        it('"undo()" restore all objects', done => {
            const objects = [
                new fabric.Rect(),
                new fabric.Rect(),
                new fabric.Rect()
            ];
            canvas.add.apply(canvasContext, objects);
            invoker.execute(commands.CLEAR_OBJECTS, graphics).then(() => (
                invoker.undo()
            )).then(() => {
                expect(canvas.contains(objects[0])).toBe(true);
                expect(canvas.contains(objects[1])).toBe(true);
                expect(canvas.contains(objects[2])).toBe(true);
                done();
            });
        });
    });

    describe('removeCommand', () => {
        let object, object2, group;

        beforeEach(() => {
            object = new fabric.Rect({
                left: 10,
                top: 10
            });
            object2 = new fabric.Rect({
                left: 5,
                top: 20
            });
            group = new fabric.Group();

            graphics.add(object);
            graphics.add(object2);
            graphics.add(group);
            group.add(object, object2);
        });

        it('should remove an object', () => {
            graphics.setActiveObject(object);
            invoker.execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(object));

            expect(canvas.contains(object)).toBe(false);
        });

        it('should remove objects group', () => {
            canvas.setActiveObject(group);
            invoker.execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(group));

            expect(canvas.contains(object)).toBe(false);
            expect(canvas.contains(object2)).toBe(false);
        });

        it('"undo()" should restore the removed object', done => {
            canvas.setActiveObject(object);

            invoker.execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(object)).then(() => (
                invoker.undo()
            )).then(() => {
                expect(canvas.contains(object)).toBe(true);
                done();
            });
        });

        it('"undo()" should restore the removed objects (group)', done => {
            canvas.setActiveObject(group);
            invoker.execute(commands.REMOVE_OBJECT, graphics, snippet.stamp(group)).then(() => (
                invoker.undo()
            )).then(() => {
                expect(canvas.contains(object)).toBe(true);
                expect(canvas.contains(object2)).toBe(true);
                done();
            });
        });

        it('"undo ()" should restore the position of the removed object (group). ', done => {
            const activeSelection = graphics.getActiveSelectionFromObjects(canvas.getObjects());
            graphics.setActiveObject(activeSelection);

            invoker.execute(commands.REMOVE_OBJECT, graphics, graphics.getActiveObjectIdForRemove()).then(() => (
                invoker.undo()
            )).then(() => {
                expect(object.left).toBe(10);
                expect(object.top).toBe(10);
                expect(object2.left).toBe(5);
                expect(object2.top).toBe(20);
                done();
            });
        });
    });
});
