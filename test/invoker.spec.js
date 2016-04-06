'use strict';

var Invoker = require('../src/js/invoker'),
    Command = require('../src/js/interface/command');

describe('Invoker', function() {
    var invoker,
        component = {
            action: function() {}
        };

    beforeEach(function() {
        invoker = new Invoker();
        invoker.register('foo', component);
    });

    it('invoke', function() {
        var cmd = new Command({
            name: 'cmd',
            execute: function(componentsMap) {
                var foo = componentsMap.foo;
                foo.action();
            },
            undo: function() {}
        });
        spyOn(component, 'action');

        expect(component.action).not.toHaveBeenCalled();
        invoker.invoke(cmd);
        expect(component.action).toHaveBeenCalled();
    });

    it('undo', function() {
        var cmd = new Command({
            name: 'cmd',
            execute: jasmine.createSpy(),
            undo: jasmine.createSpy()
        });

        invoker.invoke(cmd);
        expect(cmd.execute).toHaveBeenCalledWith(invoker.components);
        invoker.undo();
        expect(cmd.undo).toHaveBeenCalledWith(invoker.components);

        cmd.undo.calls.reset();
        invoker.undo();
        expect(cmd.undo).not.toHaveBeenCalled();
    });

    it('redo', function() {
        var cmd = new Command({
            name: 'cmd',
            execute: jasmine.createSpy(),
            undo: jasmine.createSpy()
        });

        invoker.invoke(cmd);
        invoker.undo();

        cmd.execute.calls.reset();
        expect(cmd.execute).not.toHaveBeenCalled();
        invoker.redo();
        expect(cmd.execute).toHaveBeenCalledWith(invoker.components);
    });
});
