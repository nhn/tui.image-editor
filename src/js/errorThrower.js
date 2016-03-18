'use strict';

var messages = {
    UN_IMPLEMENTATION: 'Implement method: ',
    NO_VIEW_NAME: 'Set a view name',
    NO_ELEMENT: 'Render element(s): '
};

module.exports = {
    throwUnImplementation: function(methodName) {
        throw new Error(messages.UN_IMPLEMENTATION + methodName);
    },

    throwNoView: function() {
        throw new Error(messages.NO_VIEW_NAME);
    },

    throwNoElement: function(viewName) {
        throw new Error(messages.NO_ELEMENT + viewName);
    }
};
