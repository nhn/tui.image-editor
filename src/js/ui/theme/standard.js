/**
 * @fileoverview The standard theme
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 */

/**
 * Full configuration for theme.<br>
 * @typedef {object} themeConfig
 * @property {string} common.bi.image - Brand icon image
 * @property {string} common.bisize.width - Icon image width
 * @property {string} common.bisize.height - Icon Image Height
 * @property {string} common.backgroundImage - Background image
 * @property {string} common.backgroundColor - Background color
 * @property {string} common.border - Full area border style
 * @property {string} header.backgroundImage - header area background
 * @property {string} header.backgroundColor - header area background color
 * @property {string} header.border - header area border style
 * @property {string} loadButton.backgroundColor - load button background color
 * @property {string} loadButton.border - load button border style
 * @property {string} loadButton.color - load button foreground color
 * @property {string} loadButton.fontFamily - load button font type
 * @property {string} loadButton.fontSize - load button font size
 * @property {string} downloadButton.backgroundColor - download button background color
 * @property {string} downloadButton.border - download button border style
 * @property {string} downloadButton.color - download button foreground color
 * @property {string} downloadButton.fontFamily - download button font type
 * @property {string} downloadButton.fontSize - download button font size
 * @property {string} menu.normalIcon.path - Menu default icon svg bundle file path
 * @property {string} menu.normalIcon.name - Menu default icon svg bundle name
 * @property {string} menu.activeIcon.path - Menu active icon svg bundle file path
 * @property {string} menu.activeIcon.name - Menu active icon svg bundle name
 * @property {string} menu.iconSize.width - Menu icon Size Width
 * @property {string} menu.iconSize.height - Menu Icon Size Height
 * @property {string} submenu.backgroundColor - Sub-menu area background color
 * @property {string} submenu.partition.color - Submenu partition line color
 * @property {string} submenu.normalIcon.path - Submenu default icon svg bundle file path
 * @property {string} submenu.normalIcon.name - Submenu default icon svg bundle name
 * @property {string} submenu.activeIcon.path - Submenu active icon svg bundle file path
 * @property {string} submenu.activeIcon.name - Submenu active icon svg bundle name
 * @property {string} submenu.iconSize.width - Submenu icon Size Width
 * @property {string} submenu.iconSize.height - Submenu Icon Size Height
 * @property {string} submenu.normalLabel.color - Submenu default label color
 * @property {string} submenu.normalLabel.fontWeight - Sub Menu Default Label Font Thickness
 * @property {string} submenu.activeLabel.color - Submenu active label color
 * @property {string} submenu.activeLabel.fontWeight - Submenu active label Font thickness
 * @property {string} checkbox.border - Checkbox border style
 * @property {string} checkbox.backgroundColor - Checkbox background color
 * @property {string} range.pointer.color - range control pointer color
 * @property {string} range.bar.color - range control bar color
 * @property {string} range.subbar.color - range control subbar color
 * @property {string} range.value.color - range number box font color
 * @property {string} range.value.fontWeight - range number box font thickness
 * @property {string} range.value.fontSize - range number box font size
 * @property {string} range.value.border - range number box border style
 * @property {string} range.value.backgroundColor - range number box background color
 * @property {string} range.title.color - range title font color
 * @property {string} range.title.fontWeight - range title font weight
 * @property {string} colorpicker.button.border - colorpicker button border style
 * @property {string} colorpicker.title.color - colorpicker button title font color
 * @example
 // default keys and styles
 var customTheme = {
    'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
    'common.bisize.width': '251px',
    'common.bisize.height': '21px',
    'common.backgroundImage': 'none',
    'common.backgroundColor': '#1e1e1e',
    'common.border': '0px',

    // header
    'header.backgroundImage': 'none',
    'header.backgroundColor': 'transparent',
    'header.border': '0px',

    // load button
    'loadButton.backgroundColor': '#fff',
    'loadButton.border': '1px solid #ddd',
    'loadButton.color': '#222',
    'loadButton.fontFamily': 'NotoSans, sans-serif',
    'loadButton.fontSize': '12px',

    // download button
    'downloadButton.backgroundColor': '#fdba3b',
    'downloadButton.border': '1px solid #fdba3b',
    'downloadButton.color': '#fff',
    'downloadButton.fontFamily': 'NotoSans, sans-serif',
    'downloadButton.fontSize': '12px',

    // main icons
    'menu.normalIcon.path': '../dist/svg/icon-d.svg',
    'menu.normalIcon.name': 'icon-d',
    'menu.activeIcon.path': '../dist/svg/icon-b.svg',
    'menu.activeIcon.name': 'icon-b',
    'menu.disabledIcon.path': '../dist/svg/icon-a.svg',
    'menu.disabledIcon.name': 'icon-a',
    'menu.hoverIcon.path': '../dist/svg/icon-c.svg',
    'menu.hoverIcon.name': 'icon-c',
    'menu.iconSize.width': '24px',
    'menu.iconSize.height': '24px',

    // submenu primary color
    'submenu.backgroundColor': '#1e1e1e',
    'submenu.partition.color': '#858585',

    // submenu icons
    'submenu.normalIcon.path': '../dist/svg/icon-a.svg',
    'submenu.normalIcon.name': 'icon-a',
    'submenu.activeIcon.path': '../dist/svg/icon-c.svg',
    'submenu.activeIcon.name': 'icon-c',
    'submenu.iconSize.width': '32px',
    'submenu.iconSize.height': '32px',

    // submenu labels
    'submenu.normalLabel.color': '#858585',
    'submenu.normalLabel.fontWeight': 'lighter',
    'submenu.activeLabel.color': '#fff',
    'submenu.activeLabel.fontWeight': 'lighter',

    // checkbox style
    'checkbox.border': '1px solid #ccc',
    'checkbox.backgroundColor': '#fff',

    // rango style
    'range.pointer.color': '#fff',
    'range.bar.color': '#666',
    'range.subbar.color': '#d1d1d1',

    'range.disabledPointer.color': '#414141',
    'range.disabledBar.color': '#282828',
    'range.disabledSubbar.color': '#414141',

    'range.value.color': '#fff',
    'range.value.fontWeight': 'lighter',
    'range.value.fontSize': '11px',
    'range.value.border': '1px solid #353535',
    'range.value.backgroundColor': '#151515',
    'range.title.color': '#fff',
    'range.title.fontWeight': 'lighter',

    // colorpicker style
    'colorpicker.button.border': '1px solid #1e1e1e',
    'colorpicker.title.color': '#fff'
};
 */
