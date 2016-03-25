'use strict';

var Canvas = require('./../../src/js/view/canvas'),
    commands = require('./../../src/js/consts').commands;

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
        spyOn(canvas, 'postCommand');

        canvas.render();
        expect(canvas.postCommand).toHaveBeenCalledWith(
            jasmine.objectContaining({
                name: commands.SET_CANVAS_ELEMENT
            })
        );
    });
});
