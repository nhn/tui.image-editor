import Invoker from '@/invoker';
import Command from '@/interface/command';

describe('Invoker', () => {
  let invoker, cmd;

  beforeEach(() => {
    invoker = new Invoker();
    cmd = new Command({
      execute: jest.fn(() => Promise.resolve()),
      undo: jest.fn(() => Promise.resolve()),
    });
  });

  it('should call "command.execute" again', async () => {
    await invoker.execute(cmd);
    await invoker.undo();
    await invoker.redo();

    expect(cmd.execute).toHaveBeenCalledTimes(2);
  });

  it('should call the "command.executeCallback" after invoke', async () => {
    const callbackSpy = jest.fn();

    cmd.setExecuteCallback(callbackSpy);
    await invoker.execute(cmd);

    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should call the "command.undoCallback" after undo', async () => {
    const callbackSpy = jest.fn();

    cmd.setUndoCallback(callbackSpy);
    await invoker.execute(cmd);
    await invoker.undo();

    expect(callbackSpy).toHaveBeenCalled();
  });

  describe('invoker.customEvents', () => {
    let spyEvents;

    beforeEach(() => {
      spyEvents = {
        undoStackChanged: jest.fn(),
        redoStackChanged: jest.fn(),
      };
    });

    it('should fire a event when redoStack is empty before', async () => {
      invoker.on(spyEvents);
      await invoker.execute(cmd);

      expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
      expect(spyEvents.redoStackChanged).not.toHaveBeenCalled();
    });

    it('should fire events when redoStack is not empty before', async () => {
      invoker.pushRedoStack({});
      invoker.on(spyEvents);
      await invoker.execute(cmd);

      expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
      expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(0);
    });

    it('should fire redo event when undoStack is not empty after', async () => {
      await invoker.execute(cmd);
      await invoker.execute(cmd);

      invoker.on(spyEvents);
      await invoker.undo();

      expect(spyEvents.undoStackChanged).not.toHaveBeenCalled();
      expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(1);
    });

    it('should fire undo event when undoStack is empty after', async () => {
      await invoker.execute(cmd);

      invoker.on(spyEvents);
      await invoker.undo();

      expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(0);
      expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(1);
    });

    it('should fire undo event when redoStack is not empty after', async () => {
      await invoker.execute(cmd);
      await invoker.execute(cmd);
      await invoker.undo();
      await invoker.undo();

      invoker.on(spyEvents);
      await invoker.redo();

      expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
      expect(spyEvents.redoStackChanged).not.toHaveBeenCalled();
    });

    it('should fire redo event when undoStack is empty after', async () => {
      await invoker.execute(cmd);
      await invoker.undo();

      invoker.on(spyEvents);
      await invoker.redo();

      expect(spyEvents.undoStackChanged).toHaveBeenCalledWith(1);
      expect(spyEvents.redoStackChanged).toHaveBeenCalledWith(0);
    });
  });
});
