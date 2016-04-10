'use strict';

var Invoker = require('../src/js/invoker'),
    Command = require('../src/js/interface/command');

describe('Invoker', function() {
    var invoker,
        component = {
            getName: function() {
                return 'foo';
            },
            action: function() {}
        };

    beforeEach(function() {
        invoker = new Invoker(component);
    });

    it('invoke', function() {
        var cmd = new Command({
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
            execute: jasmine.createSpy(),
            undo: jasmine.createSpy()
        });

        invoker.invoke(cmd);
        expect(cmd.execute).toHaveBeenCalledWith(invoker.componentMap);
        invoker.undo();
        expect(cmd.undo).toHaveBeenCalledWith(invoker.componentMap);

        cmd.undo.calls.reset();
        invoker.undo();
        expect(cmd.undo).not.toHaveBeenCalled();
    });

    it('redo', function() {
        var cmd = new Command({
            execute: jasmine.createSpy(),
            undo: jasmine.createSpy()
        });

        invoker.invoke(cmd);
        invoker.undo();

        cmd.execute.calls.reset();
        expect(cmd.execute).not.toHaveBeenCalled();
        invoker.redo();
        expect(cmd.execute).toHaveBeenCalledWith(invoker.componentMap);
    });
});
