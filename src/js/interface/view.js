'use strict';
var consts = require('./../consts');

var View = tui.util.defineClass({
    init: function(parent) {
        /**
         *
         * @type {null}
         */
        this.$element = null;

        /**
         *
         */
        this._parentView = parent;
    },

    getElement: function() {
        var $element = this.$element;

        if (!$element) {
            throw new Error(consts.messages.NO_ELEMENT);
        }
        return $element;
    },

    getName: function() {
        var name = this.name;

        if (!name) {
            throw new Error(consts.messages.NO_VIEW_NAME);
        }
        return name;
    },

    template: function() {
        throw new Error(consts.messages.NOT_IMPLEMENTED);
    },

    render: function() {
        var ctx = this.templateContext,
            $el = $(this.template(ctx));

        this.destroy();
        this.$element = $el;

        if (this.doAfterRender) {
            this.doAfterRender();
        }
    },

    destroy: function() {
        var $element = this.$element;

        this.$element = null;
        if ($element) {
            $element.remove();
        }

        if (this.doAfterDestroy) {
            this.doAfterDestroy();
        }
    },

    getParentView: function() {
        return this._parentView;
    },

    getRoot: function() {
        /* eslint-disable consistent-this */
        var nextView = this.getParentView(),
            currentView = this;
        while (nextView) {
            currentView = nextView;
            nextView = currentView.getParentView();
        }

        return currentView;
        /* eslint-enable consistent-this */
    },

    postCommand: function(data, callback) {
        this.getRoot()
            .postCommand(data, callback);
    }
});

module.exports = View;
