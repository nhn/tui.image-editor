'use strict';

var messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_VIEW_NAME: 'Should set a view name',
    NO_ELEMENT: 'Should render element(s): ',
    UNKNOWN: 'Unknown: '
};

var errorMap = {
    unimplementation: function(methodName) {
        return Error(messages.UN_IMPLEMENTATION + methodName);
    },

    noview: function() {
        return Error(messages.NO_VIEW_NAME);
    },

    noelement: function(viewName) {
        return Error(messages.NO_ELEMENT + viewName);
    },

    unknown: function(msg) {
        return Error(messages.UNKNOWN + msg);
    }
};

module.exports = {
    create: function(type) {
        var func;

        type = type.toLowerCase();
        func = errorMap[type] || errorMap.unknown;
        Array.prototype.shift.apply(arguments);

        return func.apply(null, arguments);
    }
};
