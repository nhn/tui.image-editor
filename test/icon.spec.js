/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/icon.js"
 */
'use strict';

var Main = require('../src/js/component/main');
var Icon = require('../src/js/component/icon');

describe('Icon', function() {
    var canvas, main, mockImage, icon;

    beforeAll(function() {
        canvas = new fabric.Canvas($('<canvas>')[0]);
        main = new Main();
        main.canvas = canvas;
        icon = new Icon(main);
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

    it('add() should insert the activated icon object on canvas.', function() {
        var activeObj;

        icon.add('arrow');

        activeObj = canvas.getActiveObject();

        expect(activeObj).not.toEqual(null);
    });

    it('add() should insert the icon object on center of canvas image.', function() {
        var centerPos = icon.getCanvasImage().getCenterPoint();
        var activeObj;

        icon.add('arrow');

        activeObj = canvas.getActiveObject();

        expect(activeObj.left).toEqual(centerPos.x);
        expect(activeObj.top).toEqual(centerPos.y);
    });

    it('add() should create the arrow icon when parameter value is "arrow".', function() {
        spyOn(icon, '_createArrowIcon').and.returnValue(new fabric.Object({}));

        icon.add('arrow');

        expect(icon._createArrowIcon).toHaveBeenCalled();
    });

    it('add() should create the cancel icon when parameter value is "cancel".', function() {
        spyOn(icon, '_createCancelIcon').and.returnValue(new fabric.Object({}));

        icon.add('cancel');

        expect(icon._createCancelIcon).toHaveBeenCalled();
    });

    it('setColor() should change color of next inserted icon.', function() {
        var activeObj;
        var color = '#ffffff';

        icon.add('arrow');
        activeObj = canvas.getActiveObject();
        expect(activeObj.fill).not.toEqual(color);

        icon.setColor(color);

        icon.add('cancel');
        activeObj = canvas.getActiveObject();
        expect(activeObj.fill).toEqual(color);
    });
});
