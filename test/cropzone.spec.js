/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/extension/cropzone.js"
 */
import fabric from 'fabric';
import Cropzone from '../src/js/extension/cropzone';

describe('Cropzone', () => {
    const options = {
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
    };
    const canvas = new fabric.Canvas();
    canvas.height = 400;
    canvas.width = 300;

    it('"_getCoordinates()" should return outer&inner rect coordinates(array)', () => {
        const cropzone = new Cropzone(canvas, options, {});
        const coords = cropzone._getCoordinates();

        expect(coords).toEqual({
            x: [-60, -50, 50, 240],
            y: [-60, -50, 50, 340]
        });
    });

    it('"_onMoving()" should set left and top between 0 and canvas size', () => {
        const cropzone = new Cropzone(canvas, options, {});
        const mockFabricCanvas = {
            getWidth() {
                return 300;
            },
            getHeight() {
                return 400;
            }
        };

        cropzone.canvas = mockFabricCanvas;
        cropzone.left = -1;
        cropzone.top = -1;
        cropzone._onMoving();

        expect(cropzone.top).toEqual(0);
        expect(cropzone.left).toEqual(0);

        cropzone.left = 1000;
        cropzone.top = 1000;
        cropzone._onMoving();

        expect(cropzone.left).toEqual(200);
        expect(cropzone.top).toEqual(300);
    });

    it('"isValid()" should return whether the cropzone has real area or not', () => {
        const cropzone = new Cropzone(canvas, options, {});
        cropzone.left = -1;
        expect(cropzone.isValid()).toBe(false);

        cropzone.left = 1;
        expect(cropzone.isValid()).toBe(true);

        cropzone.height = -1;
        expect(cropzone.isValid()).toBe(false);

        cropzone.height = 1;
        expect(cropzone.isValid()).toBe(true);
    });

    it('"_calcTopLeftScalingSizeFromPointer()"' +
        ' should return scaling size(position + dimension)', () => {
        const cropzone = new Cropzone(canvas, options, {});
        let mousePointerX, mousePointerY,
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
        ' should return scaling size(dimension)', () => {
        const cropzone = new Cropzone(canvas, options, {});
        let mousePointerX, mousePointerY,
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

    it('should be "cropzone" type', () => {
        const cropzone = new Cropzone(canvas, options, {});
        expect(cropzone.isType('cropzone')).toBe(true);
    });

    it('"_makeScalingSettings()" ' +
        'should return suitable position&dimension values from corner', () => {
        const cropzone = new Cropzone(canvas, options, {});
        const mockTL = {
                width: 1,
                height: 2,
                left: 3,
                top: 4
            },
            mockBR = {
                width: 5,
                height: 6
            };
        let expected, actual;

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
