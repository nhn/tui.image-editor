/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/invoker.js"
 */
'use strict';

var Invoker = require('../src/js/invoker'),
    Command = require('../src/js/interface/command');

describe('Invoker', function() {
    var component = {
        getName: function() {
            return 'foo';
        },
        action: function() {}
    };
    var invoker, cmd;

    beforeEach(function() {
        invoker = new Invoker();
        invoker._register(component);

        cmd = new Command({
            execute: jasmine.createSpy(),
            undo: jasmine.createSpy()
        });
    });

    it('should inject registered components to "command.execute"', function() {
        invoker.invoke(cmd);

        expect(cmd.execute).toHaveBeenCalledWith(jasmine.objectContaining({
            foo: component
        }));
    });

    it('should inject registered components to "command.undo"', function() {
        invoker.invoke(cmd);
        invoker.undo();

        expect(cmd.undo).toHaveBeenCalledWith(jasmine.objectContaining({
            foo: component
        }));
    });

    it('redo() should call "command.execute" again', function() {
        invoker.invoke(cmd);
        invoker.undo();

        cmd.execute.calls.reset();
        invoker.redo();

        expect(cmd.execute).toHaveBeenCalled();
    });

    it('should call the "command.executeCallback" after invoke', function() {
        var spyCallback = jasmine.createSpy();

        cmd.setExecuteCallback(spyCallback);
        invoker.invoke(cmd);

        expect(spyCallback).toHaveBeenCalled();
    });

    it('should call the "command.undoCallback" after undo', function() {
        var spyCallback = jasmine.createSpy();

        cmd.setUndoCallback(spyCallback);
        invoker.invoke(cmd);
        invoker.undo();

        expect(spyCallback).toHaveBeenCalled();
    });
});
