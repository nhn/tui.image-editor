
### Text
- Insert text on the canvas and modify text.
- Change text color, weight, align so on.

>**Implementing to insert text on the canvas using the text palette**
- The user can make the specific text palette and edit some text using this palette.
- Call custom event API, it can insert text object and control the text palette.
 * `ImageEditor#activateText` : It occurs when the canvas is clicked.
 * `ImageEditor#adjustObject` : It occurs when any inserted text object is moved or resized.

```js
imageEditor.on('activateText', function(obj) {
  console.log(obj.type); // Whether the current text object is new or aleady created
  console.log(obj.text); // Contents of the current text object
  console.log(obj.styles); // Styles of the current text object
  console.log(obj.originPosition); // Mouse position on the canvas
  console.log(obj.clientPosition); // Mouse position on browser - set the text palette's position
});
```
```js
imageEditor.on('adjustObject', function(obj) {
  console.log(obj.type); // Whether the selected object's type is "text" or others - control the the text palette's view state
});
```
![image](https://cloud.githubusercontent.com/assets/18183560/16838164/cd200920-4a02-11e6-9c5a-304d1a07d82a.png)


### Icon
- Insert the basic icon on the canvas. (type: _arrow_, _cancel_ icon)
- Register the custom icon.
- Change color of the icon.

>**How to draw SVG path**
- [Link](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)

>**How to get SVG path value when registering the custom icon**
- [Link](https://css-tricks.com/using-svg/)

![image](https://cloud.githubusercontent.com/assets/18183560/16838300/726f8a68-4a03-11e6-8703-6d0e36a7f3e3.png)


### Mask Filter
- Load the image for using mask filter. (This image is called the "mask image")
- When applying mask filter on the canvas image, the canvas image's areas matching the mask image's black areas should be transparent.

![image](https://cloud.githubusercontent.com/assets/18183560/16837578/07444c46-49ff-11e6-99fc-2355a6777dc0.gif)


### Line Drawing
- Draw the straight line on the canvas.
- Change the color and width value of brush to draw line.

![image](https://cloud.githubusercontent.com/assets/18183560/16837621/4beed348-49ff-11e6-8276-8e0f7e9e85e6.gif)

### Shourtcut
- On the canvas
 * `ctrl + z` : undo
 * `ctrl + y` : redo
- Crop
 * `shift` : making the cropzone of 1:1 ratio

![image](https://cloud.githubusercontent.com/assets/18183560/16837645/73e7614e-49ff-11e6-9460-e596dd683724.gif)


## More
- Get started (Tutorial) : [https://github.com/nhn/tui.component.image-editor/wiki/Tutorial](https://github.com/nhn/tui.component.image-editor/wiki/Tutorial)
- API : [http://nhn.github.io/tui.image-editor/latest/](http://nhn.github.io/tui.image-editor/latest/)
- Sample : [http://nhn.github.io/tui.image-editor/latest/tutorial-example01-basic.html](http://nhn.github.io/tui.image-editor/latest/tutorial-example01-basic.html)

