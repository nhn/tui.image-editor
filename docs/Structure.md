# Introducation

- The image editor includes an implementation that includes the UI via the includeUI option.
  However, you can express the implementation more freely without using the basic UI.

# Modules

Internally, it is separated into two major layers.

- `ImageEditor` - The object responsible for the API has the having two layers, and communicates directly with the UI.
  - `Middle Layer` - It is composed of `Invoker`, `Command`, `CommandFactory` which provides the function of the application independent of the drawing operation.
  - `Graphics Layer` - Generally speaking, a canvas is composed of `Canvas` which consists of functions provided by ImageEditor. Drawing operation is abstracted and the actual implementation uses _fabric.js_.
    - `Component` is a modularized drawing operation of a specific function and belongs to the Graphics Layer.
    - Drawing mode is a feature that is essential in the Graphics Layer.

## ImageEditor

The object responsible for the API, which has the Invoker and Graphics properties.

## CommandFactory

It is a class to register and create `Command`.
Provide an interface to register a command and create an instance of the registered command where you need to draw with ImageEditor or Command.

- register - Command registration
- create - Create Instance of Registered Command

## Command

Command is a unit of execution for performing specific functions and is independent of other modules. In the image editor, it is used as an execution unit for Undo / Redo, and the Command instance is managed as a stack in the Invoker.<br>
Command registration receives objects actions and args that define `name`,` execute`, and `undo`.

### Command Class

```js
class Command {
  constructor(actions, args) {
    this.name = actions.name;
    this.args = args;
    this.execute = actions.execute;
    this.undo = actions.undo;
    this.executeCallback = actions.executeCallback || null;
    this.undoCallback = actions.undoCallback || null;
    this.undoData = {};
  }
}
```

#### Command registration process.

CommandFactory.register is executed when import. The Command class gets the Component to use and passes the Graphics instance to perform the function.

```js
// commandName.js
import commandFactory from '../factory/command';
const command = {
  name: 'commandName',
  execute(graphics, ...args) {},
  undo(graphics, ...args) {},
};

CommandFactory.register(command);
module.export = command;
```

#### Command creation and execution.

```js
const command = commandFactory.create('commandName', param1, param2);
command
  .execute(...command.args)
  .then((value) => {
    // push undo stack
    return value;
  })
  .catch((message) => {
    // do something
    return Promise.reject(message);
  });
```

## Invoker

Execute `Command` and manage Undo / Redo.

- `Component` list management is removed here. Escalate to the Canvas to be specified below.

## Canvas

- As the drawing core module of ImageEditor, we have all of the drawing functions we provide.
- The underlying graphics module uses fabric.js.
- Below is a list of functions provided by the image editor.

| **Icon**        | **Image**         | **Shape**       | **Text**        | **Flip**  | **FreeDrawing** | **LineDrawing** | **Rotate** | Crop            | **기타**              |
| --------------- | ----------------- | --------------- | --------------- | --------- | --------------- | --------------- | ---------- | --------------- | --------------------- |
| addIcon         | addImageObject    | addShape        | addText         | flipX     | setBrush        | setBrush        | rotate     | crop            | resizeCanvasDimension |
| registerIcons   | loadImageFromFile | setDrawingShape | changeText      | flipY     |                 |                 | setAngle   | getCropzoneRect | toDataURL             |
| changeIconColor | loadImageFromURL  | changeShape     | changeTextStyle | resetFlip |                 |                 |            |                 | getDrawingMode        |
|                 | ApplyFilter       |                 |                 |           |                 |                 |            |                 | setDrawingMode        |
|                 | RemoveFilter      |                 |                 |           |                 |                 |            |                 | getImageName          |
|                 | hasFilter         |                 |                 |           |                 |                 |            |                 | clearObjects          |
|                 |                   |                 |                 |           |                 |                 |            |                 | removeActiveObject    |
|                 |                   |                 |                 |           |                 |                 |            |                 | destroy               |
|                 |                   |                 |                 |           |                 |                 |            |                 | setDefaultPathStyle   |

## Component

- `Component` is a module that implements a specific drawing operation.
- `Component` is a subset of the drawing set, so you can use it through` Canvas`.
- `Command` uses `Canvas` to manage various Components.
- The event that should be externally transmitted from the Component is passed through the Canvas. The Canvas passes the event back if it is registered outside Canvas.
- The component list is shown below, and the components that need to change modes such as start / end are displayed.

| Name        | Need mode | Usage                                  |
| ----------- | --------- | -------------------------------------- |
| Cropper     | O         | Crop module, event handling for Crop.  |
| filter      | X         | Image filter module                    |
| flip        | X         | Image flip Module.                     |
| freeDrawing | O         | free drawing module                    |
| icon        | X         | Add Icon Module                        |
| imageLoader | X         | Main image loading module              |
| line        | O         | Straight line drawing module           |
| rotation    | X         | Main image and objects rotation module |
| shape       | O         | Shape drawing module                   |
| text        | O         | Text object input module.              |

# The drawing mode is mutually exclusive, and Command operation is the user's part.