export default {
    'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
    'common.bisize.width': '251px',
    'common.bisize.height': '21px',
    'common.backgroundImage': 'none',
    'common.backgroundColor': '#1e1e1e',
    'common.border': '0px',

    // header
    'header.backgroundImage': 'none',
    'header.backgroundColor': 'transparent',
    'header.border': '0px',

    // load button
    'loadButton.backgroundColor': '#fff',
    'loadButton.border': '1px solid #ddd',
    'loadButton.color': '#222',
    'loadButton.fontFamily': '\'Noto Sans\', sans-serif',
    'loadButton.fontSize': '12px',

    // download button
    'downloadButton.backgroundColor': '#fdba3b',
    'downloadButton.border': '1px solid #fdba3b',
    'downloadButton.color': '#fff',
    'downloadButton.fontFamily': '\'Noto Sans\', sans-serif',
    'downloadButton.fontSize': '12px',

    // main icons
    'menu.normalIcon.path': 'icon-d.svg',
    'menu.normalIcon.name': 'icon-d',
    'menu.activeIcon.path': 'icon-b.svg',
    'menu.activeIcon.name': 'icon-b',
    'menu.disabledIcon.path': 'icon-a.svg',
    'menu.disabledIcon.name': 'icon-a',
    'menu.hoverIcon.path': 'icon-c.svg',
    'menu.hoverIcon.name': 'icon-c',
    'menu.iconSize.width': '24px',
    'menu.iconSize.height': '24px',

    // submenu primary color
    'submenu.backgroundColor': '#1e1e1e',
    'submenu.partition.color': '#3c3c3c',

    // submenu icons
    'submenu.normalIcon.path': 'icon-d.svg',
    'submenu.normalIcon.name': 'icon-d',
    'submenu.activeIcon.path': 'icon-c.svg',
    'submenu.activeIcon.name': 'icon-c',
    'submenu.iconSize.width': '32px',
    'submenu.iconSize.height': '32px',

    // submenu labels
    'submenu.normalLabel.color': '#8a8a8a',
    'submenu.normalLabel.fontWeight': 'lighter',
    'submenu.activeLabel.color': '#fff',
    'submenu.activeLabel.fontWeight': 'lighter',

    // checkbox style
    'checkbox.border': '0px',
    'checkbox.backgroundColor': '#fff',

    // range style
    'range.pointer.color': '#fff',
    'range.bar.color': '#666',
    'range.subbar.color': '#d1d1d1',

    'range.disabledPointer.color': '#414141',
    'range.disabledBar.color': '#282828',
    'range.disabledSubbar.color': '#414141',

    'range.value.color': '#fff',
    'range.value.fontWeight': 'lighter',
    'range.value.fontSize': '11px',
    'range.value.border': '1px solid #353535',
    'range.value.backgroundColor': '#151515',
    'range.title.color': '#fff',
    'range.title.fontWeight': 'lighter',

    // colorpicker style
    'colorpicker.button.border': '1px solid #1e1e1e',
    'colorpicker.title.color': '#fff'
};
