'use strict';
var View = require('../interface/view');
var subMenuTemplate = require('../../template/subMenu.hbs');

/**
 * SubMenu view
 * @class
 * @extends View
 * @param {Delegator} parent - Parent delegator
 * @param {jQuery} $wrapper - Wrapper jquery element
 */
var SubMenu = tui.util.defineClass(View, /* @lends Detail.prototype */{
    init: function(parent, $wrapper) {
        View.call(this, parent);

        /**
         * Wrapper jquery-element
         * @type {jQuery}
         */
        this.$wrapper = $wrapper;
    },

    /**
     * View name
     * @type {string}
     */
    name: 'SubMenu',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'SubMenu'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: subMenuTemplate,

    /**
     * Change state
     *  It changes the template and re-render the elements
     * @param {string} state - SubMenu state
     */
    change: function(state) {
        if (state === 'crop') {
            this.templateContext.hasApplyCancel = true;
        }
        this.render(this.$wrapper);
    }
});

module.exports = SubMenu;
