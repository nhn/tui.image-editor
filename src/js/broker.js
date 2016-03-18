'use strict';

var isExisty = tui.util.isExisty;
var Broker = tui.util.defineClass({
    init: function() {

    },

    receive: function(command, callback) {
        var result = this.invoke(command);
        if (result !== false) {
            callback();
        }
    },

    invoke: function(command) {
        var name = command.name,
            args = command.args,
            fn = this[name];

        if (isExisty(args) && !isExisty(args.length)) {
            args = [args];
        }

        if (!fn) {
            return false;
        }

        return fn.apply(this, args);
    }
});

module.exports = Broker;
