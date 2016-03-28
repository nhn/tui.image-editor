'use strict';

var Button = require('../view/button');

/**
 * Create button view
 * @param {View} parent - Parent view
 * @param {Object} option - Button option
 * @returns {Button} ButtonView
 */
function create(parent, option) {
    return new Button(parent, option);
}

//@todo: 종류별 버튼 팩토리
module.exports = {
    create: create,

    createLoadButton: function(parent) {
        return create(parent, {
            name: 'load',
            templateContext: {
                text: '불러오기',
                fileInputName: 'fileInput'
            }
        });
    }
};
