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

    describe('_createTextarea()', function() {
        var $textarea;

        beforeEach(function() {
            text._createTextarea();

            $textarea = $(text.getCanvasElement().parentNode).find('textarea');
        });

        afterEach(function() {
            text._removeTextarea();
        });

        it('should attach the created "textarea" element on canvas container.', function() {
            expect($textarea.length).toEqual(1);
        });

        it('should have class name.', function() {
            var expected = 'tui-image-eidtor-textarea';

            expect($textarea.attr('class')).toEqual(expected);
        });

        it('should add inline style on "textarea" element.', function() {
            expect($textarea.attr('style')).not.toEqual(null);
        });
    });

    it('_removeTextarea() should remove "textarea" element on canvas container.', function() {
        var $textarea;

        text._createTextarea();
        text._removeTextarea();

        $textarea = $(text.getCanvasElement().parentNode).find('textarea');

        expect($textarea.length).toEqual(0);
    });

    it('_onBlur() should hide the "textarea" element.', function() {
        var $textarea;
        var obj = new fabric.Text('test');

        text._createTextarea();

        $textarea = $(text.getCanvasElement().parentNode).find('textarea');

        text._editingObj = obj;

        canvas.add(obj);

        text._onBlur();

        expect($textarea.css('display')).toEqual('none');
    });

    it('_onFabricScaling() should change size of selected text object.', function() {
        var obj = new fabric.Text('test');
        var mock = {
            target: obj
        };
        var scale = 10;
        var originSize = obj.getFontSize();

        text.start({});

        canvas.add(obj);
        obj.setScaleY(scale);

        canvas.fire('object:scaling', mock);

        expect(obj.getFontSize()).toEqual(originSize * scale);
    });

    describe('_changeToEditingMode()', function() {
        var textarea;
        var ratio = 10;
        var expected = {
            fontSize: 12,
            fontFamily: 'Comic Sans',
            fontStyle: 'italic',
            fontWeight: '700',
            textAlign: 'right',
            lineHeight: '3'
        };
        var obj = new fabric.Text('test', expected);

        beforeEach(function() {
            text._createTextarea();

            textarea = text._textarea;

            canvas.add(obj);

            spyOn(text, 'getCanvasRatio').and.returnValue(ratio);

            text._changeToEditingMode(obj);
        });

        afterEach(function() {
            text._removeTextarea();
        });

        it('should change selected text object into textarea.', function() {
            expect(textarea.style.display).not.toEqual('none');
        });

        it('should set style of textarea by selected text object.', function() {
            var textareaStyles = textarea.style;

            expect(textareaStyles['font-size']).toEqual(expected.fontSize / ratio + 'px');
            expect(textareaStyles['font-family'].replace(/'|"/g, '')).toEqual(expected.fontFamily);
            expect(textareaStyles['font-weight']).toEqual(expected.fontWeight);
            expect(textareaStyles['font-align']).toEqual(expected.fontAlign);
            expect(textareaStyles['line-height']).toEqual(obj.getLineHeight() + 0.1);
        });
    });

    describe('_setEventEachObject()', function() {
        var objects;

        beforeEach(function() {
            objects = [
                new fabric.Object({evented: true}),
                new fabric.Circle({evented: true}),
                new fabric.Text('', {evented: true})
            ];

            canvas.add(objects[0], objects[1], objects[2]);
        });

        it('should deactivate event on each object except text when the parameter is false.', function() {
            text._setEventEachObject(false);

            expect(objects[0].evented).toBe(false);
            expect(objects[1].evented).toBe(false);
            expect(objects[2].evented).toBe(true);
        });

        it('should activate event on each object except text when the parameter is true.', function() {
            text._setEventEachObject(false);
            text._setEventEachObject(true);

            expect(objects[0].evented).toBe(true);
            expect(objects[1].evented).toBe(true);
            expect(objects[2].evented).toBe(true);
        });
    });
});
