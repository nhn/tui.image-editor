'use strict';

var Canvas = require('./../../src/js/view/canvas');

describe('Canvas view', function() {
    var canvas;

    beforeEach(function() {
        Canvas.prototype.postCommand = jasmine.createSpy();
        canvas = new Canvas();
    });

    it('should have view name', function() {
        expect(canvas.getName()).toEqual('canvas');
    });

    it('should post command after render', function() {
        expect(Canvas.prototype.postCommand).toHaveBeenCalledWith({
            name: 'setCanvasElement',
            args: jasmine.any(Object)
        });
    });
});
