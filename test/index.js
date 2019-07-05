/**
 * @fileoverview Test env
 * @author NHN Ent. FE Development Lab <dl_javascript@nhn.com>
 */
import fabric from 'fabric';
import '../src';

fabric.Object.prototype.objectCaching = false;

const testsContext = require.context('.', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);
