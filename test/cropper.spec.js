/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/cropper.js"
 */
import snippet from 'tui-code-snippet';
import fabric from 'fabric';
import $ from 'jquery';
import Cropper from '../src/js/component/cropper';
import Graphics from '../src/js/graphics';
import consts from '../src/js/consts';

describe('Cropper', () => {
    let cropper, graphics, canvas;

    beforeEach(() => {
        graphics = new Graphics($('<canvas>')[0]);
        canvas = graphics.getCanvas();
        cropper = new Cropper(graphics);
    });

    describe('start()', () => {
        it('should create a cropzone', () => {
            cropper.start();

            expect(cropper._cropzone).toBeDefined();
        });

        it('should add a cropzone to canvas', () => {
            spyOn(canvas, 'add');
            cropper.start();

            expect(canvas.add).toHaveBeenCalledWith(cropper._cropzone);
        });

        it('should no action if a croppzone has been defined', () => {
            cropper._cropzone = {};
            spyOn(canvas, 'add');
            cropper.start();

            expect(canvas.add).not.toHaveBeenCalled();
        });

        it('should set "evented" of all objects to false', () => {
            const objects = [
                new fabric.Rect({evented: true}),
                new fabric.Rect({evented: true}),
                new fabric.Rect({evented: true})
            ];
            canvas.add(objects[0], objects[1], objects[2]);

            cropper.start();
            expect(objects[0].evented).toBe(false);
            expect(objects[1].evented).toBe(false);
            expect(objects[2].evented).toBe(false);
        });
    });

    describe('"onFabricMouseDown()"', () => {
        let fEvent;
        beforeEach(() => {
            fEvent = {
                e: {}
            };
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 20
            });
        });

        it('should set "selection" to false', () => {
            cropper._onFabricMouseDown(fEvent);
            expect(canvas.selection).toBe(false);
        });

        it('should set "startX, startY"', () => {
            // canvas.getPointer will return object{x: 10, y: 20}
            cropper._onFabricMouseDown(fEvent);
            expect(cropper._startX).toEqual(10);
            expect(cropper._startY).toEqual(20);
        });
    });

    describe('"onFabricMouseMove()', () => {
        beforeEach(() => {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 20
            });
            spyOn(canvas, 'getWidth').and.returnValue(100);
            spyOn(canvas, 'getHeight').and.returnValue(200);
        });

        it('should re-render(remove->set->add) cropzone ' +
            'if the mouse moving is over the threshold(=10)', () => {
            cropper._startX = 0;
            cropper._startY = 0;

            cropper.start();
            spyOn(canvas, 'remove');
            spyOn(cropper._cropzone, 'set');
            spyOn(canvas, 'add');
            cropper._onFabricMouseMove({e: {}});

            expect(canvas.remove).toHaveBeenCalled();
            expect(cropper._cropzone.set).toHaveBeenCalled();
            expect(canvas.add).toHaveBeenCalled();
        });

        it('should not re-render cropzone ' +
            'if the mouse moving is under the threshold', () => {
            cropper._startX = 14;
            cropper._startY = 18;

            cropper.start();
            spyOn(canvas, 'remove');
            spyOn(cropper._cropzone, 'set');
            spyOn(canvas, 'add');
            cropper._onFabricMouseMove({e: {}});

            expect(canvas.remove).not.toHaveBeenCalled();
            expect(cropper._cropzone.set).not.toHaveBeenCalled();
            expect(canvas.add).not.toHaveBeenCalled();
        });
    });

    describe('_calcRectDimensionFromPoint()', () => {
        beforeEach(() => {
            cropper._startX = 10;
            cropper._startY = 20;
            snippet.extend(canvas, {
                getWidth() {
                    return 100;
                },
                getHeight() {
                    return 200;
                }
            });
        });

        it('should return cropzone-left&top (min: 0, max: startX,Y)', () => {
            const x = 20,
                y = -1,
                expected = {
                    left: 10,
                    top: 0,
                    width: jasmine.any(Number),
                    height: jasmine.any(Number)
                },
                actual = cropper._calcRectDimensionFromPoint(x, y);

            expect(actual).toEqual(expected);
        });

        it('should calculate and return cropzone-width&height', () => {
            let x, y, expected, actual;

            x = 30;
            y = 40;
            expected = {
                left: 10,
                top: 20,
                width: 20,
                height: 20
            };
            actual = cropper._calcRectDimensionFromPoint(x, y);
            expect(actual).toEqual(expected);

            x = 300;
            y = 400;
            expected = {
                left: 10,
                top: 20,
                width: 90,
                height: 180
            };
            actual = cropper._calcRectDimensionFromPoint(x, y);
            expect(actual).toEqual(expected);
        });

        it('should create cropzone that has fixed ratio during shift key is pressed.', () => {
            const x = 100;
            const y = 200;
            const expected = {
                left: 10,
                top: 20,
                width: 180,
                height: 180
            };

            cropper._withShiftKey = true;

            const actual = cropper._calcRectDimensionFromPoint(x, y);

            expect(actual).toEqual(expected);
        });

        it('should create cropzone that inverted current mouse position during shift key is pressed.', () => {
            const x = -10;
            const y = -20;
            const expected = {
                left: -10,
                top: 0,
                width: 20,
                height: 20
            };

            cropper._withShiftKey = true;

            const actual = cropper._calcRectDimensionFromPoint(x, y);

            expect(actual).toEqual(expected);
        });
    });

    it('"onFabricMouseUp()" should activate cropzone', () => {
        canvas.setActiveObject = jasmine.createSpy();
        cropper.start();
        cropper._onFabricMouseUp();

        expect(canvas.setActiveObject).toHaveBeenCalledWith(cropper._cropzone);
    });

    describe('"crop()"', () => {
        it('should return cropzone rect', () => {
            cropper.start();
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);

            expect(cropper.getCropzoneRect()).toBeTruthy();
            cropper.end();
        });

        it('should return cropzone data if the cropzone is valid', () => {
            cropper.start();
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);

            expect(cropper.getCroppedImageData(cropper.getCropzoneRect())).toEqual({
                imageName: jasmine.any(String),
                url: jasmine.any(String)
            });
            cropper.end();
        });
    });

    describe('"presets - setCropzoneRect()"', () => {
        beforeEach(() => {
            cropper.start();
        });

        afterEach(() => {
            cropper.end();
        });

        it('should return cropzone rect as a square', () => {
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            cropper.setCropzoneRect(1 / 1);

            expect(cropper.getCropzoneRect().width).toBe(cropper.getCropzoneRect().height);
        });

        it('should return cropzone rect as a 3:2 aspect box', () => {
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            cropper.setCropzoneRect(3 / 2);

            expect((cropper.getCropzoneRect().width / cropper.getCropzoneRect().height).toFixed(1))
                .toBe((3 / 2).toFixed(1));
        });

        it('should return cropzone rect as a 4:3 aspect box', () => {
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            cropper.setCropzoneRect(4 / 3);

            expect((cropper.getCropzoneRect().width / cropper.getCropzoneRect().height).toFixed(1))
                .toBe((4 / 3).toFixed(1));
        });

        it('should return cropzone rect as a 5:4 aspect box', () => {
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            cropper.setCropzoneRect(5 / 4);

            expect((cropper.getCropzoneRect().width / cropper.getCropzoneRect().height).toFixed(1))
                .toBe((5 / 4).toFixed(1));
        });

        it('should return cropzone rect as a 7:5 aspect box', () => {
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            cropper.setCropzoneRect(7 / 5);

            expect((cropper.getCropzoneRect().width / cropper.getCropzoneRect().height).toFixed(1))
                .toBe((7 / 5).toFixed(1));
        });

        it('should return cropzone rect as a 16:9 aspect box', () => {
            spyOn(cropper._cropzone, 'isValid').and.returnValue(true);
            cropper.setCropzoneRect(16 / 9);

            expect((cropper.getCropzoneRect().width / cropper.getCropzoneRect().height).toFixed(1))
                .toBe((16 / 9).toFixed(1));
        });

        it('Even in situations with floating point problems, should calculate the exact width you expect.', () => {
            spyOn(canvas, 'getWidth').and.returnValue(408);
            spyOn(canvas, 'getHeight').and.returnValue(312);
            spyOn(cropper._cropzone, 'set').and.callThrough();

            cropper.setCropzoneRect(16 / 9);

            expect(cropper._cropzone.set.calls.first().args[0].width).toBe(408);
        });

        it('should remove cropzone of cropper when falsy is passed', () => {
            cropper.setCropzoneRect();
            expect(cropper.getCropzoneRect()).toBeFalsy();

            cropper.setCropzoneRect(0);
            expect(cropper.getCropzoneRect()).toBeFalsy();

            cropper.setCropzoneRect(null);
            expect(cropper.getCropzoneRect()).toBeFalsy();
        });
    });

    describe('"end()"', () => {
        it('should set cropzone of cropper to null', () => {
            cropper.start();
            cropper.end();

            expect(cropper._cropzone).toBe(null);
        });

        it('should set "evented" of all obejcts to true', () => {
            const objects = [
                new fabric.Rect({evented: false}),
                new fabric.Rect({evented: false}),
                new fabric.Rect({evented: false})
            ];
            canvas.add(objects[0], objects[1], objects[2]);

            cropper.start();
            cropper.end();
            expect(objects[0].evented).toBe(true);
            expect(objects[1].evented).toBe(true);
            expect(objects[2].evented).toBe(true);
        });
    });
    describe('canvas event delegator', () => {
        it('The event of an object with an eventDelegator must fire the graphics.fire registered with the trigger.', () => {
            cropper.start();
            spyOn(graphics, 'fire');
            const events = consts.eventNames;
            const fEvent = {
                target: cropper._cropzone
            };

            const cropzone = cropper._cropzone;

            canvas.fire('object:scaling', fEvent);

            expect(graphics.fire.calls.count()).toBe(0);
            cropzone.canvasEventTrigger[events.OBJECT_SCALED](cropzone);
            expect(graphics.fire.calls.count()).toBe(1);
        });
    });
});
