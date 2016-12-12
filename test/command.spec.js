/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Tests command with command-factory
 */
import Invoker from '../src/js/invoker';
import commandFactory from '../src/js/factory/command';
import consts from '../src/js/consts';

const commands = consts.commandNames;

describe('commandFactory', () => {
    let invoker, mockImage, canvas, mainComponent;

    beforeEach(() => {
        invoker = new Invoker();
        mockImage = new fabric.Image();
        mainComponent = invoker.getComponent('MAIN');
        mainComponent.setCanvasElement($('<canvas>'));
        mainComponent.setCanvasImage('', mockImage);
        canvas = mainComponent.getCanvas();
    });

    describe('addObjectCommand', () => {
        let obj, command;

        beforeEach(() => {
            obj = new fabric.Object();
            command = commandFactory.create(commands.ADD_OBJECT, obj);
        });

        it('should stamp object', () => {
            expect(tui.util.hasStamp(obj)).toBe(true);
        });

        it('should add object to canvas', () => {
            invoker.invoke(command);

            expect(canvas.contains(obj)).toBe(true);
        });

        it('"undo()" should remove object from canvas', done => {
            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(canvas.contains(obj)).toBe(false);
                done();
            });
        });
    });

    describe('loadImageCommand', () => {
        let imageURL, command;

        beforeEach(() => {
            mainComponent.setCanvasImage('', null);
            imageURL = 'base/test/fixtures/sampleImage.jpg';
            command = commandFactory.create(commands.LOAD_IMAGE, 'image', imageURL);
        });

        it('should clear canvas', () => {
            spyOn(canvas, 'clear');
            invoker.invoke(command);

            expect(canvas.clear).toHaveBeenCalled();
        });

        it('should load new image', done => {
            invoker.invoke(command).then(img => {
                expect(mainComponent.getImageName()).toEqual('image');
                expect(mainComponent.getCanvasImage()).toBe(img);
                expect(mainComponent.getCanvasImage().getSrc()).toContain(imageURL);
                done();
            });
        });

        it('"undo()" should clear image if not exists prev image', done => {
            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(mainComponent.getCanvasImage()).toBe(null);
                expect(mainComponent.getImageName()).toBe('');
                done();
            });
        });

        it('"undo()" should restore to prev image', done => {
            const newImageURL = 'base/test/fixtures/TOAST%20UI%20Component.png';
            const newCommand = commandFactory.create(commands.LOAD_IMAGE, 'newImage', newImageURL);

            invoker.invoke(command).then(() => invoker.invoke(newCommand)).then(() => {
                expect(mainComponent.getImageName()).toBe('newImage');
                expect(mainComponent.getCanvasImage().getSrc()).toContain(newImageURL);

                return invoker.undo();
            }).then(() => {
                expect(mainComponent.getImageName()).toEqual('image');
                expect(mainComponent.getCanvasImage().getSrc()).toContain(imageURL);
                done();
            });
        });
    });

    describe('flipImageCommand', () => {
        it('flipX', () => {
            const originFlipX = mockImage.flipX;
            const command = commandFactory.create(commands.FLIP_IMAGE, 'flipX');

            invoker.invoke(command);

            expect(mockImage.flipX).toBe(!originFlipX);
        });

        it('flipY', () => {
            const originFlipY = mockImage.flipY;
            const command = commandFactory.create(commands.FLIP_IMAGE, 'flipY');

            invoker.invoke(command);

            expect(mockImage.flipY).toBe(!originFlipY);
        });

        it('resetFlip', () => {
            const command = commandFactory.create(commands.FLIP_IMAGE, 'reset');
            mockImage.flipX = true;
            mockImage.flipY = true;

            invoker.invoke(command);

            expect(mockImage.flipX).toBe(false);
            expect(mockImage.flipY).toBe(false);
        });

        it('"undo()" should restore flipX', done => {
            const originFlipX = mockImage.flipX;
            const command = commandFactory.create(commands.FLIP_IMAGE, 'flipX');

            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(mockImage.flipX).toBe(originFlipX);
                done();
            });
        });

        it('"undo()" should restore filpY', done => {
            const originFlipY = mockImage.flipY;
            const command = commandFactory.create(commands.FLIP_IMAGE, 'flipY');

            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(mockImage.flipY).toBe(originFlipY);
                done();
            });
        });
    });

    describe('rotationImageCommand', () => {
        it('"rotate()" should add angle', () => {
            const originAngle = mockImage.angle;
            const command = commandFactory.create(commands.ROTATE_IMAGE, 'rotate', 10);

            invoker.invoke(command);

            expect(mockImage.angle).toBe(originAngle + 10);
        });

        it('"setAngle()" should set angle', () => {
            const command = commandFactory.create(commands.ROTATE_IMAGE, 'setAngle', 30);

            mockImage.angle = 100;
            invoker.invoke(command);

            expect(mockImage.angle).toBe(30);
        });

        it('"undo()" should restore angle', done => {
            const originalAngle = mockImage.angle;
            const command = commandFactory.create(commands.ROTATE_IMAGE, 'setAngle', 100);

            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(mockImage.angle).toBe(originalAngle);
                done();
            });
        });
    });

    describe('clearCommand', () => {
        let command, objects, canvasContext;

        beforeEach(() => {
            canvasContext = canvas;
            command = commandFactory.create(commands.CLEAR_OBJECTS);
            objects = [
                new fabric.Object(),
                new fabric.Object(),
                new fabric.Object()
            ];
        });

        it('should clear all objects', () => {
            canvas.add.apply(canvasContext, objects);

            expect(canvas.contains(objects[0])).toBe(true);
            expect(canvas.contains(objects[1])).toBe(true);
            expect(canvas.contains(objects[2])).toBe(true);

            invoker.invoke(command);

            expect(canvas.contains(objects[0])).toBe(false);
            expect(canvas.contains(objects[1])).toBe(false);
            expect(canvas.contains(objects[2])).toBe(false);
        });

        it('"undo()" restore all objects', done => {
            canvas.add.apply(canvasContext, objects);
            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(canvas.contains(objects[0])).toBe(true);
                expect(canvas.contains(objects[1])).toBe(true);
                expect(canvas.contains(objects[2])).toBe(true);
                done();
            });
        });
    });

    describe('removeCommand', () => {
        let object, object2, group, command;

        beforeEach(() => {
            object = new fabric.Object();
            object2 = new fabric.Object();
            group = new fabric.Group();

            canvas.add(object);
            canvas.add(object2);
            canvas.add(group);
            group.add(object, object2);
        });

        it('should remove an object', () => {
            command = commandFactory.create(commands.REMOVE_OBJECT, object);
            invoker.invoke(command);

            expect(canvas.contains(object)).toBe(false);
        });

        it('should remove objects group', () => {
            command = commandFactory.create(commands.REMOVE_OBJECT, group);
            invoker.invoke(command);

            expect(canvas.contains(object)).toBe(false);
            expect(canvas.contains(object2)).toBe(false);
        });

        it('"undo()" should restore the removed object', done => {
            command = commandFactory.create(commands.REMOVE_OBJECT, object);

            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(canvas.contains(object)).toBe(true);
                done();
            });
        });

        it('"undo()" should restore the removed objects (group)', done => {
            command = commandFactory.create(commands.REMOVE_OBJECT, group);
            invoker.invoke(command).then(() => invoker.undo()).then(() => {
                expect(canvas.contains(object)).toBe(true);
                expect(canvas.contains(object2)).toBe(true);
                done();
            });
        });
    });
});
