'use strict';
var template = require('../template/editorSkeleton.hbs');

var consts = require('./consts');

var CanvasView = require('./view/canvas'),
    DetailView = require('./view/detail'),
    MenuView = require('./view/menu');

var ImageEditor = tui.util.defineClass({
    init: function(wrapper) {
        this.$wrapper = $(wrapper);
        this.views = null;

        this._setViews();
        this._render();
    },

    _setViews: function() {
        this.views = [
            new MenuView(this),
            new DetailView(this),
            new CanvasView(this)
        ];
    },

    _getViewWrapper: function(viewName) {
        var classSelector = '.' + consts.CLASSNAME_PREFIX + '-' + viewName;
        return this.$wrapper.find(classSelector);
    },

    _makeSkeletonHtml: function() {
        return template({
            classPrefix: consts.CLASSNAME_PREFIX,
            views: tui.util.map(this.views, function(view) {
                return {
                    viewName: view.getName()
                };
            })
        });
    },

    _render: function() {
        var skeletonHtml = this._makeSkeletonHtml();

        this.$wrapper.html(skeletonHtml);
        tui.util.forEach(this.views, function(view) {
            this._getViewWrapper(view.getName())
                .append(view.getElement());
        }, this);
    }
});

module.exports = ImageEditor;
