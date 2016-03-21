'use strict';

var isExisty = tui.util.isExisty;

/**
 * Broker
 * @class
 */
var Broker = tui.util.defineClass(/* @lends Broker.prototype */{
    init: function() {
        this.customEvents = new tui.util.CustomEvents();
    },

    /**
     * Register action(events)
     * Parameters equal to {tui.util.CustomEvents.on}
     * See the "tui-code-snippet"
     *      https://github.com/nhnent/tui.code-snippet/blob/master/src/customEvent.js
     */
    register: function() {
        var events = this.customEvents;

        events.on.apply(events, arguments);
    },

    /**
     * Receive command
     * @param {{name: string, args: object}} command - Command
     * @param {function} callback - Callback if succeeded
     */
    receive: function(command, callback) {
        var result = this.invoke(command);

        if (result !== false) {
            callback();
        }
    },

    /**
     * Fire custom events
     * @param {{name: string, args: object}} command - Command
     * @returns {boolean} invoke result
     */
    invoke: function(command) {
        var name = command.name,
            args = command.args,
            events = this.customEvents;

        if (isExisty(args) && !isExisty(args.length)) {
            args = [args];
        }
        Array.prototype.unshift.call(args, name);

        return events.hasListener(name) && events.invoke.apply(events, args);
    }
});

module.exports = Broker;
