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
        mainComponent.setCanvasElement();
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

    describe('createLoadImageCommand', function() {
        var imageURL, command;

        beforeEach(function() {
            mainComponent.setCanvasImage('', null);
            imageURL = 'base/test/fixtures/lena_std.jpg';
            command = commandFactory.create(commands.LOAD_IMAGE, 'image', imageURL);
        });

        it('should clear canvas', function() {
            spyOn(canvas, 'clear');
            invoker.invoke(command);

            expect(canvas.clear).toHaveBeenCalled();
        });

        it('should load new image', function(done) {
            invoker.invoke(command).done(function(img) {
                expect(mainComponent.getImageName()).toEqual('image');
                expect(mainComponent.getCanvasImage()).toBe(img);
                expect(mainComponent.getCanvasImage().getSrc()).toContain(imageURL);
            })
            .done(done);
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
            var newImageURL = 'base/test/fixtures/imageEditorClasses.png';
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
});
