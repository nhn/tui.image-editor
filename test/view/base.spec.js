'use strict';

var ViewInterface = require('./../../src/js/view/interface'),
    consts = require('./../../src/js/consts');

describe('View interface', function() {
    var instance;

    beforeEach(function() {
        instance = new ViewInterface();
    });

    it('should have unimplemented methods', function() {
        var msg = consts.messages.NOT_IMPLEMENTED;

        expect(function() {
            instance.hasView();
        }).toThrowError(msg);

        expect(function() {
            instance.addView();
        }).toThrowError(msg);

        expect(function() {
            instance.removeView();
        }).toThrowError(msg);

        expect(function() {
            instance.render();
        }).toThrowError(msg);

        expect(function() {
            instance.destroy();
        }).toThrowError(msg);
    });

    it('should throw error if nameless', function() {
        var msg = consts.messages.NO_VIEW_NAME;

        expect(function() {
            instance.getName();
        }).toThrowError(msg);
    });

    it('should return name if named', function() {
        instance.name = 'test';
        expect(instance.getName()).toEqual('test');
    });

    it('should throw error if does not have an element', function() {
        var msg = consts.messages.NO_ELEMENT;

        expect(function() {
            instance.getElement();
        }).toThrowError(msg);
    });

    it('should return if has an element', function() {
        var $element = $('<div />');

        instance.$element = $element;
        expect(instance.getElement()).toEqual($element);
    });
});
