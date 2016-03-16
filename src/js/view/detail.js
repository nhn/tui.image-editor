'use strict';
var View = require('./../interface/view'),
    template = require('./../../template/detail.hbs');

var Detail = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);

        this.render();
    },

    name: 'detail',

    templateContext: {
        className: 'tui-image-editor-detail'
    },

    template: template
});

module.exports = Detail;
