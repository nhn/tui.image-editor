'use strict';
var View = require('../interface/view');
var Menu = require('./menu');
var Canvas = require('./canvas');
var SubMenu = require('./subMenu');
var mixer = require('../mixin/mixer');
var consts = require('../consts');
var mainTemplate = require('../../template/main.hbs');

var viewNames = consts.viewNames;

/**
 * MainView Class
 * @extends View
 * @mixes BranchView
 * @class
 * @param {ImageEditor} editor - ImageEditor
 * @param {jQuery} $wrapper - Wrapper jquery element
*/
var Main = tui.util.defineClass(View, /* @lends Main.prototype */{
    init: function(editor, $wrapper) {
        View.call(this, null, $wrapper);

        /**
         * Command invoker
         * @type {ImageEditor}
         */
        this.editor = editor;

        /**
         * Menu view
         * @type {View}
         */
        this.menu = null;

        /**
         * SubMenu view
         * @type {View}
         */
        this.subMenu = null;

        /**
         * Canvas view
         * @type {View}
         */
        this.canvas = null;

        this.render();
    },

    /**
     * View name
     * @type {string}
     */
    name: 'main',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: viewNames.MAIN,
        menu: viewNames.MENU,
        subMenu: viewNames.SUB_MENU,
        canvas: viewNames.CANVAS
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: mainTemplate,

    /**
     * Processing after render
     * It adds children
     */
    doAfterRender: function() {
        var prefix = '.' + consts.CLASSNAME_PREFIX + '-',
            menuClassName = prefix + viewNames.MENU,
            subMenuClassName = prefix + viewNames.SUB_MENU,
            canvasWrapperClassName = prefix + viewNames.CANVAS,
            $element = this.$element;

        this.menu = this.addChild(new Menu(this, $element.find(menuClassName)));
        this.subMenu = this.addChild(new SubMenu(this, $element.find(subMenuClassName)));
        this.canvas = this.addChild(new Canvas(this, $element.find(canvasWrapperClassName)));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    },

    /**
     * Post a command to broker
     * @override
     * @param {Command} command - Command
     */
    postCommand: function(command) {
        this.editor.invoke(command);
    }
});

mixer.mixin(Main, 'BranchView');
module.exports = Main;
