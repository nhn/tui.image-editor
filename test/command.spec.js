/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Tests command with command-factory
 */
'use strict';

var Invoker = require('../src/js/invoker');
var commandFactory = require('../src/js/factory/command');
var commands = require('../src/js/consts').commandNames;

describe('commandFactory', function() {
    var invoker, mockImage, canvas, mainComponent;

    beforeEach(function() {
        invoker = new Invoker();
        mockImage = new fabric.Image();
        mainComponent = invoker.getComponent('MAIN');
        mainComponent.setCanvasElement($('<canvas>'));
        mainComponent.setCanvasImage('', mockImage);
        canvas = mainComponent.getCanvas();
    });

    describe('addObjectCommand', function() {
        var obj, command;

        beforeEach(function() {
            obj = new fabric.Object();
            command = commandFactory.create(commands.ADD_OBJECT, obj);
        });

        it('should stamp object', function() {
            expect(tui.util.hasStamp(obj)).toBe(true);
        });

        it('should add object to canvas', function() {
            invoker.invoke(command);

            expect(canvas.contains(obj)).toBe(true);
        });

        it('"undo()" should remove object from canvas', function() {
            invoker.invoke(command);
            invoker.undo();

            expect(canvas.contains(obj)).toBe(false);
        });
    });

    describe('loadImageCommand', function() {
        var imageURL, command;

        beforeEach(function(done) {
            mainComponent.setCanvasImage('', null);
            imageURL = 'base/test/fixtures/sampleImage.jpg';
            command = commandFactory.create(commands.LOAD_IMAGE, 'image', imageURL);

            setTimeout(function() {
                done();
            }, 1)
        });

        it('should clear canvas', function() {
            spyOn(canvas, 'clear');
            invoker.invoke(command);

            expect(canvas.clear).toHaveBeenCalled();
        });

        it('should load new image', function(done) {
            console.log(command);
            invoker.invoke(command).then(function(img) {
                expect(mainComponent.getImageName()).toEqual('image');
                expect(mainComponent.getCanvasImage()).toBe(img);
                expect(mainComponent.getCanvasImage().getSrc()).toContain(imageURL);
            })
            .then(done);
        });

        it('"undo()" should clear image if not exists prev image', function(done) {
            invoker.invoke(command).then(function() {
                return invoker.undo();
            }).done(function() {
                expect(mainComponent.getCanvasImage()).toBe(null);
                expect(mainComponent.getImageName()).toBe('');
            })
            .done(done);
        });

        it('"undo()" should restore to prev image', function(done) {
            var newImageURL = 'base/test/fixtures/TOAST%20UI%20Component.png';
            var newCommand = commandFactory.create(commands.LOAD_IMAGE, 'newImage', newImageURL);

            invoker.invoke(command).then(function() {
                return invoker.invoke(newCommand);
            }).then(function() {
                expect(mainComponent.getImageName()).toBe('newImage');
                expect(mainComponent.getCanvasImage().getSrc()).toContain(newImageURL);

                return invoker.undo();
            }).done(function() {
                expect(mainComponent.getImageName()).toEqual('image');
                expect(mainComponent.getCanvasImage().getSrc()).toContain(imageURL);
            }).done(done);
        });
    });

    describe('flipImageCommand', function() {
        it('flipX', function() {
            var originFlipX = mockImage.flipX;
            var command = commandFactory.create(commands.FLIP_IMAGE, 'flipX');

            invoker.invoke(command);

            expect(mockImage.flipX).toBe(!originFlipX);
        });

        it('flipY', function() {
            var originFlipY = mockImage.flipY;
            var command = commandFactory.create(commands.FLIP_IMAGE, 'flipY');

            invoker.invoke(command);

            expect(mockImage.flipY).toBe(!originFlipY);
        });

        it('resetFlip', function() {
            var command = commandFactory.create(commands.FLIP_IMAGE, 'reset');
            mockImage.flipX = true;
            mockImage.flipY = true;

            invoker.invoke(command);

            expect(mockImage.flipX).toBe(false);
            expect(mockImage.flipY).toBe(false);
        });

        it('"undo()" should restore flipXY', function() {
            var originFlipX = mockImage.flipX;
            var originFlipY = mockImage.flipY;
            var command = commandFactory.create(commands.FLIP_IMAGE, 'flipX');

            invoker.invoke(command);
            invoker.undo();

            expect(mockImage.flipX).toBe(originFlipX);
            expect(mockImage.flipY).toBe(originFlipY);

            command = commandFactory.create(commands.FLIP_IMAGE, 'flipY');

            invoker.invoke(command);
            invoker.undo();

            expect(mockImage.flipX).toBe(originFlipX);
            expect(mockImage.flipY).toBe(originFlipY);
        });
    });

    describe('rotationImageCommand', function() {
        it('"rotate()" should add angle', function() {
            var originAngle = mockImage.angle;
            var command = commandFactory.create(commands.ROTATE_IMAGE, 'rotate', 10);

            invoker.invoke(command);

            expect(mockImage.angle).toBe(originAngle + 10);
        });

        it('"setAngle()" should set angle', function() {
            var command = commandFactory.create(commands.ROTATE_IMAGE, 'setAngle', 30);

            mockImage.angle = 100;
            invoker.invoke(command);

            expect(mockImage.angle).toBe(30);
        });

        it('"undo()" should restore angle', function() {
            var originalAngle = mockImage.angle;
            var command = commandFactory.create(commands.ROTATE_IMAGE, 'setAngle', 100);

            invoker.invoke(command);
            invoker.undo();

            expect(mockImage.angle).toBe(originalAngle);
        });
    });

    describe('clearCommand', function() {
        var command, objects;

        beforeEach(function() {
            command = commandFactory.create(commands.CLEAR_OBJECTS);
            objects = [
                new fabric.Object(),
                new fabric.Object(),
                new fabric.Object()
            ];
        });

        it('should clear all objects', function() {
            canvas.add.apply(canvas, objects);

            expect(canvas.contains(objects[0])).toBe(true);
            expect(canvas.contains(objects[1])).toBe(true);
            expect(canvas.contains(objects[2])).toBe(true);

            invoker.invoke(command);

            expect(canvas.contains(objects[0])).toBe(false);
            expect(canvas.contains(objects[1])).toBe(false);
            expect(canvas.contains(objects[2])).toBe(false);
        });

        it('"undo()" restore all objects', function() {
            canvas.add.apply(canvas, objects);
            invoker.invoke(command);
            invoker.undo();

            expect(canvas.contains(objects[0])).toBe(true);
            expect(canvas.contains(objects[1])).toBe(true);
            expect(canvas.contains(objects[2])).toBe(true);
        });
    });

    describe('removeCommand', function() {
        var object, object2, group, command;

        beforeEach(function() {
            object = new fabric.Object();
            object2 = new fabric.Object();
            group = new fabric.Group();

            canvas.add(object);
            canvas.add(object2);
            canvas.add(group);
            group.add(object, object2);
        });

        it('should remove an object', function() {
            command = commandFactory.create(commands.REMOVE_OBJECT, object);
            invoker.invoke(command);

            expect(canvas.contains(object)).toBe(false);
        });

        it('should remove objects group', function() {
            command = commandFactory.create(commands.REMOVE_OBJECT, group);
            invoker.invoke(command);

            expect(canvas.contains(object)).toBe(false);
            expect(canvas.contains(object2)).toBe(false);
        });

        it('"undo()" should restore the removed object', function() {
            command = commandFactory.create(commands.REMOVE_OBJECT, object);
            invoker.invoke(command);
            invoker.undo();

            expect(canvas.contains(object)).toBe(true);
        });

        it ('"undo()" should restore the removed objects (group)', function() {
            command = commandFactory.create(commands.REMOVE_OBJECT, group);
            invoker.invoke(command);
            invoker.undo();

            expect(canvas.contains(object)).toBe(true);
            expect(canvas.contains(object2)).toBe(true);
        });
    });
});
