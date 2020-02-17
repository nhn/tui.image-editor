# ![Toast UI ImageEditor](https://user-images.githubusercontent.com/35218826/40895380-0b9f4cd6-67ea-11e8-982f-18121daa3a04.png)
> Full featured image editor using HTML5 Canvas. It's easy to use and provides powerful filters.


[![github version](https://img.shields.io/github/release/nhn/tui.image-editor.svg)](https://github.com/nhn/tui.image-editor/releases/latest) [![npm version](https://img.shields.io/npm/v/tui-image-editor.svg)](https://www.npmjs.com/package/tui-image-editor) [![bower version](https://img.shields.io/bower/v/tui.image-editor.svg)](https://github.com/nhn/tui.image-editor/releases/latest) [![license](https://img.shields.io/github/license/nhn/tui.image-editor.svg)](https://github.com/nhn/tui.image-editor/blob/master/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhn/tui.image-editor/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)[![code with hearth by NHN](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhn)

## Wrappers
- [toast-ui.vue-image-editor](https://github.com/nhn/toast-ui.vue-image-editor): Vue wrapper component is powered by [NHN](https://github.com/nhn).
- [toast-ui.react-image-editor](https://github.com/nhn/toast-ui.react-image-editor): React wrapper component is powered by [NHN](https://github.com/nhn).

![6 -20-2018 17-45-54](https://user-images.githubusercontent.com/35218826/41647896-7b218ae0-74b2-11e8-90db-d7805cc23e8c.gif)

## 🚩 Table of Contents
* [Collect statistics on the use of open source](#Collect-statistics-on-the-use-of-open-source)
* [Browser Support](#-browser-support)
* [Has full features that stick to the basic.](#-has-full-features-that-stick-to-the-basic)
    * [Photo manipulation](#photo-manipulation)
    * [Integration function](#integration-function)
    * [Powerful filter function](#powerful-filter-function)
    * [Select only the desired function](#select-only-the-desired-function)
* [Easy to apply the size and design you want](#-easy-to-apply-the-size-and-design-you-want)
    * [Can be used everywhere](#can-be-used-everywhere)
    * [Nice default & Fully customizable Themes](#nice-default--fully-customizable-themes)
* [Features](#-features)
* [Install](#-install)
  * [Via Package Manager](#via-package-manager)
  * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
  * [Download Source Files](#download-source-files)
* [Usage](#-usage)
  * [HTML](#html)
  * [JavaScript](#javascript)
* [Development](#-development)
  * [Setup](#setup)
  * [Run webpack-dev-server](#run-webpack-dev-server)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [Dependency](#-dependency)
* [TOAST UI Family](#-toast-ui-family)
* [Used By](#-used-by)
* [License](#-license)


## Collect statistics on the use of open source

TOAST UI ImageEditor applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI ImageEditor is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when creating the instance.

```js
var options = {
    //...
    usageStatistics: false
}

var imageEditor = new tui.ImageEditor('#tui-image-editor-container', options);
```

Or, include [`tui-code-snippet`](https://github.com/nhn/tui.code-snippet)(**v1.4.0** or **later**) and then immediately write the options as follows:

```js
tui.usageStatistics = false;
```


## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 9+ | Yes | Yes | Yes |


## 💪 Has full features that stick to the basic.
### Photo manipulation
- Crop, Flip, Rotation, Drawing, Shape, Icon, Text, Mask Filter, Image Filter
    
### Integration function    
- Download, Image Load, Undo, Redo, Reset, Delete Object(Shape, Line, Mask Image...)

<table>
        <tr>
            <th width="20%">Crop</th>
            <th width="20%">Flip</th>
            <th width="20%">Rotation</th>
            <th width="20%">Drawing</th>
            <th width="20%">Shape</th>
        </tr>
        <tr>
            <td><img src="https://user-images.githubusercontent.com/35218826/40904241-0c28ec68-6815-11e8-8296-89a1716b22d8.png" alt="2018-06-04 4 33 16" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40904521-f7c6e184-6815-11e8-8ba3-c94664da69a2.png" alt="2018-06-04 4 40 06" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40904664-656aa748-6816-11e8-9943-6607c209deac.png" alt="2018-06-04 4 43 02" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40904850-0f26ebde-6817-11e8-97d0-d3a7e4bc02da.png" alt="2018-06-04 4 47 40" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40905037-a026296a-6817-11e8-9d28-9e1ca7bc58c4.png" alt="2018-06-04 4 51 45" style="max-width:100%;"></td>
        </tr>
        <tr>
            <th>Icon</th>
            <th>Text</th>
            <th>Mask</th>
            <th>Filter</th>
            <th></th>
        </tr>
        <tr>
            <td><img src="https://user-images.githubusercontent.com/35218826/40931205-2d255db6-6865-11e8-98af-ad34c5a01da1.png" alt="2018-06-05 2 06 29" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40931484-46253948-6866-11e8-8a04-fa042920e457.png" alt="2018-06-05 2 14 36" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40931743-21eeb346-6867-11e8-8e31-a59f7a43482b.png" alt="2018-06-05 2 20 46" style="max-width:100%;"></td>
            <td><img src="https://user-images.githubusercontent.com/35218826/40932016-093ed1f4-6868-11e8-8224-a048c3ee8a09.png" alt="2018-06-05 2 27 10" style="max-width:100%;"></td>
            <td></td>
        </tr>
    </tbody>
</table>

### Powerful filter function
- Grayscale, Invert, Sepia, Blur Sharpen, Emboss, RemoveWhite, Brightness, Noise, Pixelate, ColorFilter, Tint, Multiply, Blend

| Grayscale | Noise | Emboss | Pixelate | 
| --- | --- | --- | --- | 
| ![grayscale](https://user-images.githubusercontent.com/35218826/41753470-930fb7b0-7608-11e8-9966-1c890e73d131.png) | ![noise](https://user-images.githubusercontent.com/35218826/41753458-9013bc82-7608-11e8-91d9-74dcc3ffce31.png) | ![emboss](https://user-images.githubusercontent.com/35218826/41753460-906c018a-7608-11e8-8861-c135c0117cea.png) | ![pixelate](https://user-images.githubusercontent.com/35218826/41753461-90a614a6-7608-11e8-97a7-0d3b7bb4aec4.png) |


| Sepia | Sepia2 | Blend-righten | Blend-diff | Invert | 
| --- | --- | --- | --- | --- | 
| ![sepia](https://user-images.githubusercontent.com/35218826/41753464-91acc41c-7608-11e8-8652-572f935ea704.png) | ![sepia2](https://user-images.githubusercontent.com/35218826/41753640-91e57248-7609-11e8-8960-145e0de57e39.png) | ![blend-righten](https://user-images.githubusercontent.com/35218826/41753462-9114bc3a-7608-11e8-9ab4-16ce20a34321.png) | ![blend-diff](https://user-images.githubusercontent.com/35218826/41753465-91e4baf2-7608-11e8-9b8f-79e1b956d387.png) | ![invert](https://user-images.githubusercontent.com/35218826/41753466-9260b224-7608-11e8-848a-73231a02ae3a.png) |

| Multifly | Tint | Brightness | Remove-white | Sharpen |
| --- | --- | --- | --- | --- | 
| ![multifly](https://user-images.githubusercontent.com/35218826/41753467-92baae28-7608-11e8-80d2-187a310213f5.png) | ![tint](https://user-images.githubusercontent.com/35218826/41753468-92e6391c-7608-11e8-8977-651366ebe693.png) | ![brightness](https://user-images.githubusercontent.com/35218826/41753457-8fb3d3c6-7608-11e8-9e1d-10c6e4aeba68.png) | ![remove-white](https://user-images.githubusercontent.com/35218826/41753463-917feeb0-7608-11e8-862d-eb3af84e120a.png) | ![sharpen](https://user-images.githubusercontent.com/35218826/41753639-91b8470a-7609-11e8-8d13-48ac3232365b.png) |




### Select only the desired function

```javascripot
var imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
     includeUI: {
         menu: ['shape', 'crop']
         ...
     },
 ...
```


## 🙆 Easy to apply the size and design you want

### Can be used everywhere.
  - Widely supported in browsers including IE9, which is the minimum requirement to support canvas.
  - Option to support various display sizes.
    (allows you to use the editor features on your web pages at least over **550 * 450 sizes**)
    
    ![2018-06-04 5 35 25](https://user-images.githubusercontent.com/35218826/40907369-9221f482-681e-11e8-801c-78d6f2e246a8.png)


### Nice default & Fully customizable Themes
  - Has a white and black theme, and you can modify the theme file to customize it.
  - Has an API so that you can create your own instead of the built-in.

| black - top | black - bottom |  white - left | white - right |
| --- | --- | --- | --- | 
| ![2018-06-05 1 41 13](https://user-images.githubusercontent.com/35218826/40930753-8b72502e-6863-11e8-9cff-1719aee9aef0.png) | ![2018-06-05 1 40 24](https://user-images.githubusercontent.com/35218826/40930755-8bcee136-6863-11e8-8e28-0a6722d38c59.png) | ![2018-06-05 1 41 48](https://user-images.githubusercontent.com/35218826/40930756-8bfe0b50-6863-11e8-8682-bab11a0a2289.png) | ![2018-06-05 1 42 27](https://user-images.githubusercontent.com/35218826/40930754-8ba1dba0-6863-11e8-9439-cc059241b675.png) |




## 🎨 Features
* Load image to canvas
* Undo/Redo (With shortcut)
* Crop
* Flip
* Rotation
* Free drawing
* Line drawing
* Shape
* Icon
* Text
* Mask Filter
* Image Filter

## 💾 Install

The TOAST UI products can be installed by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

You can find TOAST UI producs via [npm](https://www.npmjs.com/) and [bower](https://bower.io/) package managers.
Install by using the commands provided by each package manager.
When using npm, be sure [Node.js](https://nodejs.org) is installed in the environment.


#### npm

#### 1. ImageEditor installation
```sh
$ npm install --save tui-image-editor # Latest version
$ npm install --save tui-image-editor@<version> # Specific version
```

##### 2. If the installation of the `fabric.js` dependency module does not go smoothly

To solve the problem, you need to refer to [Some Steps](https://github.com/fabricjs/fabric.js#install-with-npm) to solve the problem.

#### bower

```sh
$ bower install tui-image-editor # Latest version
$ bower install tui-image-editor#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)
TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.css">
<script src="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the URL.

The CDN directory has the following structure.

```
tui-image-editor/
├─ latest/
│  ├─ tui-image-editor.js
│  ├─ tui-image-editor.min.js
│  └─ tui-image-editor.css
├─ v3.1.0/
│  ├─ ...
```

### Download Source Files
* [Download bundle files from `dist` folder](https://github.com/nhn/tui.image-editor/tree/production/dist)
* [Download all sources for each version](https://github.com/nhn/tui.image-editor/releases)



## 🔨 Usage

### HTML

Add the container element where TOAST UI ImageEditor will be created.

``` html
<body>
...
<div id="tui-image-editor"></div>
...
</body>
```

### javascript

Add dependencies & initialize ImageEditor class with given element to make an image editor.

```javascript
var ImageEditor = require('tui-image-editor');
var FileSaver = require('file-saver'); //to download edited image to local. Use after npm install file-saver
var blackTheme = require('./js/theme/black-theme.js');
var locale_ru_RU = { // override default English locale to your custom
    'Crop': 'Обзрезать',
    'Delete-all': 'Удалить всё'
    // etc...
};
var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
     includeUI: {
         loadImage: {
             path: 'img/sampleImage.jpg',
             name: 'SampleImage'
         },
         locale: locale_ru_RU,
         theme: blackTheme, // or whiteTheme
         initMenu: 'filter',
         menuBarPosition: 'bottom'
     },
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

Or ~ UI

```javascript
var ImageEditor = require('tui-image-editor');
var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

### TypeScript
If you using TypeScript, You must `import module = require('module')` on importing.
[`export =` and `import = require()`](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require)

```typescript
import ImageEditor = require('tui-image-editor');
var FileSaver = require('file-saver'); //to download edited image to local. Use after npm install file-saver

const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

See [details](https://nhn.github.io/tui.image-editor/latest) for additional informations.

## 🔧 Development

The TOAST UI products are open-source.
After fixing issues, create a pull request(PR).
Run npm scripts and develop with the following process.

### Setup

Fork `master` branch into your personal repository.
Clone to local computer. 
Install node modules.
Before starting development, check for any errors.

```sh
$ git clone https://github.com/{username}/tui.image-editor.git
$ cd tui.image-editor
$ npm install
$ npm run test
```

### Run webpack-dev-server

```sh
$ npm run serve
```

## 📙 Documents
* **Tutorial** : [https://github.com/nhn/tui.image-editor/tree/master/docs](https://github.com/nhn/tui.image-editor/tree/master/docs)
* **Example** : [http://nhn.github.io/tui.image-editor/latest/tutorial-example01-includeUi](http://nhn.github.io/tui.image-editor/latest/tutorial-example01-includeUi)
* **API** : [http://nhn.github.io/tui.image-editor/latest](http://nhn.github.io/tui.image-editor/latest/index)

## 💬 Contributing
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributing guideline](CONTRIBUTING.md)
* [Issue guideline](ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhn/tui.image-editor/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🔩 Dependency
* [fabric.js](https://github.com/fabricjs/fabric.js/releases) =3.6.0
* [tui.code-snippet](https://github.com/nhn/tui.code-snippet/releases/tag/v1.3.0) >=1.3.0
* [tui.color-picker](https://github.com/nhn/tui.color-picker/releases/tag/v2.2.0) >=2.2.0


## 🍞 TOAST UI Family
* [TOAST UI Editor](https://github.com/nhn/tui.editor)
* [TOAST UI Grid](https://github.com/nhn/tui.grid)
* [TOAST UI Chart](https://github.com/nhn/tui.chart)
* [TOAST UI Calendar](https://github.com/nhn/tui.calendar)
* [TOAST UI Components](https://github.com/nhn)

## 🚀 Used By
* [TOAST Dooray! - Collaboration Service (Project, Messenger, Mail, Calendar, Drive, Wiki, Contacts)](https://dooray.com/home/)
* [Catalyst](https://catalystapp.co/)

## 📜 License
[MIT LICENSE](https://github.com/nhn/tui.image-editor/blob/master/LICENSE)
