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
            obj.remove();
        });
    });

    describe('add()', function() {
        var activeObj;

        beforeEach(function() {
            text.add();

            activeObj = canvas.getActiveObject();
        });

        it('should make the blank text object when parameter is null.', function() {
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

    describe('change()', function() {
        var changingText;

        beforeEach(function() {
            changingText = '변경할 텍스트';

            text.add({
                text: 'test123'
            });
        });

        it('should not change contents when the atcivated text object is not on canvas.', function() {
            canvas.deactivateAll();

            text.change(changingText);

            canvas.forEachObject(function(obj) {
                expect(obj.getText()).not.toEqual(changingText);
            });
        });

        it('should change contents in the text object as input.', function() {
            var originText;

            text.change(changingText);

            originText = canvas.getActiveObject().getText();

            expect(originText).toEqual(changingText);
        });
    });

    describe('setStyle()', function() {
        beforeEach(function() {
            text.add({
                text: 'test12345',
                styles: {
                    fontWeight: 'bold'
                }
            });
        });

        it('should not change styles when the activated text object is not on canvas.', function() {
            canvas.deactivateAll();

            text.setStyle({
                fontWeight: 'normal'
            });

            canvas.forEachObject(function(obj) {
                expect(obj.fontWeight).toEqual('bold');
            });
        });

        it('should unlock style when a selected style already apply on the activated text object.', function() {
            var activeObj;

            text.setStyle({
                fontWeight: 'bold'
            });

            activeObj = canvas.getActiveObject();

            expect(activeObj.fontWeight).not.toEqual('bold');
        });

        it('should apply style when the activated text object has not a selected style.', function() {
            var activeObj;

            text.setStyle({
                fontStyle: 'italic'
            });

            activeObj = canvas.getActiveObject();

            expect(activeObj.fontStyle).toEqual('italic');
        });
    });
});
