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
        className: consts.CLASSNAME_PREFIX + '-detail'
    },

    template: template
});

module.exports = Detail;
