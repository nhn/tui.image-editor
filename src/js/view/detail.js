'use strict';
var View = require('./../interface/view'),
    consts = require('./../consts');
var template = require('./../../template/detail.hbs');

var Detail = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);
        this.render();
    },

    name: 'detail',

    templateContext: {
        classNames: {
            container: consts.CLASSNAME_PREFIX + '-detail',
            imageInfo: consts.CLASSNAME_PREFIX + '-image-info',
            setting: consts.CLASSNAME_PREFIX + '-setting'
        }
    },

    template: template
});

module.exports = Detail;
