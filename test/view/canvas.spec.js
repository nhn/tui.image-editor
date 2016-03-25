'use strict';

var Canvas = require('./../../src/js/view/canvas');

describe('Canvas view', function() {
    var canvas,
        parentMock = {
            getParent: function() {
                return null;
            },
            postCommand: function() {},
            registerAction: function() {},
            deregisterAction: function() {}
        };

    beforeEach(function() {
        canvas = new Canvas(parentMock);
    });

    it('should have view name', function() {
        expect(canvas.getName()).toEqual('canvas');
    });

    it('should register action after render', function() {
        spyOn(canvas, 'registerAction');

        canvas.render();
        expect(canvas.registerAction).toHaveBeenCalled();
    });
});
