/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/extension/cropzone.js"
 */
'use strict';

var Cropzone = require('../src/js/extension/cropzone');

describe('Cropzone', function() {
    var cropzone;

    beforeEach(function() {
        cropzone = new Cropzone({
            left: 10,
            top: 10,
            width: 100,
            height: 100,
            cornerSize: 10,
            strokeWidth: 0,
            cornerColor: 'black',
            fill: 'transparent',
            hasRotatingPoint: false,
            hasBorders: false,
            lockScalingFlip: true,
            lockRotation: true
        });
    });

    it('"_getCoordinates()" should return outer&inner rect coordinates(array)', function() {
        var mockCtx = {
                canvas: {
                    width: 300,
                    height: 400
                }
            },
            coords = cropzone._getCoordinates(mockCtx);

        expect(coords).toEqual({
            x: [-60, -50, 50, 240],
            y: [-60, -50, 50, 340]
        });
    });

    it('"_onMoving()" should set left and top between 0 and canvas size', function() {
        var mockFabricCanvas = {
            getWidth: function() {
                return 300;
            },
            getHeight: function() {
                return 400;
            }
        };

        cropzone.canvas = mockFabricCanvas;
        cropzone.setLeft(-1);
        cropzone.setTop(-1);
        cropzone._onMoving();

        expect(cropzone.top).toEqual(0);
        expect(cropzone.left).toEqual(0);

        cropzone.setLeft(1000);
        cropzone.setTop(1000);
        cropzone._onMoving();

        expect(cropzone.left).toEqual(200);
        expect(cropzone.top).toEqual(300);
    });

    it('"isValid()" should return whether the cropzone has real area or not', function() {
        cropzone.setLeft(-1);
        expect(cropzone.isValid()).toBe(false);

        cropzone.setLeft(1);
        expect(cropzone.isValid()).toBe(true);

        cropzone.setHeight(-1);
        expect(cropzone.isValid()).toBe(false);

        cropzone.setHeight(1);
        expect(cropzone.isValid()).toBe(true);
    });

    it('"_calcTopLeftScalingSizeFromPointer()"' +
        ' should return scaling size(position + dimension)', function() {

        var mousePointerX, mousePointerY,
            expected, actual;

        mousePointerX = 20;
        mousePointerY = 30;
        expected = {
            left: 20,
            top: 30,
            width: 90,
            height: 80
        };
        actual = cropzone._calcTopLeftScalingSizeFromPointer(mousePointerX, mousePointerY);
        expect(actual).toEqual(expected);

        mousePointerX = -10;
        mousePointerY = 0;
        expected = {
            left: 0,
            top: 0,
            width: 110,
            height: 110
        };
        actual = cropzone._calcTopLeftScalingSizeFromPointer(mousePointerX, mousePointerY);
        expect(actual).toEqual(expected);

        mousePointerX = 200;
        mousePointerY = 300;
        expected = {
            left: 109,
            top: 109,
            width: 1,
            height: 1
        };
        actual = cropzone._calcTopLeftScalingSizeFromPointer(mousePointerX, mousePointerY);
        expect(actual).toEqual(expected);
    });

    it('"_calcBottomRightScalingSizeFromPointer()"' +
        ' should return scaling size(dimension)', function() {

        var mousePointerX, mousePointerY,
            expected, actual;

        // mocking canvas
        cropzone.canvas = {
            width: 400,
            height: 400
        };

        mousePointerX = 20;
        mousePointerY = 30;
        expected = {
            width: 10,
            height: 20
        };
        actual = cropzone._calcBottomRightScalingSizeFromPointer(mousePointerX, mousePointerY);
        expect(actual).toEqual(expected);

        mousePointerX = -10;
        mousePointerY = 0;
        expected = {
            width: 1,
            height: 1
        };
        actual = cropzone._calcBottomRightScalingSizeFromPointer(mousePointerX, mousePointerY);
        expect(actual).toEqual(expected);

        mousePointerX = 200;
        mousePointerY = 300;
        expected = {
            width: 190,
            height: 290
        };
        actual = cropzone._calcBottomRightScalingSizeFromPointer(mousePointerX, mousePointerY);
        expect(actual).toEqual(expected);
    });

    it('should be "cropzone" type', function() {
        expect(cropzone.isType('cropzone')).toBe(true);
    });

    it('"_makeScalingSettings()" ' +
        'should return suitable position&dimension values from corner', function() {

        var mockTL = {
                width: 1,
                height: 2,
                left: 3,
                top: 4
            },
            mockBR = {
                width: 5,
                height: 6
            },
            expected, actual;

        cropzone.__corner = 'tl';
        expected = {
            width: 1,
            height: 2,
            left: 3,
            top: 4
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'tr';
        expected = {
            width: 5,
            height: 2,
            top: 4
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'bl';
        expected = {
            width: 1,
            height: 6,
            left: 3
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'br';
        expected = {
            width: 5,
            height: 6
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'ml';
        expected = {
            width: 1,
            left: 3
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'mt';
        expected = {
            height: 2,
            top: 4
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'mr';
        expected = {
            width: 5
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);

        cropzone.__corner = 'mb';
        expected = {
            height: 6
        };
        actual = cropzone._makeScalingSettings(mockTL, mockBR);
        expect(expected).toEqual(actual);
    });
});
