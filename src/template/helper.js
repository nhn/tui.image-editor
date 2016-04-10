'use strict';

var Handlebars = require('hbsfy/runtime');
var consts = require('../js/consts');

var imageInformationTemplate = require('./imageInformation.hbs');

Handlebars.registerHelper('className', function(name) {
    return consts.CLASSNAME_PREFIX + '-' + name;
});

Handlebars.registerPartial('imageInformation', imageInformationTemplate);
