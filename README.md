# ![Toast UI ImageEditor](https://user-images.githubusercontent.com/35218826/40895380-0b9f4cd6-67ea-11e8-982f-18121daa3a04.png)
> Now edit the image in your web browser. Image editor using canvas.


[![github version](https://img.shields.io/github/release/nhnent/tui.image-editor.svg)](https://github.com/nhnent/tui.image-editor/releases/latest) [![npm version](https://img.shields.io/npm/v/tui-image-editor.svg)](https://www.npmjs.com/package/tui-image-editor) [![bower version](https://img.shields.io/bower/v/tui.image-editor.svg)](https://github.com/nhnent/tui.image-editor/releases/latest) [![license](https://img.shields.io/github/license/nhnent/tui.image-editor.svg)](https://github.com/nhnent/tui.image-editor/blob/master/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.image-editor/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) [![code with hearth by NHN ent.](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Ent.-brightgreen.svg)](https://github.com/nhnent)

![5b14dd4471e10255073796](https://user-images.githubusercontent.com/35218826/40901811-c682fdb4-680c-11e8-8569-01609816240e.gif)

## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [Easy to apply the size and design you want](#-easy-to-apply-the-size-and-design-you-want)
    * [Every where](#every-where)
    * [Easy customization and basic theme support](#easy-customization-and-basic-theme-support)
* [Stick to the basic](#-stick-to-the-basic)
    * [Photo manipulation](#photo-manipulation)
    * [Integration function](#integration-function)
    * [Select only the desired function](#select-only-the-desired-function)
* [Features](#-features)
* [Install](#-install)
  * [Via Package Manager](#via-package-manager)
  * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
  * [Download Source Files](#download-source-files)
* [Usage](#-usage)
  * [HTML](#html)
  * [JavaScript](#javascript)
* [Development](#develop)
  * [Setup](#setup)
  * [Run webpack-dev-server](#run-webpack-dev-server)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [Dependency](#-dependency)
* [Test Environment](#-test-environment)
* [TOAST UI Family](#-toast-ui-family)
* [License](#-license)



## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 9+ | Yes | Yes | Yes |


## 🙆 Easy to apply the size and design you want

### Every where
  - Widely supported in browsers including IE9, which is the minimum requirement to support canvas.
  - Option allows you to use the editor features on your web pages at least over **550 * 450 sizes**
    
    ![2018-06-04 5 35 25](https://user-images.githubusercontent.com/35218826/40907369-9221f482-681e-11e8-801c-78d6f2e246a8.png)


### Easy customization and basic theme support
  - Has a basic white and black theme, and you can modify the theme file to customize it.
  - Even the `includeUI` option can be removed, and the UI itself can be implemented at your own discretion.

| black - top | black - bottom |  white - left | white - right |
| --- | --- | --- | --- | 
| ![2018-06-05 1 41 13](https://user-images.githubusercontent.com/35218826/40930753-8b72502e-6863-11e8-9cff-1719aee9aef0.png) | ![2018-06-05 1 40 24](https://user-images.githubusercontent.com/35218826/40930755-8bcee136-6863-11e8-8e28-0a6722d38c59.png) | ![2018-06-05 1 41 48](https://user-images.githubusercontent.com/35218826/40930756-8bfe0b50-6863-11e8-8682-bab11a0a2289.png) | ![2018-06-05 1 42 27](https://user-images.githubusercontent.com/35218826/40930754-8ba1dba0-6863-11e8-9439-cc059241b675.png) |


## 💪 Stick to the basic
  ### Photo manipulation
    - Crop, Filp, Rotation, Drawing, Shape, Icon, Text, Mask Filter, Image Filter
  ### Integration function
    - Download, Image Load, Undo, Redo, Reset, Delete Object 

| Crop | Flip | rotation | Drawing | Shpae |
| --- | --- | --- | --- | --- |
| ![2018-06-04 4 33 16](https://user-images.githubusercontent.com/35218826/40904241-0c28ec68-6815-11e8-8296-89a1716b22d8.png) | ![2018-06-04 4 40 06](https://user-images.githubusercontent.com/35218826/40904521-f7c6e184-6815-11e8-8ba3-c94664da69a2.png) | ![2018-06-04 4 43 02](https://user-images.githubusercontent.com/35218826/40904664-656aa748-6816-11e8-9943-6607c209deac.png) | ![2018-06-04 4 47 40](https://user-images.githubusercontent.com/35218826/40904850-0f26ebde-6817-11e8-97d0-d3a7e4bc02da.png) | ![2018-06-04 4 51 45](https://user-images.githubusercontent.com/35218826/40905037-a026296a-6817-11e8-9d28-9e1ca7bc58c4.png) | 

| Icon | Text | Mask | Filter |
| --- | --- | --- | --- |
| ![2018-06-05 2 06 29](https://user-images.githubusercontent.com/35218826/40931205-2d255db6-6865-11e8-98af-ad34c5a01da1.png) | ![2018-06-05 2 14 36](https://user-images.githubusercontent.com/35218826/40931484-46253948-6866-11e8-8a04-fa042920e457.png) | ![2018-06-05 2 20 46](https://user-images.githubusercontent.com/35218826/40931743-21eeb346-6867-11e8-8e31-a59f7a43482b.png) | ![2018-06-05 2 27 10](https://user-images.githubusercontent.com/35218826/40932016-093ed1f4-6868-11e8-8224-a048c3ee8a09.png) |  |

### Select only the desired function

```javascripot
var imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
     includeUI: {
         menu: ['shape', 'crop']
         ...
     },
 ...
```



## 🎨 Features
* Load image to canvas
* Undo/Redo (With shortcut)
* Crop
* Flip
* Rotation
* Free Drawing
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

The TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
Install by using the commands provided by each package manager.
When using npm, be sure [Node.js](https://nodejs.org) is installed in the environment.


#### npm

```sh
$ npm install --save tui-image-editor # Latest version
$ npm install --save tui-image-editor@<version> # Specific version
```

#### bower

```sh
$ bower install tui-image-editor # Latest version
$ bower install tui-image-editor#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)
TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<script src="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
tui-image-editor/
├─ latest/
│  ├─ tui-image-editor.js
│  └─ tui-image-editor.min.js
├─ v3.1.0/
│  ├─ ...
```

### Download Source Files
* [Download bundle files from `dist` folder](https://github.com/nhnent/tui.image-editor/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.image-editor/releases)



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

#### javascript

Add dependencies & initialize ImageEditor class with given element to make an image editor.

```javascript
var ImageEditor = require('tui-image-editor');
var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
     includeUI: {
         loadImage: {
             path: 'img/sampleImage.jpg',
             name: 'SampleImage'
         },
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

or a style that does not contain ui.

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

See [details](https://nhnent.github.io/tui.image-editor/latest) for additional informations.

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
* **Tutorial** : [https://github.com/nhnent/tui.image-editor/wiki/Tutorial](https://github.com/nhnent/tui.image-editor/wiki/Tutorial)
* **Example** : [http://nhnent.github.io/tui.image-editor/latest/tutorial-example01-basic.html](http://nhnent.github.io/tui.image-editor/latest/tutorial-example03-theme.html)
* **API** : [http://nhnent.github.io/tui.image-editor/latest/](http://nhnent.github.io/tui.image-editor/latest/)

## 💬 Contributing
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributing guideline](CONTRIBUTING.md)
* [Issue guideline](ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.editor/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🔩 Dependency
* [fabric.js](https://github.com/kangax/fabric.js/releases/tag/v1.6.7) >=1.6.7
* [tui.code-snippet](https://github.com/nhnent/tui.code-snippet/releases/tag/v1.2.5) >=1.3.0
* [tui.color-picker](https://github.com/nhnent/tui.color-picker/releases/tag/v2.2.0) >=2.2.0

## 🎥 Test Environment
### PC
   * IE9~11
   * Edge
   * Chrome
   * Firefox
   * Safari
### Mobile
   * iOS 9.3.x
   * Android 4.4.x

## 🍞 TOAST UI Family
* [TOAST UI Editor](https://github.com/nhnent/tui.editor)
* [TOAST UI Grid](https://github.com/nhnent/tui.grid)
* [TOAST UI Chart](https://github.com/nhnent/tui.chart)
* [TOAST UI Components](https://github.com/nhnent)

## 📜 License
[MIT LICENSE](https://github.com/nhnent/tui.image-editor/blob/master/LICENSE)
