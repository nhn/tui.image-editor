'use strict';
var Main = require('./view/main');

var ViewManager = tui.util.defineClass({
    init: function(wrapper, broker) {
        this.rootView = new Main(broker);

        $(wrapper).append(this.rootView.getElement());
    },

    getRootView: function() {
        return this.rootView;
    }
});

module.exports = ViewManager;
