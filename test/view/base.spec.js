'use strict';

var ViewInterface = require('./../../src/js/interface/view'),
    consts = require('./../../src/js/consts');

describe('View interface', function() {
    var instance;

    beforeEach(function() {
        instance = new ViewInterface();
    });

    it('should have unimplemented methods', function() {
        var msg = consts.messages.NOT_IMPLEMENTED;

        expect(function() {
            instance.render();
        }).toThrowError(msg);

        expect(function() {
            instance.destroy();
        }).not.toThrowError();
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
