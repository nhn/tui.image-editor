'use strict';
var View = require('./../interface/view'),
    consts = require('./../consts');
var template = require('./../../template/button.hbs');

var Button = tui.util.defineClass(View, {
    init: function(parent, name, templateContext) {
        View.call(this, parent);
        this.name = name;
        this.setTemplateContext(templateContext);
        this.render();
    },

    templateContext: {
        className: consts.CLASSNAME_PREFIX + '-button'
    },

    template: template,

    setTemplateContext: function(templateContext) {
        //@todo: template context 오버라이드 방식 개선
        this.templateContext = tui.util.extend(
            {},
            Button.prototype.templateContext,
            templateContext
        );
    },

    on: function() {
        var $el = this.$element;

        $el.on.apply($el, arguments);
    }
});

module.exports = Button;
