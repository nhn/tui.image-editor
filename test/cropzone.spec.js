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
});