- Only one drawing mode should be activated at a time, because the events and UI used for each mode are different. Therefore, the drawing mode is mutually exclusive.
- On the other hand, `Command` is a command that defines the drawing operation, so it can be considered to be able to operate regardless of the drawing mode.
- Command` is is no dependency on the drawing mode, and the operation is delegated to the user.
- The image editor expects you to make the following general API calls:

<span style="color:#333333"><Common usage example></span>

```
editor.setDrawingMode("cropper");
editor.crop(editor.getCropzoneRect());
editor.setDrawingMode("normal");
```

<span style="color:#333333"><Not recommended.></span>

```
editor.setDrawingMode("cropper");
editor.rotate(90);
editor.setDrawingMode("normal");
```

# Event handling

- Canvas Layer For modularity, all events that occur inside the canvas are passed through the Canvas.
- Events that occur on a Component managed by a Canvas are passed to the Canvas, and Canvas to the outside.
- All callbacks that need to be passed to the UI are passed through the ImageEditor. For example, events that need to be imported from Canvas and Component are registered with ImageEditor and registered with Canvas.
- If an event from the Canvas needs to be managed by an undo stack, the ImageEditor receives an event from the Canvas and calls the Invoker function.

# UI delivery events.

- Most events that are passed to the UI are replaced by Promise, which conveys the completion of execution. The undo / redo related events pass events to the UI as they are for state value management.

| Name             | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| addText          | when mousedown event occurs in 'TEXT' drawing mode |
| objectActivated  | when user selects an object                        |
| objectMoved      | when user drags an object                          |
| objectScaled     | when object is being scaled                        |
| textEditing      | when textbox is being edited                       |
| mousedown        | just mousedown                                     |
| undoStackChanged | undo change event                                  |
| redoStackChanged | redo change event                                  |

### Example

```js
/*
{
    id: number
    type: type
    left: number,
    top: number,
    width: number,
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number,

    // text object
    text: string,
    fontFamily: string,
    fontSize: number,
    fontStyle: string,
    fontWeight: string,
    textAlign: string,
    textDecoration: string
}
*/
imageEditor.on('objectActivated', function (props) {
  console.log(props);
  console.log(props.type);
  console.log(props.id);
});
```

# Class Diagram

```uml
class ServiceUI {
  -ImageEditor _imageEditor
}

class ImageEditor {
  -Invoker _invoker
  -Graphics _graphics

  -void execute(commandName)
}

package "Middle Layer" #DDDDDD {
  class Invoker
  class Command
  class CommandFactory
}

together {
  class Invoker
  class Command
  class CommandFactory
}

package "Graphics Layer" #DDDDDD {
  class Graphics

}

package "Component" {
  class Component
  class Cropper
  class Filter
  class Flip
  class FreeDrawing
  class Icon
  class ImageLoader
  class Line
  class Rotation
  class Shape
  class Text
}

package "DrawingMode" {
  class DrawingMode
  class CropperDrawingMode
  class FreeDrawingMode
  class LineDrawingMode
  class ShapeDrawingMode
  class TextDrawingMode
}

class Invoker {
  -Array _undoStack
  -Array _redoStack

  +Promise execute("commandName")
  +Promise undo()
  +Promise redo()
  +void pushUndoStack(command, isSilent)
  +void pushRedoStack(command, isSilent)
}

class CommandFactory {
  -Map _commands

  +void register(commandObject)
  +Command create("commandName", ...args)
}

class Command {
  +string name
  +Array args
  +Object _undoData

  +Promise execute()
  +Promise undo()
  +Command setExecuteCallback(callback)
  +Command setUndoCallback(callback)
}

class Graphics {
  -DrawingMode[] _drawingModeInstances
  -Component[] _components
  -Fabric.Canvas _canvas

  +setDrawingMode("modeName")
  +setDefaultPathStyle(style)
  +on("eventName", callback)
}

class Component {

}

class DrawingMode {

}

ServiceUI o-- ImageEditor
ImageEditor o-- Graphics
ImageEditor o-- Invoker
ImageEditor <|-- tui.util.CustomEvents
ImageEditor --> CommandFactory
ImageEditor --> Command

Invoker <|-- tui.util.CustomEvents
Invoker --> CommandFactory
Invoker o-- Command

Command o-- Graphics
Command o-- Component

Graphics o-- DrawingMode
Graphics o-- Component
Graphics o-- Fabric.Canvas
Graphics <|-- tui.util.CustomEvents

Component <|-- Cropper
Component <|-- Filter
Component <|-- Flip
Component <|-- FreeDrawing
Component <|-- Icon
Component <|-- ImageLoader
Component <|-- Line
Component <|-- Rotation
Component <|-- Shape
Component <|-- Text

Cropper <-- Fabric.Canvas
Filter <-- Fabric.Canvas
Flip <-- Fabric.Canvas
FreeDrawing <-- Fabric.Canvas
Icon <-- Fabric.Canvas
ImageLoader <-- Fabric.Canvas
Line <-- Fabric.Canvas
Rotation <-- Fabric.Canvas
Shape <-- Fabric.Canvas
Text <-- Fabric.Canvas

DrawingMode --> Component
DrawingMode <|-- CropperDrawingMode
DrawingMode <|-- FreeDrawingMode
DrawingMode <|-- LineDrawingMode
DrawingMode <|-- ShapeDrawingMode
DrawingMode <|-- TextDrawingMode

CropperDrawingMode <-- Cropper
FreeDrawingMode <-- FreeDrawing
LineDrawingMode <-- Line
ShapeDrawingMode <-- Shape
TextDrawingMode <-- Text
```
