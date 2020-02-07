/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/extension/cropzone.js"
 */
import snippet from 'tui-code-snippet';
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

    it('"_resizeTL" should give the expected value at run', () => {
        const cropzone = new Cropzone(canvas, options, {});

        expect(cropzone._resizeCropZone({
            x: 30,
            y: 40
        }, 'tl')).toEqual({
            left: 30,
            top: 40,
            width: 80,
            height: 70
        });
    });

    it('"_resizeTR" should give the expected value at run', () => {
        const cropzone = new Cropzone(canvas, options, {});

        expect(cropzone._resizeCropZone({
            x: 80,
            y: 50
        }, 'tr')).toEqual({
            left: 10,
            top: 50,
            width: 70,
            height: 60
        });
    });

    it('"_resizeBL" should give the expected value at run', () => {
        const cropzone = new Cropzone(canvas, options, {});
      
        expect(cropzone._resizeCropZone({
            x: 30,
            y: 40
        }, 'bl')).toEqual({
            left: 30,
            top: 10,
            width: 80,
            height: 30
        });
    });

    it('"_resizeBR" should give the expected value at run', () => {
        const cropzone = new Cropzone(canvas, options, {});
      
        expect(cropzone._resizeCropZone({
            x: 30,
            y: 40
        }, 'br')).toEqual({
            left: 10,
            top: 10,
            width: 20,
            height: 30
        });
    });

    it('should yield the result of maintaining the ratio at running the resize function at a fixed rate', () => {
        const presetRatio = 5 / 4;
        const cropzone = new Cropzone(canvas, snippet.extend({}, options, {
            width: 50,
            height: 40,
            presetRatio
        }), {});

        snippet.forEach(['tl', 'tr', 'mt', 'ml', 'mr', 'mb', 'bl', 'br'], cornerType => {
            const {width, height} = cropzone._resizeCropZone({
                x: 20,
                y: 20
            }, cornerType);

            expect(width / height).toEqual(presetRatio);
        });
    });
});
