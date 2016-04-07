'use strict';

var keyMirror = require('../util').keyMirror;

var types = keyMirror(
    'UN_IMPLEMENTATION',
    'NO_COMPONENT_NAME',
    'NO_VIEW_NAME',
    'NO_ELEMENT',
    'UNKNOWN'
);

var messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_COMPONENT_NAME: 'Should set a component name',
    NO_VIEW_NAME: 'Should set a view name',
    NO_ELEMENT: 'Should render element(s): ',
    UNKNOWN: 'Unknown: '
};


var map = {
    UN_IMPLEMENTATION: function(methodName) {
        return messages.UN_IMPLEMENTATION + methodName;
    },

    NO_VIEW_NAME: function() {
        return messages.NO_VIEW_NAME;
    },

    NO_COMPONENT_NAME: function() {
        return messages.NO_COMPONENT_NAME;
    },

    NO_ELEMENT: function(viewName) {
        return messages.NO_ELEMENT + viewName;
    },

    UNKNOWN: function(msg) {
        return messages.UNKNOWN + msg;
    }
};

module.exports = {
    types: tui.util.extend({}, types),

    create: function(type) {
        var func;

        type = type.toLowerCase();
        func = map[type] || map.unknown;
        Array.prototype.shift.apply(arguments);

        return func.apply(null, arguments);
    }
};
