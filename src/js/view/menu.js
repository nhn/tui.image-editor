'use strict';
var View = require('../interface/view'),
    btnFactory = require('../factory/button'),
    UploadForm = require('./uploadForm'),
    mixer = require('../mixin/mixer');

var template = require('../../template/container.hbs');

/**
 * Menu view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Menu = tui.util.defineClass(View, /* @lends Menu.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'menu',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'menu'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * It adds buttons
     */
    doAfterRender: function() {
        this.addChild(new UploadForm(this, {
            url: {
                send: 'http://10.77.29.126:4000/upload',
                remove: 'http://10.77.29.126:4000/remove'
            },
            formTarget: 'hiddenFrame',
            listInfo: {
                list: $(),
                count: $(),
                size: $()
            }
        }));

        this.addChild(btnFactory.create(this, {
            name: 'Save',
            templateContext: {
                text: '저장'
            }
        }));
        this.addChild(btnFactory.create(this, {
            name: 'unknown',
            templateContext: {
                text: '그냥 버튼'
            }
        }));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

mixer.mixin(Menu, 'BranchView');
module.exports = Menu;
