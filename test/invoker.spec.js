/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/invoker.js"
 */
import {Promise} from '../src/js/util';
import Invoker from '../src/js/invoker';
import Command from '../src/js/interface/command';

describe('Invoker', () => {
    let invoker, cmd;

    beforeEach(() => {
        invoker = new Invoker();

        cmd = new Command({
            execute: jasmine.createSpy().and.returnValue(Promise.resolve()),
            undo: jasmine.createSpy().and.returnValue(Promise.resolve())
        });
    });

    it('"redo()" should call "command.execute" again', done => {
        invoker.execute(cmd).then(() => invoker.undo()).then(() => {
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
        invoker.execute(cmd).then(() => {
            expect(spyCallback).toHaveBeenCalled();
            done();
        });
    });

    it('should call the "command.undoCallback" after undo', done => {
        const spyCallback = jasmine.createSpy();

        cmd.setUndoCallback(spyCallback);
        invoker.execute(cmd).then(() => invoker.undo()).then(() => {
            expect(spyCallback).toHaveBeenCalled();
            done();
        });
    });

    describe('invoker.customEvents', () => {
        let spyEvents;

        beforeEach(() => {
            spyEvents = {
                undoStackChanged: jasmine.createSpy(),
                redoStackChanged: jasmine.createSpy()
            };
        });

        it('"invoke()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is empty before)"', done => {
            invoker.on(spyEvents);
            invoker.execute(cmd).then(() => {
                expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
                expect(spyEvents.redoStackChanged).not.toHaveBeenCalled();
                done();
            });
        });

        it('"invoke()" should fire events - ' +
            ' "pushUndoStack", "clearRedoStack" (when redoStack is not empty before)', done => {
            invoker.pushRedoStack({});

            invoker.on(spyEvents);
            invoker.execute(cmd).then(() => {
                expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
                expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(0);
                done();
            });
        });

        it('"undo()" should fire a event - ' +
            ' "pushRedoStack" (when undoStack is not empty after)', done => {
            invoker.execute(cmd).then(() => invoker.execute(cmd)).then(() => {
                invoker.on(spyEvents);

                return invoker.undo();
            }).then(() => {
                expect(spyEvents.undoStackChanged).not.toHaveBeenCalled();
                expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(1);
                done();
            });
        });

        it('"undo()" should fire events - ' +
            ' "pushRedoStack", "emptyUndoStack" (when undoStack is empty after)', done => {
            invoker.execute(cmd).then(() => {
                invoker.on(spyEvents);

                return invoker.undo();
            }).then(() => {
                expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(1);
                expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(0);
                done();
            });
        });

        it('"redo()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is not empty after)', done => {
            invoker.execute(cmd).then(() => invoker.execute(cmd))
                .then(() => invoker.undo())
                .then(() => invoker.undo())
                .then(() => {
                    invoker.on(spyEvents);

                    return invoker.redo();
                }).then(() => {
                    expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
                    expect(spyEvents.redoStackChanged).not.toHaveBeenCalled();
                    done();
                });
        });

        it('"redo()" should fire events - ' +
            ' "pushUndoStack", "emptyRedoStack" (when undoStack is empty after)', done => {
            invoker.execute(cmd).then(() => invoker.undo()).then(() => {
                invoker.on(spyEvents);

                return invoker.redo(cmd);
            }).then(() => {
                expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
                expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(0);
                done();
            });
        });
    });
});
