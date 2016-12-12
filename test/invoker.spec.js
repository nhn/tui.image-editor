/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/invoker.js"
 */
import Promise from 'core-js/library/es6/promise';
import Invoker from '../src/js/invoker';
import Command from '../src/js/interface/command';

describe('Invoker', () => {
    const component = {
        getName() {
            return 'foo';
        },
        action() {}
    };
    let invoker, cmd;

    beforeEach(() => {
        invoker = new Invoker();
        invoker._register(component);

        cmd = new Command({
            execute: jasmine.createSpy().and.returnValue(Promise.resolve()),
            undo: jasmine.createSpy().and.returnValue(Promise.resolve())
        });
    });

    it('should inject registered components to "command.execute"', () => {
        invoker.invoke(cmd);

        expect(cmd.execute).toHaveBeenCalledWith(jasmine.objectContaining({
            foo: component
        }));
    });

    it('should inject registered components to "command.undo"', done => {
        invoker.invoke(cmd).then(() => invoker.undo()).then(() => {
            expect(cmd.undo).toHaveBeenCalledWith(jasmine.objectContaining({
                foo: component
            }));
            done();
        });
    });

    it('"redo()" should call "command.execute" again', done => {
        invoker.invoke(cmd).then(() => invoker.undo()).then(() => {
            cmd.execute.calls.reset();

            return invoker.redo();
        }).then(() => {
            expect(cmd.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should call the "command.executeCallback" after invoke', done => {
        const spyCallback = jasmine.createSpy();

        cmd.setExecuteCallback(spyCallback);
        invoker.invoke(cmd).then(() => {
            expect(spyCallback).toHaveBeenCalled();
            done();
        });
    });

    it('should call the "command.undoCallback" after undo', done => {
        const spyCallback = jasmine.createSpy();

        cmd.setUndoCallback(spyCallback);
        invoker.invoke(cmd).then(() => invoker.undo()).then(() => {
            expect(spyCallback).toHaveBeenCalled();
            done();
        });
    });

    describe('invoker.customEvents', () => {
        let spyEvents;

        beforeEach(() => {
            spyEvents = {
                pushUndoStack: jasmine.createSpy(),
                pushRedoStack: jasmine.createSpy(),
                emptyUndoStack: jasmine.createSpy(),
                emptyRedoStack: jasmine.createSpy()
            };
        });

        it('"invoke()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is empty before)"', done => {
            invoker.on(spyEvents);
            invoker.invoke(cmd).then(() => {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"invoke()" should fire events - ' +
            ' "pushUndoStack", "clearRedoStack" (when redoStack is not empty before)', done => {
            invoker.pushRedoStack({});

            invoker.on(spyEvents);
            invoker.invoke(cmd).then(() => {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).toHaveBeenCalled();
                done();
            });
        });

        it('"undo()" should fire a event - ' +
            ' "pushRedoStack" (when undoStack is not empty after)', done => {
            invoker.invoke(cmd).then(() => invoker.invoke(cmd)).then(() => {
                invoker.on(spyEvents);

                return invoker.undo();
            }).then(() => {
                expect(spyEvents.pushUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"undo()" should fire events - ' +
            ' "pushRedoStack", "emptyUndoStack" (when undoStack is empty after)', done => {
            invoker.invoke(cmd).then(() => {
                invoker.on(spyEvents);

                return invoker.undo();
            }).then(() => {
                expect(spyEvents.pushUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"redo()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is not empty after)', done => {
            invoker.invoke(cmd).then(() => invoker.invoke(cmd))
            .then(() => invoker.undo())
            .then(() => invoker.undo())
            .then(() => {
                invoker.on(spyEvents);

                return invoker.redo();
            }).then(() => {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"redo()" should fire events - ' +
            ' "pushUndoStack", "emptyRedoStack" (when undoStack is empty after)', done => {
            invoker.invoke(cmd).then(() => invoker.undo()).then(() => {
                invoker.on(spyEvents);

                return invoker.redo(cmd);
            }).then(() => {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).toHaveBeenCalled();
                done();
            });
        });
    });
});
