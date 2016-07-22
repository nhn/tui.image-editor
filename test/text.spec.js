/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/text.js"
 */
'use strict';

var Main = require('../src/js/component/main');
var Text = require('../src/js/component/text');

describe('Text', function() {
    var canvas, main, mockImage, text;

    beforeAll(function() {
        canvas = new fabric.Canvas($('<canvas>')[0]);
        main = new Main();
        main.canvas = canvas;
        text = new Text(main);
    });

    beforeEach(function() {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);
    });

    afterEach(function() {
        canvas.forEachObject(function(obj) {
            canvas.remove(obj);
        });
    });

    it('start() should deactivate "evented" of other objects except text objects.', function() {
        var objects = [
            new fabric.Object({evented: true}),
            new fabric.Circle({evented: true}),
            new fabric.Text('', {evented: true})
        ];

        canvas.add(objects[0], objects[1], objects[2]);

        text.start({});

        expect(objects[0].evented).toBe(false);
        expect(objects[1].evented).toBe(false);
        expect(objects[2].evented).toBe(true);
    });

    it('end() should activate "evented" of other objects except text objects.', function() {
        var objects = [
            new fabric.Object({evented: true}),
            new fabric.Circle({evented: true}),
            new fabric.Text('', {evented: true})
        ];

        canvas.add(objects[0], objects[1], objects[2]);

        text.start({});
        text.end();

        expect(objects[0].evented).toBe(true);
        expect(objects[1].evented).toBe(true);
        expect(objects[2].evented).toBe(true);
    });

    describe('add()', function() {
        var activeObj;

        beforeEach(function() {
            text.add('', {});

            activeObj = canvas.getActiveObject();
        });

        it('should make the blank text object when text parameter is empty string.', function() {
            var newText = activeObj.getText();

            expect(newText).toEqual('');
        });

        it('should make the text object set default option when parameter has not "styles" property.', function() {
            var newTextStyle = activeObj.fontWeight;

            expect(newTextStyle).toEqual('normal');
        });

        it('should create the text object on center of canvas when parameter has not "position" property.', function() {
            var mockImagePos = mockImage.getCenterPoint();

            expect(activeObj.left).toEqual(mockImagePos.x);
            expect(activeObj.top).toEqual(mockImagePos.y);
        });
    });

    it('change() should change contents in the text object as input.', function() {
        var activeObj;

        text.add('text123', {});

        activeObj = canvas.getActiveObject();

        text.change(activeObj, 'abc');

        expect(activeObj.getText()).toEqual('abc');

        text.change(activeObj, 'def');

        expect(activeObj.getText()).toEqual('def');
    });

    describe('setStyle()', function() {
        beforeEach(function() {
            text.add('new text', {
                styles: {
                    fontWeight: 'bold'
                }
            });
        });

        it('should unlock style when a selected style already apply on the activated text object.', function() {
            var activeObj = canvas.getActiveObject();

            text.setStyle(activeObj, {
                fontWeight: 'bold'
            });

            expect(activeObj.fontWeight).not.toEqual('bold');
        });

        it('should apply style when the activated text object has not a selected style.', function() {
            var activeObj = canvas.getActiveObject();

            text.setStyle(activeObj, {
                fontStyle: 'italic'
            });

            expect(activeObj.fontStyle).toEqual('italic');
        });
    });
});
