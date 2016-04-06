'use strict';

var Cropper = require('../src/js/handler/Cropper'),
    Component = require('../src/js/interface/component');

describe('Cropper', function() {
    var cropper, mockRoot, canvas;

    beforeEach(function() {
        canvas = new fabric.Canvas();
        mockRoot = new Component();
        tui.util.extend(mockRoot, {
            canvas: canvas,
            components: {},
            oImage: {},
            imageName: 'foo',
            registerAction: function() {}
        });
        cropper = new Cropper(mockRoot);
    });

    describe('start()', function() {
        it('should create a cropzone', function() {
            cropper.start();

            expect(cropper.cropzone).toBeDefined();
        });

        it('should add a cropzone to canvas', function() {
            spyOn(canvas, 'add');
            cropper.start();

            expect(canvas.add).toHaveBeenCalledWith(cropper.cropzone);
        });

        it('should no action if a croppzone has been defined', function() {
            cropper.cropzone = {};
            spyOn(canvas, 'add');
            cropper.start();

            expect(canvas.add).not.toHaveBeenCalled();
        });
    });

    describe('"onFabricMouseDown()"', function() {
        var fEvent;
        beforeEach(function() {
            fEvent = {
                e: {}
            };
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 20
            });
        });

        it('should set "selection" to false', function() {
            cropper.onFabricMouseDown(fEvent);
            expect(canvas.selection).toBe(false);
        });

        it('should set "startX, startY"', function() {
            // canvas.getPointer will return object{x: 10, y: 20}
            cropper.onFabricMouseDown(fEvent);
            expect(cropper.startX).toEqual(10);
            expect(cropper.startY).toEqual(20);
        });
    });

    describe('"onFabricMouseMove()', function() {
        beforeEach(function() {
            spyOn(canvas, 'getPointer').and.returnValue({
                x: 10,
                y: 20
            });
            spyOn(canvas, 'getWidth').and.returnValue(100);
            spyOn(canvas, 'getHeight').and.returnValue(200);
        });

        it('should re-render(remove->set->add) cropzone ' +
            'if the mouse moving is over the threshold(=10)', function() {
            cropper.startX = 0;
            cropper.startY = 0;

            cropper.start();
            spyOn(cropper.cropzone, 'remove');
            spyOn(cropper.cropzone, 'set');
            spyOn(canvas, 'add');
            cropper.onFabricMouseMove({e: {}});

            expect(cropper.cropzone.remove).toHaveBeenCalled();
            expect(cropper.cropzone.set).toHaveBeenCalled();
            expect(canvas.add).toHaveBeenCalled();
        });

        it('should not re-render cropzone ' +
            'if the mouse moving is under the threshold', function() {
            cropper.startX = 14;
            cropper.startY = 18;

            cropper.start();
            spyOn(cropper.cropzone, 'remove');
            spyOn(cropper.cropzone, 'set');
            spyOn(canvas, 'add');
            cropper.onFabricMouseMove({e: {}});

            expect(cropper.cropzone.remove).not.toHaveBeenCalled();
            expect(cropper.cropzone.set).not.toHaveBeenCalled();
            expect(canvas.add).not.toHaveBeenCalled();
        });
    });

    describe('_calcRectDimensionFromPoint()', function() {
        beforeEach(function() {
            cropper.startX = 10;
            cropper.startY = 20;
            tui.util.extend(canvas, {
                getWidth: function() {
                    return 100;
                },
                getHeight: function() {
                    return 200;
                }
            });
        });

        it('should return cropzone-left&top (min: 0, max: startX,Y)', function() {
            var x = 20,
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

        it('should calculate and return cropzone-width&height', function() {
            var x, y, expected, actual;

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
    });

    it('"onFabricMouseUp()" should activate cropzone', function() {
        canvas.setActiveObject = jasmine.createSpy();
        cropper.start();
        cropper.onFabricMouseUp();

        expect(canvas.setActiveObject).toHaveBeenCalledWith(cropper.cropzone);
    });

    describe('"end()"', function() {
        it('should set cropzone of cropper to null', function() {
            cropper.start();
            cropper.end();

            expect(cropper.cropzone).toBe(null);
        });

        it('should post command if cropzone is valid and crop is not canceled', function() {
            cropper.start();
            spyOn(cropper.cropzone, 'isValid').and.returnValue(true);
            cropper.postCommand = jasmine.createSpy();
            cropper.end(true);

            expect(cropper.postCommand).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    name: jasmine.any(String),
                    args: jasmine.anything()
                })
            );
        });

        it('should not post command if cropzone is invalid or crop is canceled', function() {
            cropper.start();
            spyOn(cropper.cropzone, 'isValid').and.returnValue(true);
            cropper.postCommand = jasmine.createSpy();
            cropper.end(false);
            expect(cropper.postCommand).not.toHaveBeenCalled();

            cropper.start();
            spyOn(cropper.cropzone, 'isValid').and.returnValue(false);
            cropper.end(true);
            expect(cropper.postCommand).not.toHaveBeenCalled();
        });
    });
});
