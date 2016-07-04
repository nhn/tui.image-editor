/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/freeDrawing.js"
 */
'use strict';

var Main = require('../src/js/component/main');
var FreeDrawing = require('../src/js/component/freeDrawing');

describe('FreeDrawing', function() {
    var canvas, main, mockImage, freeDrawing, fEvent;

    beforeAll(function() {
        canvas = new fabric.Canvas($('<canvas>')[0]);
        main = new Main();
        main.canvas = canvas;
        freeDrawing = new FreeDrawing(main);
    });

    beforeEach(function() {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);

        fEvent = {
            e: {}
        };
    });

    afterEach(function() {
        canvas.forEachObject(function(obj) {
            canvas.remove(obj);
        });
    });

    it('_onFabricMouseDown() should insert the straight line during shift key is pressed.', function() {
        freeDrawing._isShortcut = true;

        freeDrawing._onFabricMouseDown(fEvent);

        expect(canvas.getObjects().length).toEqual(1);
    });

    it('_onFabricMouseMove() should draw line located by mouse pointer.', function() {
        freeDrawing._line = new fabric.Line([10, 20, 10, 20]);

        canvas.add(freeDrawing._line);

        spyOn(canvas, 'getPointer').and.returnValue({
            x: 30,
            y: 60
        });

        freeDrawing._isShortcut = true;

        expect(canvas.getObjects()[0].get('x2')).toEqual(10);
        expect(canvas.getObjects()[0].get('y2')).toEqual(20);

        freeDrawing._onFabricMouseMove(fEvent);

        expect(canvas.getObjects()[0].get('x2')).toEqual(30);
        expect(canvas.getObjects()[0].get('y2')).toEqual(60);
    });

    it('_onFabricMouseUp() should restore drawing mode if shift key is not pressed.', function() {
        freeDrawing._onFabricMouseUp();
        freeDrawing._onFabricMouseDown(fEvent);

        expect(canvas.getObjects().length).toEqual(0);
    });

    it('end() should restore all drawing objects activated.', function() {
        var path = new fabric.Path();

        canvas.add(path);

        path.set({
            selectable: false
        });

        expect(canvas.getObjects()[0].get('selectable')).toEqual(false);

        freeDrawing.end();

        expect(canvas.getObjects()[0].get('selectable')).toEqual(true);
    });
});
