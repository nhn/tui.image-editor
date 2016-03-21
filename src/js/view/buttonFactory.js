'use strict';

var Button = require('./button');

/**
 * Create button view
 * @param {View} parent - Parent view
 * @param {Object} option - Button option
 * @returns {Button} ButtonView
 */
function create(parent, option) {
    var name = option.name,
        templateContext = option.templateContext,
        btnView = new Button(parent, name, templateContext);

    return btnView;
}

//@todo: 종류별 버튼 팩토리
module.exports = {
    create: create
};
