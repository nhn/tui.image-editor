/**
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 * @fileoverview Test env
 */
import '../src';
import { fabric } from 'fabric';

fabric.Object.prototype.objectCaching = false;

const testsContext = require.context('.', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);
