There are a lot of changes for ImageEditor 2.0.0 including API changes and new features. This migration document will be nicely moving to v2.0.0.

## New drawing mode change APIs

- New APIs

  - `startDrawingMode(modeName)` starts a drawing mode
  - `stopDrawingMode()` stops current drawing mode and back to 'NORMAL' mode
  - `getDrawingMode()` returns current drawing mode name.
  - `getCropzoneRect()` returns cropping rect in 'CROPPER' drawing mode.
  - `crop(rect)` crops image given area

- Removed APIs
  - `startCropping`, `endCropping`
  - `startDrawingShapeMode`, `endDrawingShapeMode`
  - `startFreeDrawing`, `endFreeDrawing`
  - `startLineDrawing`, `endLineDrawing`
  - `startTextMode`, `endTextMode`
  - `endAll`
  - `endCropping` is divided into three APIs

```js
var rect = imageEditor.getCropzoneRect();
imageEditor.crop(rect).then(() => {
  imageEditor.stopDrawingMode();
});
```

## Changed APIs

- `removeActiveObject()` ==> `removeObject(id)`
- `getCurrentState()` ==> `getDrawingMode()`

## Use object is with all drawing APIs

- In versions prior to 1.4.1, the users should select an object and manipulate it which is called 'active object'. There was no way to manipulate non-selected object. After 2.0.0 version, you can manipulate not only selected object, but also non-selected objects by receiving the Object Id.
- To get the Object Id, use the parameter.id in Promise.then() and the event callback.

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

```js
imageEditor
  .addShape('circle', {
    fill: 'red',
    stroke: 'blue',
    strokeWidth: 3,
    rx: 10,
    ry: 100,
    isRegular: false,
  })
  .then(function (props) {
    console.log(props.id);

    imageEditor.changeShape(props.id, {
      // change circle
      fill: '#FFFF00',
      strokeWidth: 10,
    });
  });
```

## Support Promise API

- All drawing APIs returns Promise and supports Undo/Redo.
- List of related APIs
  - `addIcon`, `addImageObject`, `addShape`, `changeIconColor`
  - `changeShape`, `addText`, `changeText`, `changeTextStyle`,
  - `resizeCanvasDimension`, `applyFilter`, `removeFilter`,
  - `clearObjects`, `flipX`, `flipY`, `loadImageFromFile`,
  - `loadImageFromURL`, `redo`, `undo`, `removeObject`,
  - `resetFlip`, `rotate`, `setAngle`, `crop`,
  - `setObjectPosition`, `setObjectProperties`

## Changed event type

| As-Is                    | To-Be                | Change             | Why & Purpose                                                         |
| ------------------------ | -------------------- | ------------------ | --------------------------------------------------------------------- |
| **~~_activateText_~~**   | **addText**          | renamed            | when mousedown event occurs in 'TEXT' drawing mode                    |
| **_~~addObject~~_**      | -                    | removed            | unnecessary                                                           |
| **_~~adjustObject~~_**   | **objectMoved**      | renamed<br>changed | when user drags an object                                             |
| **_~~adjustObject~~_**   | **objectScaled**     | renamed<br>changed | when object is being scaled                                           |
| ~~applyFilter~~          | -                    | removed            | Replace it to `applyFilter()` Promise API                             |
| ~~clearImage~~           | -                    | removed            | Replace it to `loadImageFromFile()`, `loadImageFromURL()` Promise API |
| ~~clearObjects~~         | -                    | removed            | Replace it to `clearObjects()` Promise API                            |
| **_~~editText~~_**       | **textEditing**      | renamed            | when textbox is being edited                                          |
| **~~_emptyRedoStack_~~** | **redoStackChanged** | renamed<br>changed | Replace it to `redoStackChanged` event with length `0`                |
| **~~_emptyUndoStack_~~** | **undoStackChanged** | renamed<br>changed | Replace it to `undoStackChanged` event with length `0`                |
| ~~endCropping~~          | -                    | removed            | unnecessary                                                           |
| ~~endFreeDrawing~~       | -                    | removed            | unnecessary                                                           |
| ~~endLineDrawing~~       | -                    | removed            | unnecessary                                                           |
| ~~flipImage~~            | -                    | removed            | Replace it to `flipX()`, `flipY()` Promise API                        |
| ~~loadImage~~            | -                    | removed            | Replace it to `loadImageFromFile()`, `loadImageFromURL()` Promise API |
| **mousedown**            | **mousedown**        | remained           | just mousedown                                                        |
| **_~~pushRedoStack~~_**  | **redoStackChanged** | renamed<br>changed | redo change event                                                     |
| **_~~pushUndoStack~~_**  | **undoStackChanged** | renamed<br>changed | undo change event                                                     |
| ~~removeObject~~         | -                    | removed            | Replace it to `removeObject()` Promise API                            |
| ~~rotateImage~~          | -                    | removed            | Replace it to `rotate()`, `setAngle()` Promise API                    |
| **_~~selectObject~~_**   | **objectActivated**  | renamed<br>changed | when user selects an object                                           |
| ~~startCropping~~        | -                    | removed            | unnecessary                                                           |
| ~~startFreeDrawing~~     | -                    | removed            | unnecessary                                                           |
| ~~startLineDrawing~~     | -                    | removed            | unnecessary                                                           |
