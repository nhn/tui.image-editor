# TOAST UI Image Editor for React

> This is a React component wrapping [TOAST UI Image Editor](https://github.com/nhn/tui.image-editor).

[![npm version](https://img.shields.io/npm/v/@toast-ui/react-image-editor.svg)](https://www.npmjs.com/package/@toast-ui/react-image-editor)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
- [Install](#-install)
  - [Using npm](#using-npm)
- [Usage](#-usage)
  - [Import](#Import)
  - [Props](#props)
  - [Instance Methods](#Instance-Methods)
  - [Getting the root element](#Getting-the-root-element)
  - [Events](#events)

## Collect statistics on the use of open source

React Wrapper of TOAST UI Image Editor applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Image Editor is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the `usageStatistics` props like the example below.

```js
<ImageEditor usageStatistics={false} />
```

Or, include `tui-code-snippet.js` (**v1.4.0** or **later**) and then immediately write the options as follows:

```js
tui.usageStatistics = false;
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/react-image-editor
```

## 📊 Usage

### Import

You can use Toast UI Image Editor for React as a ECMAScript module or a CommonJS module. As this module does not contain CSS files, you should import `tui-image-editor.css` from `tui-image-editor/dist` manually.

- Using ECMAScript module

```js
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
```

- Using CommonJS module

```js
require('tui-image-editor/dist/tui-image-editor.css');
const ImageEditor = require('@toast-ui/react-image-editor');
```

### Props

[All the options of the TOAST UI Image Editor](http://nhn.github.io/tui.image-editor/latest/ImageEditor) are supported in the form of props.

```js
const myTheme = {
  // Theme object to extends default dark theme.
};

const MyComponent = () => (
  <ImageEditor
    includeUI={{
      loadImage: {
        path: 'img/sampleImage.jpg',
        name: 'SampleImage',
      },
      theme: myTheme,
      menu: ['shape', 'filter'],
      initMenu: 'filter',
      uiSize: {
        width: '1000px',
        height: '700px',
      },
      menuBarPosition: 'bottom',
    }}
    cssMaxHeight={500}
    cssMaxWidth={700}
    selectionStyle={{
      cornerSize: 20,
      rotatingPointOffset: 70,
    }}
    usageStatistics={true}
  />
);
```

#### Theme

Importing `black/white-theme.js` file is not working directly import yet. You want to use a white theme, please write own theme object by copy and paste.

### Instance Methods

For using [instance methods of TOAST UI Image Editor](https://nhn.github.io/tui.date-picker/latest/DatePicker#createCalendar), first thing to do is creating Refs of wrapper component using [`createRef()`](https://reactjs.org/docs/refs-and-the-dom#creating-refs). But the wrapper component does not provide a way to call instance methods of TOAST UI Image Editor directly. Instead, you can call `getInstance()` method of the wrapper component to get the instance, and call the methods on it.

```js
const imageEditorOptions = {
  // sort of option properties.
};

class MyComponent extends React.Component {
  editorRef = React.createRef();

  handleClickButton = () => {
    const editorInstance = this.editorRef.current.getInstance();

    editorInstance.flipX();
  };

  render() {
    return (
      <>
        <ImageEditor ref={this.editorRef} {...imageEditorOptions} />
        <button onClick={this.handleClickButton}>Flip image by X Axis!</button>
      </>
    );
  }
}
```

### Getting the root element

An instance of the wrapper component also provides a handy method for getting the root element. If you want to manipulate the root element directly, you can call `getRootElement` to get the element.

```js
class MyComponent extends React.Component {
  editorRef = React.createRef();

  handleClickButton = () => {
    this.editorRef.current.getRootElement().classList.add('image-editor-root');
  };

  render() {
    return (
      <>
        <ImageEditor ref={this.editorRef} {...imageEditorOptions} />
        <button onClick={this.handleClickButton}>Click!</button>
      </>
    );
  }
}
```

### Events

[All the events of TOAST UI Image Editor](https://nhn.github.io/tui.image-editor/latest/ImageEditor#event:addText) are supported in the form of `on[EventName]` props. The first letter of each event name should be capitalized. For example, for using `mousedown` event you can use `onMousedown` prop like the example below.

```js
class MyComponent extends React.Component {
  handleMousedown = () => {
    console.log('Mouse button is downed!');
  };

  render() {
    return <ImageEditor onMousedown={this.handleMousedown} />;
  }
}
```
