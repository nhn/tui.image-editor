(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/template/helper');
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'));

},{"./src/js/imageEditor":28,"./src/template/helper":44}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = require('./handlebars/base');

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = require('./handlebars/safe-string');

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = require('./handlebars/exception');

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars/base":3,"./handlebars/exception":6,"./handlebars/no-conflict":16,"./handlebars/runtime":17,"./handlebars/safe-string":18,"./handlebars/utils":19}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _helpers = require('./helpers');

var _decorators = require('./decorators');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var VERSION = '4.0.5';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];


},{"./decorators":4,"./exception":6,"./helpers":7,"./logger":15,"./utils":19}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = require('./decorators/inline');

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}


},{"./decorators/inline":5}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];


},{"../utils":19}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];


},{}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = require('./helpers/block-helper-missing');

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = require('./helpers/each');

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = require('./helpers/helper-missing');

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = require('./helpers/if');

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = require('./helpers/log');

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = require('./helpers/lookup');

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = require('./helpers/with');

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}


},{"./helpers/block-helper-missing":8,"./helpers/each":9,"./helpers/helper-missing":10,"./helpers/if":11,"./helpers/log":12,"./helpers/lookup":13,"./helpers/with":14}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];


},{"../utils":19}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];


},{"../exception":6,"../utils":19}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];


},{"../exception":6}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];


},{"../utils":19}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];


},{}],13:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];


},{}],14:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];


},{"../utils":19}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];


},{"./utils":19}],16:[function(require,module,exports){
(function (global){
/* global window */
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _base = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context !== options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context !== depths[0]) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    options.data = _base.createFrame(options.data);
    partialBlock = options.data['partial-block'] = options.fn;

    if (partialBlock.partials) {
      options.partials = Utils.extend({}, options.partials, partialBlock.partials);
    }
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}


},{"./base":3,"./exception":6,"./utils":19}],18:[function(require,module,exports){
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];


},{}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}


},{}],20:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":2}],21:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":20}],22:[function(require,module,exports){
'use strict';
var isExisty = tui.util.isExisty,
    isString = tui.util.isString;

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
     * Deregister action(events)
     * Parameters equal to {tui.util.CustomEvents.off}
     * See the "tui-code-snippet"
     *      https://github.com/nhnent/tui.code-snippet/blob/master/src/customEvent.js
     */
    deregister: function() {
        var events = this.customEvents;

        events.off.apply(events, arguments);
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

        if (isExisty(args) && !isExisty(args.length) || isString(args)) {
            args = [args];
        }
        args = args || [];
        Array.prototype.unshift.call(args, name);

        return events.invoke.apply(events, args);
    }
});

module.exports = Broker;

},{}],23:[function(require,module,exports){
'use strict';

module.exports = {
    CLASSNAME_PREFIX: 'tui-image-editor',

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader),

    commands: {
        SET_CANVAS_ELEMENT: 'setCanvasElement',
        SET_CANVAS_IMAGE: 'setCanvasImage',
        LOAD_IMAGE_FROM_URL: 'loadImageFromUrl',
        LOAD_IMAGE_FROM_FILE: 'loadImageFromFile',
        ON_LOAD_IMAGE: 'onLoadImage',
        CROP_IMAGE: 'cropImage'
    }
};

},{}],24:[function(require,module,exports){
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
    create: create
};

},{"../view/button":34}],25:[function(require,module,exports){
'use strict';

var messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_VIEW_NAME: 'Should set a view name',
    NO_ELEMENT: 'Should render element(s): ',
    UNKNOWN: 'Unknown: '
};

var map = {
    unimplementation: function(methodName) {
        return messages.UN_IMPLEMENTATION + methodName;
    },

    noview: function() {
        return messages.NO_VIEW_NAME;
    },

    noelement: function(viewName) {
        return messages.NO_ELEMENT + viewName;
    },

    unknown: function(msg) {
        return messages.UNKNOWN + msg;
    }
};

module.exports = {
    create: function(type) {
        var func;

        type = type.toLowerCase();
        func = map[type] || map.unknown;
        Array.prototype.shift.apply(arguments);

        return func.apply(null, arguments);
    }
};

},{}],26:[function(require,module,exports){
'use strict';

var Component = require('../interface/component'),
    commands = require('../consts').commands;

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 */
var ImageLoader = tui.util.defineClass(Component, {
    init: function(parent) {
        this.setParent(parent);
        this.registerAction(commands.LOAD_IMAGE_FROM_URL, this.loadImageFromURL, this);
        this.registerAction(commands.LOAD_IMAGE_FROM_FILE, this.loadImageFromFile, this);
    },

    /**
     * Load image from url
     * @param {string} url - File url
     * @param {string} filename - File name
     */
    loadImageFromURL: function(url, filename) {
        fabric.Image.fromURL(url, $.proxy(function(oImage) {
            var canvas = this.getCanvas(),
                scaleFactor = this.calcInitialScale(oImage);

            oImage.scale(scaleFactor);
            canvas.setBackgroundImage(oImage);
            canvas.setDimensions({ //set canvas size equal to image
                width: oImage.getWidth(),
                height: oImage.getHeight()
            });
            this.postCommands(filename || url, oImage);
        }, this), {
            selectable: false,
            hasControls: false,
            padding: 10,
            lockMovementX: true,
            lockMovementY: true,
            crossOrigin: ''
        });
    },

    /**
     * Load image from file
     * @param {File} imgFile - Image file
     */
    loadImageFromFile: function(imgFile) {
        if (!imgFile) {
            return;
        }

        this.loadImageFromURL(
            URL.createObjectURL(imgFile),
            imgFile.name
        );
    },

    /**
     * Post commands
     * @param {string} name - image name
     * @param {fabric.Image} oImage - Image object
     */
    postCommands: function(name, oImage) {
        name = name || 'unknown';
        this.postCommand({
            name: commands.SET_CANVAS_IMAGE,
            args: [oImage, name]
        });
        this.postCommand({
            name: commands.ON_LOAD_IMAGE,
            args: tui.util.extend({
                imageName: name
            }, this.getSize(oImage))
        });
    },

    /**
     * Get current size of image
     * @param {fabric.Image} oImage - Image object
     * @returns {{currentWidth: Number, currentHeight: Number}}
     */
    getSize: function(oImage) {
        return {
            originalWidth: oImage.width,
            originalHeight: oImage.height,
            currentWidth: Math.floor(oImage.getWidth()),
            currentHeight: Math.floor(oImage.getHeight())
        };
    },

    /**
     * Calculate initial scale
     * @param {fabric.Image} oImage - Image object
     * @returns {number}
     */
    calcInitialScale: function(oImage) {
        var canvas = this.getCanvas(),
            oWidth = oImage.width,
            oHeight = oImage.height,
            scaleFactor;

        if (oImage.width > oImage.height) {
            scaleFactor = (canvas.width) / oWidth;
        } else {
            scaleFactor = (canvas.height) / oHeight;
        }

        return scaleFactor;
    }
});

module.exports = ImageLoader;

},{"../consts":23,"../interface/component":29}],27:[function(require,module,exports){
'use strict';

var Component = require('../interface/component'),
    ImageLoader = require('./imageLoader'),
    commands = require('../consts').commands;

var Main = tui.util.defineClass(Component, {
    init: function(broker) {
        this.broker = broker;

        this.canvas = null;
        this.oImage = null;
        this.components = {};
        this.registerActions();
    },

    /**
     * Register main handler actions
     */
    registerActions: function() {
        this.registerAction(commands.SET_CANVAS_ELEMENT, this.setCanvasElement, this);
        this.registerAction(commands.SET_CANVAS_IMAGE, this.setCanvasImage, this);
    },

    /**
     * Save image(background) of canvas
     * @param {fabric.Image} oImage - Fabric image instance
     * @param {string} name - Name of image
     */
    setCanvasImage: function(oImage, name) {
        this.oImage = oImage;
        this.imageName = name;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {Element} canvasElement - Canvas element
     */
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas(canvasElement);
        this.setComponents();
    },

    /**
     * Set components
     */
    setComponents: function() {
        this.components.imageLoader = new ImageLoader(this);
    },

    /**
     * Register action to broker
     */
    registerAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    },

    /**
     * Deregister action from broker
     */
    deregisterAction: function() {
        var broker = this.broker;

        broker.deregister.apply(broker, arguments);
    },

    /**
     * Post command to broker
     * @param {{name: string, args: (object|Array)}} command - command
     * @returns {boolean} Result of invoking command
     */
    postCommand: function(command) {
        return this.broker.invoke(command);
    },

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.canvas && this.canvas.toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this.imageName;
    }
});

module.exports = Main;

},{"../consts":23,"../interface/component":29,"./imageLoader":26}],28:[function(require,module,exports){
'use strict';

var MainView = require('./view/main'),
    MainHandler = require('./handler/main'),
    Broker = require('./broker'),
    commands = require('./consts').commands;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} wrapper - Wrapper element or selector
 */
var ImageEditor = tui.util.defineClass({
    init: function(wrapper) {
        var broker = new Broker();

        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = broker;

        /**
         * Main components
         * @type {Canvas}
         */
        this.mainHandler = new MainHandler(broker);

        /**
         * Main view
         * @type {MainView}
         */
        this.mainView = new MainView(broker, wrapper);
    },

    /**
     * Load image from url
     * @param {string} url - File url
     * @param {string} filename - File name
     */
    loadImageFromURL: function(url, filename) {
        this.broker.invoke({
            name: commands.LOAD_IMAGE_FROM_URL,
            args: [url, filename]
        });
    },

    /**
     * Load image from file
     * @param {File} file - Image file
     */
    loadImageFromFile: function(file) {
        this.broker.invoke({
            name: commands.LOAD_IMAGE_FROM_FILE,
            args: file
        });
    },

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.mainHandler.toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this.mainHandler.getImageName();
    }
});

module.exports = ImageEditor;

},{"./broker":22,"./consts":23,"./handler/main":27,"./view/main":38}],29:[function(require,module,exports){
'use strict';

var mixer = require('../mixin/mixer');

var Component = tui.util.defineClass({
    init: function() {},

    getCanvas: function() {
        if (this === this.getRoot()) {
            return this.canvas;
        }

        return this.getRoot().getCanvas();
    },

    getComponent: function(name) {
        if (this === this.getRoot()) {
            return this.components[name];
        }

        return this.getRoot().getComponent(name);
    },

    getCanvasImage: function() {
        if (this === this.getRoot()) {
            return this.oImage;
        }

        return this.getRoot().getCanvas();
    }
});

mixer.mixin(Component, 'Delegator');
module.exports = Component;

},{"../mixin/mixer":33}],30:[function(require,module,exports){
'use strict';
var mixer = require('../mixin/mixer'),
    createMessage = require('../factory/errorMessage').create;

/**
 * View interface
 * @class View
 * @mixes Delegator
 * @param {View} parent - Parent view
 */
var View = tui.util.defineClass(/* @lends View.prototype */{
    init: function(parent) {
        /**
         * jQuery Element
         * @type {jQuery}
         */
        this.$element = null;

        this.setParent(parent);
    },

    /**
     * Return jquery element
     * @returns {jQuery}
     */
    getElement: function() {
        var $element = this.$element;

        if (!$element) {
            throw new Error(createMessage('noElement', this.getName()));
        }

        return $element;
    },

    /**
     * Return view name
     * @returns {string}
     */
    getName: function() {
        var name = this.name;

        if (!name) {
            throw new Error(createMessage('noView'));
        }

        return name;
    },

    /**
     * HTML Template method
     * @virtual
     */
    template: function() {
        throw new Error(createMessage('unImplementation', 'template'));
    },

    /**
     * Render view
     * @param {jQuery} $wrapper - $Wrapper element
     */
    render: function($wrapper) {
        var ctx = this.templateContext;

        this.destroy();
        this.$element = $(this.template(ctx));
        if ($wrapper) {
            $wrapper.append(this.$element);
        }

        if (this.doAfterRender) {
            this.doAfterRender();
        }
    },

    /**
     * Destroy view
     */
    destroy: function() {
        var $element;

        if (this.doBeforeDestroy) {
            this.doBeforeDestroy();
        }

        $element = this.$element;
        if ($element) {
            $element.remove();
        }
        this.$element = null;
    }
});

mixer.mixin(View, 'Delegator');
module.exports = View;

},{"../factory/errorMessage":25,"../mixin/mixer":33}],31:[function(require,module,exports){
'use strict';
var createMessage = require('../factory/errorMessage').create;

/**
 * This provides methods used for command delegation.
 * @module Delegator
 * @mixin
 */
var Delegator = {
    /**
     * Set parent
     * @param {Delegator|null} parent - Parent
     */
    setParent: function(parent) {
        this._parent = parent || null;
    },

    /**
     * Return parent.
     * If the view is root, return null
     * @returns {Delegator|null}
     */
    getParent: function() {
        return this._parent;
    },

    /**
     * Return root
     * @returns {Delegator}
     */
    getRoot: function() {
        var next = this.getParent(),
        /* eslint-disable consistent-this */
            current = this;
        /* eslint-enable consistent-this */

        while (next) {
            current = next;
            next = current.getParent();
        }

        return current;
    },

    /**
     * Post a command
     * The root will be override this method
     * @param {object} command - Command data
     * @param {function} callback - Callback if succeeded
     */
    postCommand: function(command, callback) {
        var root = this.getRoot();

        if (this.postCommand === root.postCommand) {
            throw new Error(createMessage('unImplementation', 'postCommand'));
        }

        root.postCommand(command, callback);
    },

    /**
     * Register action(s) to command(s)
     * The root will be override this method
     */
    registerAction: function() {
        var root = this.getRoot();

        if (this.registerAction === root.registerAction) {
            throw new Error(createMessage('unImplementation', 'registerAction'));
        }

        root.registerAction.apply(root, arguments);
    },

    /**
     * Deregister action(s)
     * The root will be override this method
     */
    deregisterAction: function() {
        var root = this.getRoot();

        if (this.deregisterAction === root.deregisterAction) {
            throw new Error(createMessage('unImplementation', 'deregisterAction'));
        }

        root.deregisterAction.apply(root, arguments);
    }
};

module.exports = Delegator;

},{"../factory/errorMessage":25}],32:[function(require,module,exports){
'use strict';

/**
 * This provides methods used for view-branching.
 * @module BranchView
 * @mixin
 */
var BranchView = {
    /**
     * Add child
     * @param {View} view - View instance
     */
    addChild: function(view) {
        var name = view.getName();

        this._children = this._children || {};
        this.removeChild(name);
        this._children[name] = view;
        view.render(this.getElement());
    },

    /**
     * Remove child
     * @param {string} viewName - View name
     */
    removeChild: function(viewName) {
        var views = this._children,
            view = views[viewName];

        if (view) {
            view.destroy();
            delete views[viewName];
        }
    },

    /**
     * Clear children
     */
    clearChildren: function() {
        tui.util.forEach(this._children, function(view) {
            view.destroy();
        });
        this._children = {};
    }
};

module.exports = BranchView;

},{}],33:[function(require,module,exports){
'use strict';
var BranchView = require('./branchView'),
    Delegator = require('./Delegator');

var mixtureMap = {
    branchview: BranchView,
    delegator: Delegator
};

function getMixture(type) {
    return mixtureMap[type.toLowerCase()];
}

function mixin(Target, type) {
    tui.util.extend(Target.prototype, getMixture(type));
}

/**
 * @module mixer
 */
module.exports = {
    getMixture: getMixture,
    mixin: mixin
};

},{"./Delegator":31,"./branchView":32}],34:[function(require,module,exports){
'use strict';
var View = require('../interface/view');
var template = require('../../template/button.hbs');

/**
 * @extends View
 * @class Button
 * @param {Delegator} parent - Parent delegator
 * @param {string} name - Button name
 * @param {object} templateContext - Template context
 */
var Button = tui.util.defineClass(View, /* @lends Button.prototype */{
    init: function(parent, option) {
        View.call(this, parent);
        option = option || {};
        /**
         * Button name
         * @type {string}
         */
        this.name = option.name;

        this.templateContext = null;

        this.clickCommand = option.clickCommand;

        this.setTemplateContext(option.templateContext);
    },

    /**
     * Template context
     * It will be overridden
     * @type {Object}
     */
    templateContext: {
        buttonName: 'button'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    doAfterRender: function() {
        if (this.clickCommand) {
            this.$element.on('click', $.proxy(function() {
                this.postCommand(this.clickCommand);
            }, this));
        }
    },

    /**
     * Override template context
     * @param {object} templateContext - Template context
     */
    setTemplateContext: function(templateContext) {
        this.templateContext = tui.util.extend(
            {},
            Button.prototype.templateContext,
            templateContext
        );
    }
});

module.exports = Button;

},{"../../template/button.hbs":41,"../interface/view":30}],35:[function(require,module,exports){
'use strict';
var View = require('../interface/view'),
    commands = require('../consts').commands;
var template = require('../../template/canvas.hbs');

/**
 * Canvas view
 * @extends View
 * @class Canvas
 * @param {Delegator} parent - Parent delegator
 */
var Canvas = tui.util.defineClass(View, /* @lends Canvas.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'canvas',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'canvas',
        canvasWidth: 600,
        canvasHeight: 600
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Post processing after render
     * It posts a command to register canvas element
     */
    doAfterRender: function() {
        this.postCommand({
            name: commands.SET_CANVAS_ELEMENT,
            args: this.$element.find('canvas')[0]
        });
    }
});

module.exports = Canvas;

},{"../../template/canvas.hbs":42,"../consts":23,"../interface/view":30}],36:[function(require,module,exports){
'use strict';
var View = require('../interface/view'),
    ImageInformation = require('./imageInformation'),
    //UploadForm = require('./uploadForm'),
    mixer = require('../mixin/mixer'),
    commands = require('../consts').commands;

var template = require('../../template/container.hbs');

/**
 * Detail view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Detail = tui.util.defineClass(View, /* @lends Detail.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'detail',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'detail'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * @todo: imageInfo, detailSetting 나누기
     */
    doAfterRender: function() {
        this.registerAction(commands.ON_LOAD_IMAGE, $.proxy(function(templateContext) {
            this.addChild(new ImageInformation(this, templateContext));
        }, this));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

mixer.mixin(Detail, 'BranchView');
module.exports = Detail;

},{"../../template/container.hbs":43,"../consts":23,"../interface/view":30,"../mixin/mixer":33,"./imageInformation":37}],37:[function(require,module,exports){
'use strict';

var View = require('../interface/view'),
    consts = require('../consts');

var template = require('../../template/ImageInformation.hbs');

var commands = consts.commands;

/**
 * @class ImageInformation
 * @extends View
 * @param {Delegator} parent - Parent
 * @param {object} templateContext - Object having image information
 */
var ImageInformation = tui.util.defineClass(View, /* @lends ImageInformation.prototype */{
    init: function(parent, templateContext) {
        View.call(this, parent);
        this.setTemplateContext(templateContext);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'imageInformation',

    /**
     * Template function
     * @type {function}
     */
    template: template,

    /**
     * Default template context
     * @type {object}
     */
    templateContext: {
        title: 'title',
        imageInformation: 'imageInformation',
        original: 'original',
        current: 'current',
        spanText: 'spanText'
    },

    /**
     * Process after render
     *  - Register onScale action
     */
    doAfterRender: function() {
        var prefix = consts.CLASSNAME_PREFIX,
            curInfoClass = prefix + '-' + this.templateContext.current,
            $currentInfoElement = this.$element.find('.' + curInfoClass);

        this.registerAction(commands.ON_SCALE_IMAGE, $.proxy(function(ctx) {
            ctx.onScaling = true;
            $currentInfoElement.html(this.template(ctx));
        }, this));
    },

    /**
     * Process before destroy
     *  - Deregister actions
     */
    doBeforeDestroy: function() {
        this.deregisterAction(this);
    },

    /**
     * Override template context
     * @param {object} templateContext - Template context
     */
    setTemplateContext: function(templateContext) {
        this.templateContext = tui.util.extend(
            {},
            ImageInformation.prototype.templateContext,
            templateContext
        );
    }
});


module.exports = ImageInformation;

},{"../../template/ImageInformation.hbs":40,"../consts":23,"../interface/view":30}],38:[function(require,module,exports){
'use strict';
var View = require('../interface/view'),
    Menu = require('./menu'),
    Canvas = require('./canvas'),
    Detail = require('./detail'),
    mixer = require('../mixin/mixer');

var template = require('../../template/container.hbs');

/**
 * MainView Class
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Broker} broker - Components broker
*/
var Main = tui.util.defineClass(View, /* @lends Main.prototype */{
    init: function(broker, wrapper) {
        View.call(this);

        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = broker;

        this.render();
        this.getElement().appendTo(wrapper);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'main',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'main'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * It adds children
     */
    doAfterRender: function() {
        this.addChild(new Menu(this));
        this.addChild(new Canvas(this));
        this.addChild(new Detail(this));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.deregisterAction(this);
        this.clearChildren();
    },

    /**
     * Post a command to broker
     * @override
     * @param {object} command - Command data
     * @returns {boolean}
     */
    postCommand: function(command) {
        return this.broker.invoke(command);
    },

    /**
     * Register action(s) to broker
     * @override
     */
    registerAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    },

    /**
     * Deregister action(s)
     * @override
     */
    deregisterAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    }
});

mixer.mixin(Main, 'BranchView');
module.exports = Main;

},{"../../template/container.hbs":43,"../interface/view":30,"../mixin/mixer":33,"./canvas":35,"./detail":36,"./menu":39}],39:[function(require,module,exports){
'use strict';
var View = require('../interface/view'),
    btnFactory = require('../factory/button'),
    commands = require('../consts').commands,
    mixer = require('../mixin/mixer');

var template = require('../../template/container.hbs');

/**
 * Menu view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Menu = tui.util.defineClass(View, /* @lends Menu.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'menu',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'menu'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * It adds buttons
     */
    doAfterRender: function() {
        this.addChild(btnFactory.create(this, {
            name: 'Crop',
            templateContext: {
                text: 'Crop'
            },
            clickCommand: {
                name: commands.CROP_IMAGE
            }
        }));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

mixer.mixin(Menu, 'BranchView');
module.exports = Menu;

},{"../../template/container.hbs":43,"../consts":23,"../factory/button":24,"../interface/view":30,"../mixin/mixer":33}],40:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "    Current width: <span class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.spanText : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.currentWidth || (depth0 != null ? depth0.currentWidth : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"currentWidth","hash":{},"data":data}) : helper)))
    + "px</span>\n    <br>\n    Current height: <span class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.spanText : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.currentHeight || (depth0 != null ? depth0.currentHeight : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"currentHeight","hash":{},"data":data}) : helper)))
    + "px</span>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "    <div class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.imageInformation : depth0),{"name":"className","hash":{},"data":data}))
    + "\">\n        <h1 class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.title : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.imageName || (depth0 != null ? depth0.imageName : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"imageName","hash":{},"data":data}) : helper)))
    + "</h1>\n        <div class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.original : depth0),{"name":"className","hash":{},"data":data}))
    + "\">\n            Original width: <span class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.spanText : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.originalWidth || (depth0 != null ? depth0.originalWidth : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"originalWidth","hash":{},"data":data}) : helper)))
    + "px</span>\n            <br>\n            Original height: <span class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.spanText : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.originalHeight || (depth0 != null ? depth0.originalHeight : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"originalHeight","hash":{},"data":data}) : helper)))
    + "px</span>\n        </div>\n        <div class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.current : depth0),{"name":"className","hash":{},"data":data}))
    + "\">\n            Current width: <span class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.spanText : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.currentWidth || (depth0 != null ? depth0.currentWidth : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"currentWidth","hash":{},"data":data}) : helper)))
    + "px</span>\n            <br>\n            Current height: <span class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.spanText : depth0),{"name":"className","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.currentHeight || (depth0 != null ? depth0.currentHeight : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"currentHeight","hash":{},"data":data}) : helper)))
    + "px</span>\n        </div>\n    </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.onScaling : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\n";
},"useData":true});

},{"hbsfy/runtime":21}],41:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <a><button>"
    + container.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"text","hash":{},"data":data}) : helper)))
    + "</button></a>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <button>"
    + container.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"text","hash":{},"data":data}) : helper)))
    + "</button>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<label class=\""
    + container.escapeExpression((helpers.className || (depth0 && depth0.className) || helpers.helperMissing).call(alias1,(depth0 != null ? depth0.buttonName : depth0),{"name":"className","hash":{},"data":data}))
    + "\" style=\"position:relative; overflow:hidden; margin-right:5px; height:100%;\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\n</label>\n";
},"useData":true});

},{"hbsfy/runtime":21}],42:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "<div class=\""
    + alias3((helpers.className || (depth0 && depth0.className) || alias2).call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"className","hash":{},"data":data}))
    + "\">\n    <canvas width=\""
    + alias3(((helper = (helper = helpers.canvasWidth || (depth0 != null ? depth0.canvasWidth : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"canvasWidth","hash":{},"data":data}) : helper)))
    + "\" height=\""
    + alias3(((helper = (helper = helpers.canvasHeight || (depth0 != null ? depth0.canvasHeight : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"canvasHeight","hash":{},"data":data}) : helper)))
    + "\"></canvas>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":21}],43:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"tui-image-editor-container "
    + container.escapeExpression((helpers.className || (depth0 && depth0.className) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.name : depth0),{"name":"className","hash":{},"data":data}))
    + "\"></div>\n";
},"useData":true});

},{"hbsfy/runtime":21}],44:[function(require,module,exports){
'use strict';

var Handlebars = require('hbsfy/runtime');
var consts = require('./../js/consts');

Handlebars.registerHelper('className', function(name) {
    return consts.CLASSNAME_PREFIX + '-' + name;
});

},{"./../js/consts":23,"hbsfy/runtime":21}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvZGVjb3JhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMvaW5saW5lLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvZXhjZXB0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2VhY2guanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2hlbHBlci1taXNzaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9pZi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9sb29rdXAuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL3dpdGguanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9sb2dnZXIuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL25vLWNvbmZsaWN0LmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2hic2Z5L3J1bnRpbWUuanMiLCJzcmMvanMvYnJva2VyLmpzIiwic3JjL2pzL2NvbnN0cy5qcyIsInNyYy9qcy9mYWN0b3J5L2J1dHRvbi5qcyIsInNyYy9qcy9mYWN0b3J5L2Vycm9yTWVzc2FnZS5qcyIsInNyYy9qcy9oYW5kbGVyL2ltYWdlTG9hZGVyLmpzIiwic3JjL2pzL2hhbmRsZXIvbWFpbi5qcyIsInNyYy9qcy9pbWFnZUVkaXRvci5qcyIsInNyYy9qcy9pbnRlcmZhY2UvY29tcG9uZW50LmpzIiwic3JjL2pzL2ludGVyZmFjZS92aWV3LmpzIiwic3JjL2pzL21peGluL0RlbGVnYXRvci5qcyIsInNyYy9qcy9taXhpbi9icmFuY2hWaWV3LmpzIiwic3JjL2pzL21peGluL21peGVyLmpzIiwic3JjL2pzL3ZpZXcvYnV0dG9uLmpzIiwic3JjL2pzL3ZpZXcvY2FudmFzLmpzIiwic3JjL2pzL3ZpZXcvZGV0YWlsLmpzIiwic3JjL2pzL3ZpZXcvaW1hZ2VJbmZvcm1hdGlvbi5qcyIsInNyYy9qcy92aWV3L21haW4uanMiLCJzcmMvanMvdmlldy9tZW51LmpzIiwic3JjL3RlbXBsYXRlL0ltYWdlSW5mb3JtYXRpb24uaGJzIiwic3JjL3RlbXBsYXRlL2J1dHRvbi5oYnMiLCJzcmMvdGVtcGxhdGUvY2FudmFzLmhicyIsInNyYy90ZW1wbGF0ZS9jb250YWluZXIuaGJzIiwic3JjL3RlbXBsYXRl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LENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUNsQixTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVNLFNBQVMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRTtBQUNqRCxTQUFPLENBQUMsV0FBVyxHQUFHLFdBQVcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBLEdBQUksRUFBRSxDQUFDO0NBQ3BEOzs7O0FDM0dEO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vc3JjL3RlbXBsYXRlL2hlbHBlcicpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkltYWdlRWRpdG9yJywgcmVxdWlyZSgnLi9zcmMvanMvaW1hZ2VFZGl0b3InKSk7XG4iLCJpbXBvcnQgKiBhcyBiYXNlIGZyb20gJy4vaGFuZGxlYmFycy9iYXNlJztcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbmltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vaGFuZGxlYmFycy9leGNlcHRpb24nO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi9oYW5kbGViYXJzL3V0aWxzJztcbmltcG9ydCAqIGFzIHJ1bnRpbWUgZnJvbSAnLi9oYW5kbGViYXJzL3J1bnRpbWUnO1xuXG5pbXBvcnQgbm9Db25mbGljdCBmcm9tICcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG5sZXQgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbm5vQ29uZmxpY3QoaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGluc3Q7XG4iLCJpbXBvcnQge2NyZWF0ZUZyYW1lLCBleHRlbmQsIHRvU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi9leGNlcHRpb24nO1xuaW1wb3J0IHtyZWdpc3RlckRlZmF1bHRIZWxwZXJzfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtyZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzQuMC41JztcbmV4cG9ydCBjb25zdCBDT01QSUxFUl9SRVZJU0lPTiA9IDc7XG5cbmV4cG9ydCBjb25zdCBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJyxcbiAgNzogJz49IDQuMC4wJ1xufTtcblxuY29uc3Qgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5leHBvcnQgZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzLCBkZWNvcmF0b3JzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcbiAgdGhpcy5kZWNvcmF0b3JzID0gZGVjb3JhdG9ycyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xuICByZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZ2dlci5sb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgICAgZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lLCBwYXJ0aWFsKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGV4dGVuZCh0aGlzLnBhcnRpYWxzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBwYXJ0aWFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKGBBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBjYWxsZWQgXCIke25hbWV9XCIgYXMgdW5kZWZpbmVkYCk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gcGFydGlhbDtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucGFydGlhbHNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJEZWNvcmF0b3I6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGRlY29yYXRvcnMnKTsgfVxuICAgICAgZXh0ZW5kKHRoaXMuZGVjb3JhdG9ycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVjb3JhdG9yc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRvcnNbbmFtZV07XG4gIH1cbn07XG5cbmV4cG9ydCBsZXQgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0IHtjcmVhdGVGcmFtZSwgbG9nZ2VyfTtcbiIsImltcG9ydCByZWdpc3RlcklubGluZSBmcm9tICcuL2RlY29yYXRvcnMvaW5saW5lJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnMoaW5zdGFuY2UpIHtcbiAgcmVnaXN0ZXJJbmxpbmUoaW5zdGFuY2UpO1xufVxuXG4iLCJpbXBvcnQge2V4dGVuZH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckRlY29yYXRvcignaW5saW5lJywgZnVuY3Rpb24oZm4sIHByb3BzLCBjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgcmV0ID0gZm47XG4gICAgaWYgKCFwcm9wcy5wYXJ0aWFscykge1xuICAgICAgcHJvcHMucGFydGlhbHMgPSB7fTtcbiAgICAgIHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHBhcnRpYWxzIHN0YWNrIGZyYW1lIHByaW9yIHRvIGV4ZWMuXG4gICAgICAgIGxldCBvcmlnaW5hbCA9IGNvbnRhaW5lci5wYXJ0aWFscztcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gZXh0ZW5kKHt9LCBvcmlnaW5hbCwgcHJvcHMucGFydGlhbHMpO1xuICAgICAgICBsZXQgcmV0ID0gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9yaWdpbmFsO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBwcm9wcy5wYXJ0aWFsc1tvcHRpb25zLmFyZ3NbMF1dID0gb3B0aW9ucy5mbjtcblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuIiwiXG5jb25zdCBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgbGV0IGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lLFxuICAgICAgY29sdW1uO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIGxldCB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgaWYgKGxvYykge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBFeGNlcHRpb247XG4iLCJpbXBvcnQgcmVnaXN0ZXJCbG9ja0hlbHBlck1pc3NpbmcgZnJvbSAnLi9oZWxwZXJzL2Jsb2NrLWhlbHBlci1taXNzaW5nJztcbmltcG9ydCByZWdpc3RlckVhY2ggZnJvbSAnLi9oZWxwZXJzL2VhY2gnO1xuaW1wb3J0IHJlZ2lzdGVySGVscGVyTWlzc2luZyBmcm9tICcuL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcnO1xuaW1wb3J0IHJlZ2lzdGVySWYgZnJvbSAnLi9oZWxwZXJzL2lmJztcbmltcG9ydCByZWdpc3RlckxvZyBmcm9tICcuL2hlbHBlcnMvbG9nJztcbmltcG9ydCByZWdpc3Rlckxvb2t1cCBmcm9tICcuL2hlbHBlcnMvbG9va3VwJztcbmltcG9ydCByZWdpc3RlcldpdGggZnJvbSAnLi9oZWxwZXJzL3dpdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICByZWdpc3RlckJsb2NrSGVscGVyTWlzc2luZyhpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyRWFjaChpbnN0YW5jZSk7XG4gIHJlZ2lzdGVySGVscGVyTWlzc2luZyhpbnN0YW5jZSk7XG4gIHJlZ2lzdGVySWYoaW5zdGFuY2UpO1xuICByZWdpc3RlckxvZyhpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyTG9va3VwKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJXaXRoKGluc3RhbmNlKTtcbn1cbiIsImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGNyZWF0ZUZyYW1lLCBpc0FycmF5fSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgbGV0IGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGxldCBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHtkYXRhOiBkYXRhfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQge2FwcGVuZENvbnRleHRQYXRoLCBibG9ja1BhcmFtcywgY3JlYXRlRnJhbWUsIGlzQXJyYXksIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdNdXN0IHBhc3MgaXRlcmF0b3IgdG8gI2VhY2gnKTtcbiAgICB9XG5cbiAgICBsZXQgZm4gPSBvcHRpb25zLmZuLFxuICAgICAgICBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgcmV0ID0gJycsXG4gICAgICAgIGRhdGEsXG4gICAgICAgIGNvbnRleHRQYXRoO1xuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgY29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKSArICcuJztcbiAgICB9XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjSXRlcmF0aW9uKGZpZWxkLCBpbmRleCwgbGFzdCkge1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgZGF0YS5rZXkgPSBmaWVsZDtcbiAgICAgICAgZGF0YS5pbmRleCA9IGluZGV4O1xuICAgICAgICBkYXRhLmZpcnN0ID0gaW5kZXggPT09IDA7XG4gICAgICAgIGRhdGEubGFzdCA9ICEhbGFzdDtcblxuICAgICAgICBpZiAoY29udGV4dFBhdGgpIHtcbiAgICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gY29udGV4dFBhdGggKyBmaWVsZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ZpZWxkXSwge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMoW2NvbnRleHRbZmllbGRdLCBmaWVsZF0sIFtjb250ZXh0UGF0aCArIGZpZWxkLCBudWxsXSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IGNvbnRleHQubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgaW4gY29udGV4dCkge1xuICAgICAgICAgICAgZXhlY0l0ZXJhdGlvbihpLCBpLCBpID09PSBjb250ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByaW9yS2V5O1xuXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcnVubmluZyB0aGUgaXRlcmF0aW9ucyBvbmUgc3RlcCBvdXQgb2Ygc3luYyBzbyB3ZSBjYW4gZGV0ZWN0XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBpdGVyYXRpb24gd2l0aG91dCBoYXZlIHRvIHNjYW4gdGhlIG9iamVjdCB0d2ljZSBhbmQgY3JlYXRlXG4gICAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgICAgaWYgKHByaW9yS2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJpb3JLZXkgPSBrZXk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwcmlvcktleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG4iLCJpbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4uL2V4Y2VwdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oLyogW2FyZ3MsIF1vcHRpb25zICovKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIEEgbWlzc2luZyBmaWVsZCBpbiBhIHt7Zm9vfX0gY29uc3RydWN0LlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29tZW9uZSBpcyBhY3R1YWxseSB0cnlpbmcgdG8gY2FsbCBzb21ldGhpbmcsIGJsb3cgdXAuXG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdNaXNzaW5nIGhlbHBlcjogXCInICsgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXS5uYW1lICsgJ1wiJyk7XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7aXNFbXB0eSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbigvKiBtZXNzYWdlLCBvcHRpb25zICovKSB7XG4gICAgbGV0IGFyZ3MgPSBbdW5kZWZpbmVkXSxcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgbGV2ZWwgPSAxO1xuICAgIGlmIChvcHRpb25zLmhhc2gubGV2ZWwgIT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSBvcHRpb25zLmhhc2gubGV2ZWw7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwpIHtcbiAgICAgIGxldmVsID0gb3B0aW9ucy5kYXRhLmxldmVsO1xuICAgIH1cbiAgICBhcmdzWzBdID0gbGV2ZWw7XG5cbiAgICBpbnN0YW5jZS5sb2coLi4uIGFyZ3MpO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb29rdXAnLCBmdW5jdGlvbihvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cbiIsImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGJsb2NrUGFyYW1zLCBjcmVhdGVGcmFtZSwgaXNFbXB0eSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBsZXQgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKCFpc0VtcHR5KGNvbnRleHQpKSB7XG4gICAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zKFtjb250ZXh0XSwgW2RhdGEgJiYgZGF0YS5jb250ZXh0UGF0aF0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IHtpbmRleE9mfSBmcm9tICcuL3V0aWxzJztcblxubGV0IGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiBbJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddLFxuICBsZXZlbDogJ2luZm8nLFxuXG4gIC8vIE1hcHMgYSBnaXZlbiBsZXZlbCB2YWx1ZSB0byB0aGUgYG1ldGhvZE1hcGAgaW5kZXhlcyBhYm92ZS5cbiAgbG9va3VwTGV2ZWw6IGZ1bmN0aW9uKGxldmVsKSB7XG4gICAgaWYgKHR5cGVvZiBsZXZlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBsZXZlbE1hcCA9IGluZGV4T2YobG9nZ2VyLm1ldGhvZE1hcCwgbGV2ZWwudG9Mb3dlckNhc2UoKSk7XG4gICAgICBpZiAobGV2ZWxNYXAgPj0gMCkge1xuICAgICAgICBsZXZlbCA9IGxldmVsTWFwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV2ZWwgPSBwYXJzZUludChsZXZlbCwgMTApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsZXZlbDtcbiAgfSxcblxuICAvLyBDYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uKGxldmVsLCAuLi5tZXNzYWdlKSB7XG4gICAgbGV2ZWwgPSBsb2dnZXIubG9va3VwTGV2ZWwobGV2ZWwpO1xuXG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubG9va3VwTGV2ZWwobG9nZ2VyLmxldmVsKSA8PSBsZXZlbCkge1xuICAgICAgbGV0IG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKCFjb25zb2xlW21ldGhvZF0pIHsgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgbWV0aG9kID0gJ2xvZyc7XG4gICAgICB9XG4gICAgICBjb25zb2xlW21ldGhvZF0oLi4ubWVzc2FnZSk7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbG9nZ2VyO1xuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oSGFuZGxlYmFycykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBsZXQgcm9vdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93LFxuICAgICAgJEhhbmRsZWJhcnMgPSByb290LkhhbmRsZWJhcnM7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEhhbmRsZWJhcnMubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgICByZXR1cm4gSGFuZGxlYmFycztcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQgeyBDT01QSUxFUl9SRVZJU0lPTiwgUkVWSVNJT05fQ0hBTkdFUywgY3JlYXRlRnJhbWUgfSBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgY29uc3QgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgICAgY3VycmVudFJldmlzaW9uID0gQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICBjb25zdCBydW50aW1lVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgK1xuICAgICAgICAgICAgJ1BsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBydW50aW1lVmVyc2lvbnMgKyAnKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKCcgKyBjb21waWxlclZlcnNpb25zICsgJykuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICtcbiAgICAgICAgICAgICdQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBjb21waWxlckluZm9bMV0gKyAnKS4nKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignTm8gZW52aXJvbm1lbnQgcGFzc2VkIHRvIHRlbXBsYXRlJyk7XG4gIH1cbiAgaWYgKCF0ZW1wbGF0ZVNwZWMgfHwgIXRlbXBsYXRlU3BlYy5tYWluKSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIHRlbXBsYXRlU3BlYy5tYWluLmRlY29yYXRvciA9IHRlbXBsYXRlU3BlYy5tYWluX2Q7XG5cbiAgLy8gTm90ZTogVXNpbmcgZW52LlZNIHJlZmVyZW5jZXMgcmF0aGVyIHRoYW4gbG9jYWwgdmFyIHJlZmVyZW5jZXMgdGhyb3VnaG91dCB0aGlzIHNlY3Rpb24gdG8gYWxsb3dcbiAgLy8gZm9yIGV4dGVybmFsIHVzZXJzIHRvIG92ZXJyaWRlIHRoZXNlIGFzIHBzdWVkby1zdXBwb3J0ZWQgQVBJcy5cbiAgZW52LlZNLmNoZWNrUmV2aXNpb24odGVtcGxhdGVTcGVjLmNvbXBpbGVyKTtcblxuICBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsV3JhcHBlcihwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgICAgY29udGV4dCA9IFV0aWxzLmV4dGVuZCh7fSwgY29udGV4dCwgb3B0aW9ucy5oYXNoKTtcbiAgICAgIGlmIChvcHRpb25zLmlkcykge1xuICAgICAgICBvcHRpb25zLmlkc1swXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIGxldCByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICBsZXQgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICAvLyBKdXN0IGFkZCB3YXRlclxuICBsZXQgY29udGFpbmVyID0ge1xuICAgIHN0cmljdDogZnVuY3Rpb24ob2JqLCBuYW1lKSB7XG4gICAgICBpZiAoIShuYW1lIGluIG9iaikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uKGRlcHRocywgbmFtZSkge1xuICAgICAgY29uc3QgbGVuID0gZGVwdGhzLmxlbmd0aDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGRlcHRoc1tpXSAmJiBkZXB0aHNbaV1bbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBkZXB0aHNbaV1bbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGxhbWJkYTogZnVuY3Rpb24oY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbihpKSB7XG4gICAgICBsZXQgcmV0ID0gdGVtcGxhdGVTcGVjW2ldO1xuICAgICAgcmV0LmRlY29yYXRvciA9IHRlbXBsYXRlU3BlY1tpICsgJ19kJ107XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgICAgbGV0IHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSxcbiAgICAgICAgICBmbiA9IHRoaXMuZm4oaSk7XG4gICAgICBpZiAoZGF0YSB8fCBkZXB0aHMgfHwgYmxvY2tQYXJhbXMgfHwgZGVjbGFyZWRCbG9ja1BhcmFtcykge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuXG4gICAgZGF0YTogZnVuY3Rpb24odmFsdWUsIGRlcHRoKSB7XG4gICAgICB3aGlsZSAodmFsdWUgJiYgZGVwdGgtLSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgbGV0IG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiAocGFyYW0gIT09IGNvbW1vbikpIHtcbiAgICAgICAgb2JqID0gVXRpbHMuZXh0ZW5kKHt9LCBjb21tb24sIHBhcmFtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJcbiAgfTtcblxuICBmdW5jdGlvbiByZXQoY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIGxldCBkZXB0aHMsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGlmIChvcHRpb25zLmRlcHRocykge1xuICAgICAgICBkZXB0aHMgPSBjb250ZXh0ICE9PSBvcHRpb25zLmRlcHRoc1swXSA/IFtjb250ZXh0XS5jb25jYXQob3B0aW9ucy5kZXB0aHMpIDogb3B0aW9ucy5kZXB0aHM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXB0aHMgPSBbY29udGV4dF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFpbihjb250ZXh0LyosIG9wdGlvbnMqLykge1xuICAgICAgcmV0dXJuICcnICsgdGVtcGxhdGVTcGVjLm1haW4oY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICB9XG4gICAgbWFpbiA9IGV4ZWN1dGVEZWNvcmF0b3JzKHRlbXBsYXRlU3BlYy5tYWluLCBtYWluLCBjb250YWluZXIsIG9wdGlvbnMuZGVwdGhzIHx8IFtdLCBkYXRhLCBibG9ja1BhcmFtcyk7XG4gICAgcmV0dXJuIG1haW4oY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbiAgcmV0LmlzVG9wID0gdHJ1ZTtcblxuICByZXQuX3NldHVwID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsIHx8IHRlbXBsYXRlU3BlYy51c2VEZWNvcmF0b3JzKSB7XG4gICAgICAgIGNvbnRhaW5lci5kZWNvcmF0b3JzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuZGVjb3JhdG9ycywgZW52LmRlY29yYXRvcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgICBjb250YWluZXIuZGVjb3JhdG9ycyA9IG9wdGlvbnMuZGVjb3JhdG9ycztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uKGksIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zICYmICFibG9ja1BhcmFtcykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnREZXB0aHMgPSBkZXB0aHM7XG4gICAgaWYgKGRlcHRocyAmJiBjb250ZXh0ICE9PSBkZXB0aHNbMF0pIHtcbiAgICAgIGN1cnJlbnREZXB0aHMgPSBbY29udGV4dF0uY29uY2F0KGRlcHRocyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuKGNvbnRhaW5lcixcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscyxcbiAgICAgICAgb3B0aW9ucy5kYXRhIHx8IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLFxuICAgICAgICBjdXJyZW50RGVwdGhzKTtcbiAgfVxuXG4gIHByb2cgPSBleGVjdXRlRGVjb3JhdG9ycyhmbiwgcHJvZywgY29udGFpbmVyLCBkZXB0aHMsIGRhdGEsIGJsb2NrUGFyYW1zKTtcblxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBpZiAoIXBhcnRpYWwpIHtcbiAgICBpZiAob3B0aW9ucy5uYW1lID09PSAnQHBhcnRpYWwtYmxvY2snKSB7XG4gICAgICBwYXJ0aWFsID0gb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ107XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCFwYXJ0aWFsLmNhbGwgJiYgIW9wdGlvbnMubmFtZSkge1xuICAgIC8vIFRoaXMgaXMgYSBkeW5hbWljIHBhcnRpYWwgdGhhdCByZXR1cm5lZCBhIHN0cmluZ1xuICAgIG9wdGlvbnMubmFtZSA9IHBhcnRpYWw7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbcGFydGlhbF07XG4gIH1cbiAgcmV0dXJuIHBhcnRpYWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoID0gb3B0aW9ucy5pZHNbMF0gfHwgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoO1xuICB9XG5cbiAgbGV0IHBhcnRpYWxCbG9jaztcbiAgaWYgKG9wdGlvbnMuZm4gJiYgb3B0aW9ucy5mbiAhPT0gbm9vcCkge1xuICAgIG9wdGlvbnMuZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgcGFydGlhbEJsb2NrID0gb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKHBhcnRpYWxCbG9jay5wYXJ0aWFscykge1xuICAgICAgb3B0aW9ucy5wYXJ0aWFscyA9IFV0aWxzLmV4dGVuZCh7fSwgb3B0aW9ucy5wYXJ0aWFscywgcGFydGlhbEJsb2NrLnBhcnRpYWxzKTtcbiAgICB9XG4gIH1cblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkICYmIHBhcnRpYWxCbG9jaykge1xuICAgIHBhcnRpYWwgPSBwYXJ0aWFsQmxvY2s7XG4gIH1cblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gIH0gZWxzZSBpZiAocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKSB7IHJldHVybiAnJzsgfVxuXG5mdW5jdGlvbiBpbml0RGF0YShjb250ZXh0LCBkYXRhKSB7XG4gIGlmICghZGF0YSB8fCAhKCdyb290JyBpbiBkYXRhKSkge1xuICAgIGRhdGEgPSBkYXRhID8gY3JlYXRlRnJhbWUoZGF0YSkgOiB7fTtcbiAgICBkYXRhLnJvb3QgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBleGVjdXRlRGVjb3JhdG9ycyhmbiwgcHJvZywgY29udGFpbmVyLCBkZXB0aHMsIGRhdGEsIGJsb2NrUGFyYW1zKSB7XG4gIGlmIChmbi5kZWNvcmF0b3IpIHtcbiAgICBsZXQgcHJvcHMgPSB7fTtcbiAgICBwcm9nID0gZm4uZGVjb3JhdG9yKHByb2csIHByb3BzLCBjb250YWluZXIsIGRlcHRocyAmJiBkZXB0aHNbMF0sIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgIFV0aWxzLmV4dGVuZChwcm9nLCBwcm9wcyk7XG4gIH1cbiAgcmV0dXJuIHByb2c7XG59XG4iLCIvLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FmZVN0cmluZztcbiIsImNvbnN0IGVzY2FwZSA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjeDI3OycsXG4gICdgJzogJyYjeDYwOycsXG4gICc9JzogJyYjeDNEOydcbn07XG5cbmNvbnN0IGJhZENoYXJzID0gL1smPD5cIidgPV0vZyxcbiAgICAgIHBvc3NpYmxlID0gL1smPD5cIidgPV0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQob2JqLyogLCAuLi5zb3VyY2UgKi8pIHtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFyZ3VtZW50c1tpXSwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBsZXQgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKiBlc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlICovXG5sZXQgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuLy8gZmFsbGJhY2sgZm9yIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxuZXhwb3J0IHtpc0Z1bmN0aW9ufTtcbi8qIGVzbGludC1lbmFibGUgZnVuYy1zdHlsZSAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZXhwb3J0IGNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydCBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyAmJiBzdHJpbmcudG9IVE1MKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvSFRNTCgpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyAnJztcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZztcbiAgfVxuXG4gIGlmICghcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIGxldCBmcmFtZSA9IGV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59XG4iLCIvLyBDcmVhdGUgYSBzaW1wbGUgcGF0aCBhbGlhcyB0byBhbGxvdyBicm93c2VyaWZ5IHRvIHJlc29sdmVcbi8vIHRoZSBydW50aW1lIG9uIGEgc3VwcG9ydGVkIHBhdGguXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lJylbJ2RlZmF1bHQnXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgaXNFeGlzdHkgPSB0dWkudXRpbC5pc0V4aXN0eSxcbiAgICBpc1N0cmluZyA9IHR1aS51dGlsLmlzU3RyaW5nO1xuXG4vKipcbiAqIEJyb2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBCcm9rZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiBAbGVuZHMgQnJva2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jdXN0b21FdmVudHMgPSBuZXcgdHVpLnV0aWwuQ3VzdG9tRXZlbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGFjdGlvbihldmVudHMpXG4gICAgICogUGFyYW1ldGVycyBlcXVhbCB0byB7dHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm9ufVxuICAgICAqIFNlZSB0aGUgXCJ0dWktY29kZS1zbmlwcGV0XCJcbiAgICAgKiAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9uaG5lbnQvdHVpLmNvZGUtc25pcHBldC9ibG9iL21hc3Rlci9zcmMvY3VzdG9tRXZlbnQuanNcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudHMgPSB0aGlzLmN1c3RvbUV2ZW50cztcblxuICAgICAgICBldmVudHMub24uYXBwbHkoZXZlbnRzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZXJlZ2lzdGVyIGFjdGlvbihldmVudHMpXG4gICAgICogUGFyYW1ldGVycyBlcXVhbCB0byB7dHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm9mZn1cbiAgICAgKiBTZWUgdGhlIFwidHVpLWNvZGUtc25pcHBldFwiXG4gICAgICogICAgICBodHRwczovL2dpdGh1Yi5jb20vbmhuZW50L3R1aS5jb2RlLXNuaXBwZXQvYmxvYi9tYXN0ZXIvc3JjL2N1c3RvbUV2ZW50LmpzXG4gICAgICovXG4gICAgZGVyZWdpc3RlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudHMgPSB0aGlzLmN1c3RvbUV2ZW50cztcblxuICAgICAgICBldmVudHMub2ZmLmFwcGx5KGV2ZW50cywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZSBjdXN0b20gZXZlbnRzXG4gICAgICogQHBhcmFtIHt7bmFtZTogc3RyaW5nLCBhcmdzOiBvYmplY3R9fSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBpbnZva2UgcmVzdWx0XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBuYW1lID0gY29tbWFuZC5uYW1lLFxuICAgICAgICAgICAgYXJncyA9IGNvbW1hbmQuYXJncyxcbiAgICAgICAgICAgIGV2ZW50cyA9IHRoaXMuY3VzdG9tRXZlbnRzO1xuXG4gICAgICAgIGlmIChpc0V4aXN0eShhcmdzKSAmJiAhaXNFeGlzdHkoYXJncy5sZW5ndGgpIHx8IGlzU3RyaW5nKGFyZ3MpKSB7XG4gICAgICAgICAgICBhcmdzID0gW2FyZ3NdO1xuICAgICAgICB9XG4gICAgICAgIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3MsIG5hbWUpO1xuXG4gICAgICAgIHJldHVybiBldmVudHMuaW52b2tlLmFwcGx5KGV2ZW50cywgYXJncyk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnJva2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBDTEFTU05BTUVfUFJFRklYOiAndHVpLWltYWdlLWVkaXRvcicsXG5cbiAgICBJU19TVVBQT1JUX0ZJTEVfQVBJOiAhISh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkZpbGVSZWFkZXIpLFxuXG4gICAgY29tbWFuZHM6IHtcbiAgICAgICAgU0VUX0NBTlZBU19FTEVNRU5UOiAnc2V0Q2FudmFzRWxlbWVudCcsXG4gICAgICAgIFNFVF9DQU5WQVNfSU1BR0U6ICdzZXRDYW52YXNJbWFnZScsXG4gICAgICAgIExPQURfSU1BR0VfRlJPTV9VUkw6ICdsb2FkSW1hZ2VGcm9tVXJsJyxcbiAgICAgICAgTE9BRF9JTUFHRV9GUk9NX0ZJTEU6ICdsb2FkSW1hZ2VGcm9tRmlsZScsXG4gICAgICAgIE9OX0xPQURfSU1BR0U6ICdvbkxvYWRJbWFnZScsXG4gICAgICAgIENST1BfSU1BR0U6ICdjcm9wSW1hZ2UnXG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEJ1dHRvbiA9IHJlcXVpcmUoJy4uL3ZpZXcvYnV0dG9uJyk7XG5cbi8qKlxuICogQ3JlYXRlIGJ1dHRvbiB2aWV3XG4gKiBAcGFyYW0ge1ZpZXd9IHBhcmVudCAtIFBhcmVudCB2aWV3XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gQnV0dG9uIG9wdGlvblxuICogQHJldHVybnMge0J1dHRvbn0gQnV0dG9uVmlld1xuICovXG5mdW5jdGlvbiBjcmVhdGUocGFyZW50LCBvcHRpb24pIHtcbiAgICByZXR1cm4gbmV3IEJ1dHRvbihwYXJlbnQsIG9wdGlvbik7XG59XG5cbi8vQHRvZG86IOyiheulmOuzhCDrsoTtirwg7Yyp7Yag66asXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lc3NhZ2VzID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiAnU2hvdWxkIGltcGxlbWVudCBhIG1ldGhvZDogJyxcbiAgICBOT19WSUVXX05BTUU6ICdTaG91bGQgc2V0IGEgdmlldyBuYW1lJyxcbiAgICBOT19FTEVNRU5UOiAnU2hvdWxkIHJlbmRlciBlbGVtZW50KHMpOiAnLFxuICAgIFVOS05PV046ICdVbmtub3duOiAnXG59O1xuXG52YXIgbWFwID0ge1xuICAgIHVuaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLlVOX0lNUExFTUVOVEFUSU9OICsgbWV0aG9kTmFtZTtcbiAgICB9LFxuXG4gICAgbm92aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLk5PX1ZJRVdfTkFNRTtcbiAgICB9LFxuXG4gICAgbm9lbGVtZW50OiBmdW5jdGlvbih2aWV3TmFtZSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuTk9fRUxFTUVOVCArIHZpZXdOYW1lO1xuICAgIH0sXG5cbiAgICB1bmtub3duOiBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLlVOS05PV04gKyBtc2c7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBmdW5jO1xuXG4gICAgICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGZ1bmMgPSBtYXBbdHlwZV0gfHwgbWFwLnVua25vd247XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuXG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKSxcbiAgICBjb21tYW5kcyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLmNvbW1hbmRzO1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqL1xudmFyIEltYWdlTG9hZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCB7XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBY3Rpb24oY29tbWFuZHMuTE9BRF9JTUFHRV9GUk9NX1VSTCwgdGhpcy5sb2FkSW1hZ2VGcm9tVVJMLCB0aGlzKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFjdGlvbihjb21tYW5kcy5MT0FEX0lNQUdFX0ZST01fRklMRSwgdGhpcy5sb2FkSW1hZ2VGcm9tRmlsZSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gRmlsZSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tVVJMOiBmdW5jdGlvbih1cmwsIGZpbGVuYW1lKSB7XG4gICAgICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKHVybCwgJC5wcm94eShmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpLFxuICAgICAgICAgICAgICAgIHNjYWxlRmFjdG9yID0gdGhpcy5jYWxjSW5pdGlhbFNjYWxlKG9JbWFnZSk7XG5cbiAgICAgICAgICAgIG9JbWFnZS5zY2FsZShzY2FsZUZhY3Rvcik7XG4gICAgICAgICAgICBjYW52YXMuc2V0QmFja2dyb3VuZEltYWdlKG9JbWFnZSk7XG4gICAgICAgICAgICBjYW52YXMuc2V0RGltZW5zaW9ucyh7IC8vc2V0IGNhbnZhcyBzaXplIGVxdWFsIHRvIGltYWdlXG4gICAgICAgICAgICAgICAgd2lkdGg6IG9JbWFnZS5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogb0ltYWdlLmdldEhlaWdodCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucG9zdENvbW1hbmRzKGZpbGVuYW1lIHx8IHVybCwgb0ltYWdlKTtcbiAgICAgICAgfSwgdGhpcyksIHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgaGFzQ29udHJvbHM6IGZhbHNlLFxuICAgICAgICAgICAgcGFkZGluZzogMTAsXG4gICAgICAgICAgICBsb2NrTW92ZW1lbnRYOiB0cnVlLFxuICAgICAgICAgICAgbG9ja01vdmVtZW50WTogdHJ1ZSxcbiAgICAgICAgICAgIGNyb3NzT3JpZ2luOiAnJ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIGZpbGVcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltZ0ZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbUZpbGU6IGZ1bmN0aW9uKGltZ0ZpbGUpIHtcbiAgICAgICAgaWYgKCFpbWdGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoXG4gICAgICAgICAgICBVUkwuY3JlYXRlT2JqZWN0VVJMKGltZ0ZpbGUpLFxuICAgICAgICAgICAgaW1nRmlsZS5uYW1lXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBvc3QgY29tbWFuZHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIGltYWdlIG5hbWVcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gSW1hZ2Ugb2JqZWN0XG4gICAgICovXG4gICAgcG9zdENvbW1hbmRzOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJ3Vua25vd24nO1xuICAgICAgICB0aGlzLnBvc3RDb21tYW5kKHtcbiAgICAgICAgICAgIG5hbWU6IGNvbW1hbmRzLlNFVF9DQU5WQVNfSU1BR0UsXG4gICAgICAgICAgICBhcmdzOiBbb0ltYWdlLCBuYW1lXVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wb3N0Q29tbWFuZCh7XG4gICAgICAgICAgICBuYW1lOiBjb21tYW5kcy5PTl9MT0FEX0lNQUdFLFxuICAgICAgICAgICAgYXJnczogdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbWFnZU5hbWU6IG5hbWVcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0U2l6ZShvSW1hZ2UpKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgc2l6ZSBvZiBpbWFnZVxuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBJbWFnZSBvYmplY3RcbiAgICAgKiBAcmV0dXJucyB7e2N1cnJlbnRXaWR0aDogTnVtYmVyLCBjdXJyZW50SGVpZ2h0OiBOdW1iZXJ9fVxuICAgICAqL1xuICAgIGdldFNpemU6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3JpZ2luYWxXaWR0aDogb0ltYWdlLndpZHRoLFxuICAgICAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IG9JbWFnZS5oZWlnaHQsXG4gICAgICAgICAgICBjdXJyZW50V2lkdGg6IE1hdGguZmxvb3Iob0ltYWdlLmdldFdpZHRoKCkpLFxuICAgICAgICAgICAgY3VycmVudEhlaWdodDogTWF0aC5mbG9vcihvSW1hZ2UuZ2V0SGVpZ2h0KCkpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBpbml0aWFsIHNjYWxlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEltYWdlIG9iamVjdFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgY2FsY0luaXRpYWxTY2FsZTogZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpLFxuICAgICAgICAgICAgb1dpZHRoID0gb0ltYWdlLndpZHRoLFxuICAgICAgICAgICAgb0hlaWdodCA9IG9JbWFnZS5oZWlnaHQsXG4gICAgICAgICAgICBzY2FsZUZhY3RvcjtcblxuICAgICAgICBpZiAob0ltYWdlLndpZHRoID4gb0ltYWdlLmhlaWdodCkge1xuICAgICAgICAgICAgc2NhbGVGYWN0b3IgPSAoY2FudmFzLndpZHRoKSAvIG9XaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjYWxlRmFjdG9yID0gKGNhbnZhcy5oZWlnaHQpIC8gb0hlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY2FsZUZhY3RvcjtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUxvYWRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKSxcbiAgICBJbWFnZUxvYWRlciA9IHJlcXVpcmUoJy4vaW1hZ2VMb2FkZXInKSxcbiAgICBjb21tYW5kcyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLmNvbW1hbmRzO1xuXG52YXIgTWFpbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGJyb2tlcikge1xuICAgICAgICB0aGlzLmJyb2tlciA9IGJyb2tlcjtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG4gICAgICAgIHRoaXMub0ltYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBY3Rpb25zKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIG1haW4gaGFuZGxlciBhY3Rpb25zXG4gICAgICovXG4gICAgcmVnaXN0ZXJBY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFjdGlvbihjb21tYW5kcy5TRVRfQ0FOVkFTX0VMRU1FTlQsIHRoaXMuc2V0Q2FudmFzRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBY3Rpb24oY29tbWFuZHMuU0VUX0NBTlZBU19JTUFHRSwgdGhpcy5zZXRDYW52YXNJbWFnZSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBpbWFnZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihvSW1hZ2UsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5vSW1hZ2UgPSBvSW1hZ2U7XG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50IHRvIGZhYnJpYy5DYW52YXNcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudFxuICAgICAqL1xuICAgIHNldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcyhjYW52YXNFbGVtZW50KTtcbiAgICAgICAgdGhpcy5zZXRDb21wb25lbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjb21wb25lbnRzXG4gICAgICovXG4gICAgc2V0Q29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5pbWFnZUxvYWRlciA9IG5ldyBJbWFnZUxvYWRlcih0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYWN0aW9uIHRvIGJyb2tlclxuICAgICAqL1xuICAgIHJlZ2lzdGVyQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJyb2tlciA9IHRoaXMuYnJva2VyO1xuXG4gICAgICAgIGJyb2tlci5yZWdpc3Rlci5hcHBseShicm9rZXIsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlcmVnaXN0ZXIgYWN0aW9uIGZyb20gYnJva2VyXG4gICAgICovXG4gICAgZGVyZWdpc3RlckFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBicm9rZXIgPSB0aGlzLmJyb2tlcjtcblxuICAgICAgICBicm9rZXIuZGVyZWdpc3Rlci5hcHBseShicm9rZXIsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBvc3QgY29tbWFuZCB0byBicm9rZXJcbiAgICAgKiBAcGFyYW0ge3tuYW1lOiBzdHJpbmcsIGFyZ3M6IChvYmplY3R8QXJyYXkpfX0gY29tbWFuZCAtIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmVzdWx0IG9mIGludm9raW5nIGNvbW1hbmRcbiAgICAgKi9cbiAgICBwb3N0Q29tbWFuZDogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5icm9rZXIuaW52b2tlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkYXRhIHVybCBmcm9tIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyAmJiB0aGlzLmNhbnZhcy50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZU5hbWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1haW5WaWV3ID0gcmVxdWlyZSgnLi92aWV3L21haW4nKSxcbiAgICBNYWluSGFuZGxlciA9IHJlcXVpcmUoJy4vaGFuZGxlci9tYWluJyksXG4gICAgQnJva2VyID0gcmVxdWlyZSgnLi9icm9rZXInKSxcbiAgICBjb21tYW5kcyA9IHJlcXVpcmUoJy4vY29uc3RzJykuY29tbWFuZHM7XG5cbi8qKlxuICogSW1hZ2UgZWRpdG9yXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfGpRdWVyeXxIVE1MRWxlbWVudH0gd3JhcHBlciAtIFdyYXBwZXIgZWxlbWVudCBvciBzZWxlY3RvclxuICovXG52YXIgSW1hZ2VFZGl0b3IgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgaW5pdDogZnVuY3Rpb24od3JhcHBlcikge1xuICAgICAgICB2YXIgYnJva2VyID0gbmV3IEJyb2tlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21wb25lbnRzIGJyb2tlclxuICAgICAgICAgKiBAdHlwZSB7QnJva2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5icm9rZXIgPSBicm9rZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1haW4gY29tcG9uZW50c1xuICAgICAgICAgKiBAdHlwZSB7Q2FudmFzfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tYWluSGFuZGxlciA9IG5ldyBNYWluSGFuZGxlcihicm9rZXIpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYWluIHZpZXdcbiAgICAgICAgICogQHR5cGUge01haW5WaWV3fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tYWluVmlldyA9IG5ldyBNYWluVmlldyhicm9rZXIsIHdyYXBwZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEZpbGUgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gRmlsZSBuYW1lXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbVVSTDogZnVuY3Rpb24odXJsLCBmaWxlbmFtZSkge1xuICAgICAgICB0aGlzLmJyb2tlci5pbnZva2Uoe1xuICAgICAgICAgICAgbmFtZTogY29tbWFuZHMuTE9BRF9JTUFHRV9GUk9NX1VSTCxcbiAgICAgICAgICAgIGFyZ3M6IFt1cmwsIGZpbGVuYW1lXVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIGZpbGVcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbUZpbGU6IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgdGhpcy5icm9rZXIuaW52b2tlKHtcbiAgICAgICAgICAgIG5hbWU6IGNvbW1hbmRzLkxPQURfSU1BR0VfRlJPTV9GSUxFLFxuICAgICAgICAgICAgYXJnczogZmlsZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGEgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFpbkhhbmRsZXIudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFpbkhhbmRsZXIuZ2V0SW1hZ2VOYW1lKCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaXhlciA9IHJlcXVpcmUoJy4uL21peGluL21peGVyJyk7XG5cbnZhciBDb21wb25lbnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7fSxcblxuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzID09PSB0aGlzLmdldFJvb3QoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhcygpO1xuICAgIH0sXG5cbiAgICBnZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IHRoaXMuZ2V0Um9vdCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENvbXBvbmVudChuYW1lKTtcbiAgICB9LFxuXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcyA9PT0gdGhpcy5nZXRSb290KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9JbWFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXMoKTtcbiAgICB9XG59KTtcblxubWl4ZXIubWl4aW4oQ29tcG9uZW50LCAnRGVsZWdhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBtaXhlciA9IHJlcXVpcmUoJy4uL21peGluL21peGVyJyksXG4gICAgY3JlYXRlTWVzc2FnZSA9IHJlcXVpcmUoJy4uL2ZhY3RvcnkvZXJyb3JNZXNzYWdlJykuY3JlYXRlO1xuXG4vKipcbiAqIFZpZXcgaW50ZXJmYWNlXG4gKiBAY2xhc3MgVmlld1xuICogQG1peGVzIERlbGVnYXRvclxuICogQHBhcmFtIHtWaWV3fSBwYXJlbnQgLSBQYXJlbnQgdmlld1xuICovXG52YXIgVmlldyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qIEBsZW5kcyBWaWV3LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGpRdWVyeSBFbGVtZW50XG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiRlbGVtZW50ID0gbnVsbDtcblxuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4ganF1ZXJ5IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqL1xuICAgIGdldEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50O1xuXG4gICAgICAgIGlmICghJGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKCdub0VsZW1lbnQnLCB0aGlzLmdldE5hbWUoKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRlbGVtZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdmlldyBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZSgnbm9WaWV3JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhUTUwgVGVtcGxhdGUgbWV0aG9kXG4gICAgICogQHZpcnR1YWxcbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKCd1bkltcGxlbWVudGF0aW9uJywgJ3RlbXBsYXRlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdmlld1xuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkd3JhcHBlciAtICRXcmFwcGVyIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCR3cmFwcGVyKSB7XG4gICAgICAgIHZhciBjdHggPSB0aGlzLnRlbXBsYXRlQ29udGV4dDtcblxuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudCA9ICQodGhpcy50ZW1wbGF0ZShjdHgpKTtcbiAgICAgICAgaWYgKCR3cmFwcGVyKSB7XG4gICAgICAgICAgICAkd3JhcHBlci5hcHBlbmQodGhpcy4kZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kb0FmdGVyUmVuZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmRvQWZ0ZXJSZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IHZpZXdcbiAgICAgKi9cbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRlbGVtZW50O1xuXG4gICAgICAgIGlmICh0aGlzLmRvQmVmb3JlRGVzdHJveSkge1xuICAgICAgICAgICAgdGhpcy5kb0JlZm9yZURlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbGVtZW50ID0gdGhpcy4kZWxlbWVudDtcbiAgICAgICAgaWYgKCRlbGVtZW50KSB7XG4gICAgICAgICAgICAkZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRlbGVtZW50ID0gbnVsbDtcbiAgICB9XG59KTtcblxubWl4ZXIubWl4aW4oVmlldywgJ0RlbGVnYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSBWaWV3O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZU1lc3NhZ2UgPSByZXF1aXJlKCcuLi9mYWN0b3J5L2Vycm9yTWVzc2FnZScpLmNyZWF0ZTtcblxuLyoqXG4gKiBUaGlzIHByb3ZpZGVzIG1ldGhvZHMgdXNlZCBmb3IgY29tbWFuZCBkZWxlZ2F0aW9uLlxuICogQG1vZHVsZSBEZWxlZ2F0b3JcbiAqIEBtaXhpblxuICovXG52YXIgRGVsZWdhdG9yID0ge1xuICAgIC8qKlxuICAgICAqIFNldCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge0RlbGVnYXRvcnxudWxsfSBwYXJlbnQgLSBQYXJlbnRcbiAgICAgKi9cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtEZWxlZ2F0b3J8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtEZWxlZ2F0b3J9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKSxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cblxuICAgICAgICB3aGlsZSAobmV4dCkge1xuICAgICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQb3N0IGEgY29tbWFuZFxuICAgICAqIFRoZSByb290IHdpbGwgYmUgb3ZlcnJpZGUgdGhpcyBtZXRob2RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29tbWFuZCAtIENvbW1hbmQgZGF0YVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgaWYgc3VjY2VlZGVkXG4gICAgICovXG4gICAgcG9zdENvbW1hbmQ6IGZ1bmN0aW9uKGNvbW1hbmQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByb290ID0gdGhpcy5nZXRSb290KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucG9zdENvbW1hbmQgPT09IHJvb3QucG9zdENvbW1hbmQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKCd1bkltcGxlbWVudGF0aW9uJywgJ3Bvc3RDb21tYW5kJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcm9vdC5wb3N0Q29tbWFuZChjb21tYW5kLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGFjdGlvbihzKSB0byBjb21tYW5kKHMpXG4gICAgICogVGhlIHJvb3Qgd2lsbCBiZSBvdmVycmlkZSB0aGlzIG1ldGhvZFxuICAgICAqL1xuICAgIHJlZ2lzdGVyQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJvb3QgPSB0aGlzLmdldFJvb3QoKTtcblxuICAgICAgICBpZiAodGhpcy5yZWdpc3RlckFjdGlvbiA9PT0gcm9vdC5yZWdpc3RlckFjdGlvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoJ3VuSW1wbGVtZW50YXRpb24nLCAncmVnaXN0ZXJBY3Rpb24nKSk7XG4gICAgICAgIH1cblxuICAgICAgICByb290LnJlZ2lzdGVyQWN0aW9uLmFwcGx5KHJvb3QsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlcmVnaXN0ZXIgYWN0aW9uKHMpXG4gICAgICogVGhlIHJvb3Qgd2lsbCBiZSBvdmVycmlkZSB0aGlzIG1ldGhvZFxuICAgICAqL1xuICAgIGRlcmVnaXN0ZXJBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcm9vdCA9IHRoaXMuZ2V0Um9vdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRlcmVnaXN0ZXJBY3Rpb24gPT09IHJvb3QuZGVyZWdpc3RlckFjdGlvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoJ3VuSW1wbGVtZW50YXRpb24nLCAnZGVyZWdpc3RlckFjdGlvbicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJvb3QuZGVyZWdpc3RlckFjdGlvbi5hcHBseShyb290LCBhcmd1bWVudHMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGVsZWdhdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoaXMgcHJvdmlkZXMgbWV0aG9kcyB1c2VkIGZvciB2aWV3LWJyYW5jaGluZy5cbiAqIEBtb2R1bGUgQnJhbmNoVmlld1xuICogQG1peGluXG4gKi9cbnZhciBCcmFuY2hWaWV3ID0ge1xuICAgIC8qKlxuICAgICAqIEFkZCBjaGlsZFxuICAgICAqIEBwYXJhbSB7Vmlld30gdmlldyAtIFZpZXcgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBhZGRDaGlsZDogZnVuY3Rpb24odmlldykge1xuICAgICAgICB2YXIgbmFtZSA9IHZpZXcuZ2V0TmFtZSgpO1xuXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gdGhpcy5fY2hpbGRyZW4gfHwge307XG4gICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQobmFtZSk7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuW25hbWVdID0gdmlldztcbiAgICAgICAgdmlldy5yZW5kZXIodGhpcy5nZXRFbGVtZW50KCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2hpbGRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmlld05hbWUgLSBWaWV3IG5hbWVcbiAgICAgKi9cbiAgICByZW1vdmVDaGlsZDogZnVuY3Rpb24odmlld05hbWUpIHtcbiAgICAgICAgdmFyIHZpZXdzID0gdGhpcy5fY2hpbGRyZW4sXG4gICAgICAgICAgICB2aWV3ID0gdmlld3Nbdmlld05hbWVdO1xuXG4gICAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgICAgICB2aWV3LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIGRlbGV0ZSB2aWV3c1t2aWV3TmFtZV07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBjbGVhckNoaWxkcmVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9jaGlsZHJlbiwgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgdmlldy5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jaGlsZHJlbiA9IHt9O1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQnJhbmNoVmlldztcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBCcmFuY2hWaWV3ID0gcmVxdWlyZSgnLi9icmFuY2hWaWV3JyksXG4gICAgRGVsZWdhdG9yID0gcmVxdWlyZSgnLi9EZWxlZ2F0b3InKTtcblxudmFyIG1peHR1cmVNYXAgPSB7XG4gICAgYnJhbmNodmlldzogQnJhbmNoVmlldyxcbiAgICBkZWxlZ2F0b3I6IERlbGVnYXRvclxufTtcblxuZnVuY3Rpb24gZ2V0TWl4dHVyZSh0eXBlKSB7XG4gICAgcmV0dXJuIG1peHR1cmVNYXBbdHlwZS50b0xvd2VyQ2FzZSgpXTtcbn1cblxuZnVuY3Rpb24gbWl4aW4oVGFyZ2V0LCB0eXBlKSB7XG4gICAgdHVpLnV0aWwuZXh0ZW5kKFRhcmdldC5wcm90b3R5cGUsIGdldE1peHR1cmUodHlwZSkpO1xufVxuXG4vKipcbiAqIEBtb2R1bGUgbWl4ZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0TWl4dHVyZTogZ2V0TWl4dHVyZSxcbiAgICBtaXhpbjogbWl4aW5cbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgVmlldyA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS92aWV3Jyk7XG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuLi8uLi90ZW1wbGF0ZS9idXR0b24uaGJzJyk7XG5cbi8qKlxuICogQGV4dGVuZHMgVmlld1xuICogQGNsYXNzIEJ1dHRvblxuICogQHBhcmFtIHtEZWxlZ2F0b3J9IHBhcmVudCAtIFBhcmVudCBkZWxlZ2F0b3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQnV0dG9uIG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSB0ZW1wbGF0ZUNvbnRleHQgLSBUZW1wbGF0ZSBjb250ZXh0XG4gKi9cbnZhciBCdXR0b24gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhWaWV3LCAvKiBAbGVuZHMgQnV0dG9uLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQsIG9wdGlvbikge1xuICAgICAgICBWaWV3LmNhbGwodGhpcywgcGFyZW50KTtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8IHt9O1xuICAgICAgICAvKipcbiAgICAgICAgICogQnV0dG9uIG5hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubmFtZSA9IG9wdGlvbi5uYW1lO1xuXG4gICAgICAgIHRoaXMudGVtcGxhdGVDb250ZXh0ID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNsaWNrQ29tbWFuZCA9IG9wdGlvbi5jbGlja0NvbW1hbmQ7XG5cbiAgICAgICAgdGhpcy5zZXRUZW1wbGF0ZUNvbnRleHQob3B0aW9uLnRlbXBsYXRlQ29udGV4dCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRlbXBsYXRlIGNvbnRleHRcbiAgICAgKiBJdCB3aWxsIGJlIG92ZXJyaWRkZW5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRlbXBsYXRlQ29udGV4dDoge1xuICAgICAgICBidXR0b25OYW1lOiAnYnV0dG9uJ1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGVtcGxhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuXG4gICAgZG9BZnRlclJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmNsaWNrQ29tbWFuZCkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2snLCAkLnByb3h5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zdENvbW1hbmQodGhpcy5jbGlja0NvbW1hbmQpO1xuICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRlbXBsYXRlIGNvbnRleHRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGVtcGxhdGVDb250ZXh0IC0gVGVtcGxhdGUgY29udGV4dFxuICAgICAqL1xuICAgIHNldFRlbXBsYXRlQ29udGV4dDogZnVuY3Rpb24odGVtcGxhdGVDb250ZXh0KSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGVDb250ZXh0ID0gdHVpLnV0aWwuZXh0ZW5kKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICBCdXR0b24ucHJvdG90eXBlLnRlbXBsYXRlQ29udGV4dCxcbiAgICAgICAgICAgIHRlbXBsYXRlQ29udGV4dFxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBWaWV3ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL3ZpZXcnKSxcbiAgICBjb21tYW5kcyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLmNvbW1hbmRzO1xudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi4vLi4vdGVtcGxhdGUvY2FudmFzLmhicycpO1xuXG4vKipcbiAqIENhbnZhcyB2aWV3XG4gKiBAZXh0ZW5kcyBWaWV3XG4gKiBAY2xhc3MgQ2FudmFzXG4gKiBAcGFyYW0ge0RlbGVnYXRvcn0gcGFyZW50IC0gUGFyZW50IGRlbGVnYXRvclxuICovXG52YXIgQ2FudmFzID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoVmlldywgLyogQGxlbmRzIENhbnZhcy5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIFZpZXcuY2FsbCh0aGlzLCBwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBWaWV3IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6ICdjYW52YXMnLFxuXG4gICAgLyoqXG4gICAgICogVGVtcGxhdGUgY29udGV4dFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGVtcGxhdGVDb250ZXh0OiB7XG4gICAgICAgIG5hbWU6ICdjYW52YXMnLFxuICAgICAgICBjYW52YXNXaWR0aDogNjAwLFxuICAgICAgICBjYW52YXNIZWlnaHQ6IDYwMFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGVtcGxhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuXG4gICAgLyoqXG4gICAgICogUG9zdCBwcm9jZXNzaW5nIGFmdGVyIHJlbmRlclxuICAgICAqIEl0IHBvc3RzIGEgY29tbWFuZCB0byByZWdpc3RlciBjYW52YXMgZWxlbWVudFxuICAgICAqL1xuICAgIGRvQWZ0ZXJSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBvc3RDb21tYW5kKHtcbiAgICAgICAgICAgIG5hbWU6IGNvbW1hbmRzLlNFVF9DQU5WQVNfRUxFTUVOVCxcbiAgICAgICAgICAgIGFyZ3M6IHRoaXMuJGVsZW1lbnQuZmluZCgnY2FudmFzJylbMF1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFZpZXcgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvdmlldycpLFxuICAgIEltYWdlSW5mb3JtYXRpb24gPSByZXF1aXJlKCcuL2ltYWdlSW5mb3JtYXRpb24nKSxcbiAgICAvL1VwbG9hZEZvcm0gPSByZXF1aXJlKCcuL3VwbG9hZEZvcm0nKSxcbiAgICBtaXhlciA9IHJlcXVpcmUoJy4uL21peGluL21peGVyJyksXG4gICAgY29tbWFuZHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKS5jb21tYW5kcztcblxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi4vLi4vdGVtcGxhdGUvY29udGFpbmVyLmhicycpO1xuXG4vKipcbiAqIERldGFpbCB2aWV3XG4gKiBAZXh0ZW5kcyBWaWV3XG4gKiBAbWl4ZXMgQnJhbmNoVmlld1xuICogQGNsYXNzXG4gKiBAcGFyYW0ge0RlbGVnYXRvcn0gcGFyZW50IC0gUGFyZW50IGRlbGVnYXRvclxuICovXG52YXIgRGV0YWlsID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoVmlldywgLyogQGxlbmRzIERldGFpbC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIFZpZXcuY2FsbCh0aGlzLCBwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBWaWV3IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6ICdkZXRhaWwnLFxuXG4gICAgLyoqXG4gICAgICogVGVtcGxhdGUgY29udGV4dFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGVtcGxhdGVDb250ZXh0OiB7XG4gICAgICAgIG5hbWU6ICdkZXRhaWwnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0ZW1wbGF0ZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzaW5nIGFmdGVyIHJlbmRlclxuICAgICAqIEB0b2RvOiBpbWFnZUluZm8sIGRldGFpbFNldHRpbmcg64KY64iE6riwXG4gICAgICovXG4gICAgZG9BZnRlclJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBY3Rpb24oY29tbWFuZHMuT05fTE9BRF9JTUFHRSwgJC5wcm94eShmdW5jdGlvbih0ZW1wbGF0ZUNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQobmV3IEltYWdlSW5mb3JtYXRpb24odGhpcywgdGVtcGxhdGVDb250ZXh0KSk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2luZyBiZWZvcmUgZGVzdHJveVxuICAgICAqIEl0IGNsZWFycyBjaGlsZHJlblxuICAgICAqL1xuICAgIGRvQmVmb3JlRGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xlYXJDaGlsZHJlbigpO1xuICAgIH1cbn0pO1xuXG5taXhlci5taXhpbihEZXRhaWwsICdCcmFuY2hWaWV3Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZpZXcgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvdmlldycpLFxuICAgIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuLi8uLi90ZW1wbGF0ZS9JbWFnZUluZm9ybWF0aW9uLmhicycpO1xuXG52YXIgY29tbWFuZHMgPSBjb25zdHMuY29tbWFuZHM7XG5cbi8qKlxuICogQGNsYXNzIEltYWdlSW5mb3JtYXRpb25cbiAqIEBleHRlbmRzIFZpZXdcbiAqIEBwYXJhbSB7RGVsZWdhdG9yfSBwYXJlbnQgLSBQYXJlbnRcbiAqIEBwYXJhbSB7b2JqZWN0fSB0ZW1wbGF0ZUNvbnRleHQgLSBPYmplY3QgaGF2aW5nIGltYWdlIGluZm9ybWF0aW9uXG4gKi9cbnZhciBJbWFnZUluZm9ybWF0aW9uID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoVmlldywgLyogQGxlbmRzIEltYWdlSW5mb3JtYXRpb24ucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCwgdGVtcGxhdGVDb250ZXh0KSB7XG4gICAgICAgIFZpZXcuY2FsbCh0aGlzLCBwYXJlbnQpO1xuICAgICAgICB0aGlzLnNldFRlbXBsYXRlQ29udGV4dCh0ZW1wbGF0ZUNvbnRleHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBWaWV3IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6ICdpbWFnZUluZm9ybWF0aW9uJyxcblxuICAgIC8qKlxuICAgICAqIFRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgdGVtcGxhdGUgY29udGV4dFxuICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICovXG4gICAgdGVtcGxhdGVDb250ZXh0OiB7XG4gICAgICAgIHRpdGxlOiAndGl0bGUnLFxuICAgICAgICBpbWFnZUluZm9ybWF0aW9uOiAnaW1hZ2VJbmZvcm1hdGlvbicsXG4gICAgICAgIG9yaWdpbmFsOiAnb3JpZ2luYWwnLFxuICAgICAgICBjdXJyZW50OiAnY3VycmVudCcsXG4gICAgICAgIHNwYW5UZXh0OiAnc3BhblRleHQnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgYWZ0ZXIgcmVuZGVyXG4gICAgICogIC0gUmVnaXN0ZXIgb25TY2FsZSBhY3Rpb25cbiAgICAgKi9cbiAgICBkb0FmdGVyUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGNvbnN0cy5DTEFTU05BTUVfUFJFRklYLFxuICAgICAgICAgICAgY3VySW5mb0NsYXNzID0gcHJlZml4ICsgJy0nICsgdGhpcy50ZW1wbGF0ZUNvbnRleHQuY3VycmVudCxcbiAgICAgICAgICAgICRjdXJyZW50SW5mb0VsZW1lbnQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgY3VySW5mb0NsYXNzKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQWN0aW9uKGNvbW1hbmRzLk9OX1NDQUxFX0lNQUdFLCAkLnByb3h5KGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICAgICAgY3R4Lm9uU2NhbGluZyA9IHRydWU7XG4gICAgICAgICAgICAkY3VycmVudEluZm9FbGVtZW50Lmh0bWwodGhpcy50ZW1wbGF0ZShjdHgpKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIGJlZm9yZSBkZXN0cm95XG4gICAgICogIC0gRGVyZWdpc3RlciBhY3Rpb25zXG4gICAgICovXG4gICAgZG9CZWZvcmVEZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5kZXJlZ2lzdGVyQWN0aW9uKHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0ZW1wbGF0ZSBjb250ZXh0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRlbXBsYXRlQ29udGV4dCAtIFRlbXBsYXRlIGNvbnRleHRcbiAgICAgKi9cbiAgICBzZXRUZW1wbGF0ZUNvbnRleHQ6IGZ1bmN0aW9uKHRlbXBsYXRlQ29udGV4dCkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlQ29udGV4dCA9IHR1aS51dGlsLmV4dGVuZChcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgSW1hZ2VJbmZvcm1hdGlvbi5wcm90b3R5cGUudGVtcGxhdGVDb250ZXh0LFxuICAgICAgICAgICAgdGVtcGxhdGVDb250ZXh0XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUluZm9ybWF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFZpZXcgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvdmlldycpLFxuICAgIE1lbnUgPSByZXF1aXJlKCcuL21lbnUnKSxcbiAgICBDYW52YXMgPSByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIERldGFpbCA9IHJlcXVpcmUoJy4vZGV0YWlsJyksXG4gICAgbWl4ZXIgPSByZXF1aXJlKCcuLi9taXhpbi9taXhlcicpO1xuXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuLi8uLi90ZW1wbGF0ZS9jb250YWluZXIuaGJzJyk7XG5cbi8qKlxuICogTWFpblZpZXcgQ2xhc3NcbiAqIEBleHRlbmRzIFZpZXdcbiAqIEBtaXhlcyBCcmFuY2hWaWV3XG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7QnJva2VyfSBicm9rZXIgLSBDb21wb25lbnRzIGJyb2tlclxuKi9cbnZhciBNYWluID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoVmlldywgLyogQGxlbmRzIE1haW4ucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGJyb2tlciwgd3JhcHBlcikge1xuICAgICAgICBWaWV3LmNhbGwodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbXBvbmVudHMgYnJva2VyXG4gICAgICAgICAqIEB0eXBlIHtCcm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJyb2tlciA9IGJyb2tlcjtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB0aGlzLmdldEVsZW1lbnQoKS5hcHBlbmRUbyh3cmFwcGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVmlldyBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiAnbWFpbicsXG5cbiAgICAvKipcbiAgICAgKiBUZW1wbGF0ZSBjb250ZXh0XG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0ZW1wbGF0ZUNvbnRleHQ6IHtcbiAgICAgICAgbmFtZTogJ21haW4nXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0ZW1wbGF0ZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzaW5nIGFmdGVyIHJlbmRlclxuICAgICAqIEl0IGFkZHMgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBkb0FmdGVyUmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRDaGlsZChuZXcgTWVudSh0aGlzKSk7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobmV3IENhbnZhcyh0aGlzKSk7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobmV3IERldGFpbCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NpbmcgYmVmb3JlIGRlc3Ryb3lcbiAgICAgKiBJdCBjbGVhcnMgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBkb0JlZm9yZURlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRlcmVnaXN0ZXJBY3Rpb24odGhpcyk7XG4gICAgICAgIHRoaXMuY2xlYXJDaGlsZHJlbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQb3N0IGEgY29tbWFuZCB0byBicm9rZXJcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29tbWFuZCAtIENvbW1hbmQgZGF0YVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHBvc3RDb21tYW5kOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJyb2tlci5pbnZva2UoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGFjdGlvbihzKSB0byBicm9rZXJcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICByZWdpc3RlckFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBicm9rZXIgPSB0aGlzLmJyb2tlcjtcblxuICAgICAgICBicm9rZXIucmVnaXN0ZXIuYXBwbHkoYnJva2VyLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZXJlZ2lzdGVyIGFjdGlvbihzKVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGRlcmVnaXN0ZXJBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYnJva2VyID0gdGhpcy5icm9rZXI7XG5cbiAgICAgICAgYnJva2VyLnJlZ2lzdGVyLmFwcGx5KGJyb2tlciwgYXJndW1lbnRzKTtcbiAgICB9XG59KTtcblxubWl4ZXIubWl4aW4oTWFpbiwgJ0JyYW5jaFZpZXcnKTtcbm1vZHVsZS5leHBvcnRzID0gTWFpbjtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBWaWV3ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL3ZpZXcnKSxcbiAgICBidG5GYWN0b3J5ID0gcmVxdWlyZSgnLi4vZmFjdG9yeS9idXR0b24nKSxcbiAgICBjb21tYW5kcyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLmNvbW1hbmRzLFxuICAgIG1peGVyID0gcmVxdWlyZSgnLi4vbWl4aW4vbWl4ZXInKTtcblxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi4vLi4vdGVtcGxhdGUvY29udGFpbmVyLmhicycpO1xuXG4vKipcbiAqIE1lbnUgdmlld1xuICogQGV4dGVuZHMgVmlld1xuICogQG1peGVzIEJyYW5jaFZpZXdcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtEZWxlZ2F0b3J9IHBhcmVudCAtIFBhcmVudCBkZWxlZ2F0b3JcbiAqL1xudmFyIE1lbnUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhWaWV3LCAvKiBAbGVuZHMgTWVudS5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIFZpZXcuY2FsbCh0aGlzLCBwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBWaWV3IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6ICdtZW51JyxcblxuICAgIC8qKlxuICAgICAqIFRlbXBsYXRlIGNvbnRleHRcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRlbXBsYXRlQ29udGV4dDoge1xuICAgICAgICBuYW1lOiAnbWVudSdcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRlbXBsYXRlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NpbmcgYWZ0ZXIgcmVuZGVyXG4gICAgICogSXQgYWRkcyBidXR0b25zXG4gICAgICovXG4gICAgZG9BZnRlclJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoYnRuRmFjdG9yeS5jcmVhdGUodGhpcywge1xuICAgICAgICAgICAgbmFtZTogJ0Nyb3AnLFxuICAgICAgICAgICAgdGVtcGxhdGVDb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ0Nyb3AnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xpY2tDb21tYW5kOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogY29tbWFuZHMuQ1JPUF9JTUFHRVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NpbmcgYmVmb3JlIGRlc3Ryb3lcbiAgICAgKiBJdCBjbGVhcnMgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBkb0JlZm9yZURlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNsZWFyQ2hpbGRyZW4oKTtcbiAgICB9XG59KTtcblxubWl4ZXIubWl4aW4oTWVudSwgJ0JyYW5jaFZpZXcnKTtcbm1vZHVsZS5leHBvcnRzID0gTWVudTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiB7fSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMzPWNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczQ9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIiAgICBDdXJyZW50IHdpZHRoOiA8c3BhbiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMygoaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zcGFuVGV4dCA6IGRlcHRoMCkse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jdXJyZW50V2lkdGggfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmN1cnJlbnRXaWR0aCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY3VycmVudFdpZHRoXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcInB4PC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIEN1cnJlbnQgaGVpZ2h0OiA8c3BhbiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMygoaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zcGFuVGV4dCA6IGRlcHRoMCkse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jdXJyZW50SGVpZ2h0IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jdXJyZW50SGVpZ2h0IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJjdXJyZW50SGVpZ2h0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcInB4PC9zcGFuPlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczMoKGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW1hZ2VJbmZvcm1hdGlvbiA6IGRlcHRoMCkse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pKVxuICAgICsgXCJcXFwiPlxcbiAgICAgICAgPGgxIGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMzKChoZWxwZXJzLmNsYXNzTmFtZSB8fCAoZGVwdGgwICYmIGRlcHRoMC5jbGFzc05hbWUpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRpdGxlIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJjbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmltYWdlTmFtZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW1hZ2VOYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJpbWFnZU5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oMT5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczMoKGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3JpZ2luYWwgOiBkZXB0aDApLHtcIm5hbWVcIjpcImNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSlcbiAgICArIFwiXFxcIj5cXG4gICAgICAgICAgICBPcmlnaW5hbCB3aWR0aDogPHNwYW4gY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczMoKGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3BhblRleHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMub3JpZ2luYWxXaWR0aCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3JpZ2luYWxXaWR0aCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwib3JpZ2luYWxXaWR0aFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJweDwvc3Bhbj5cXG4gICAgICAgICAgICA8YnI+XFxuICAgICAgICAgICAgT3JpZ2luYWwgaGVpZ2h0OiA8c3BhbiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMygoaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zcGFuVGV4dCA6IGRlcHRoMCkse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5vcmlnaW5hbEhlaWdodCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub3JpZ2luYWxIZWlnaHQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcIm9yaWdpbmFsSGVpZ2h0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcInB4PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJcIlxuICAgICsgYWxpYXMzKChoZWxwZXJzLmNsYXNzTmFtZSB8fCAoZGVwdGgwICYmIGRlcHRoMC5jbGFzc05hbWUpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmN1cnJlbnQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSlcbiAgICArIFwiXFxcIj5cXG4gICAgICAgICAgICBDdXJyZW50IHdpZHRoOiA8c3BhbiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMygoaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zcGFuVGV4dCA6IGRlcHRoMCkse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jdXJyZW50V2lkdGggfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmN1cnJlbnRXaWR0aCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY3VycmVudFdpZHRoXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcInB4PC9zcGFuPlxcbiAgICAgICAgICAgIDxicj5cXG4gICAgICAgICAgICBDdXJyZW50IGhlaWdodDogPHNwYW4gY2xhc3M9XFxcIlwiXG4gICAgKyBhbGlhczMoKGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc3BhblRleHQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImNsYXNzTmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY3VycmVudEhlaWdodCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY3VycmVudEhlaWdodCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczIpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChhbGlhczEse1wibmFtZVwiOlwiY3VycmVudEhlaWdodFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJweDwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30sKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9uU2NhbGluZyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIiAgICAgICAgPGE+PGJ1dHRvbj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50ZXh0IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50ZXh0IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge30se1wibmFtZVwiOlwidGV4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2J1dHRvbj48L2E+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCIgICAgICAgIDxidXR0b24+XCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGV4dCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGV4dCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LHtcIm5hbWVcIjpcInRleHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9idXR0b24+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDoge307XG5cbiAgcmV0dXJuIFwiPGxhYmVsIGNsYXNzPVxcXCJcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKGhlbHBlcnMuY2xhc3NOYW1lIHx8IChkZXB0aDAgJiYgZGVwdGgwLmNsYXNzTmFtZSkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYnV0dG9uTmFtZSA6IGRlcHRoMCkse1wibmFtZVwiOlwiY2xhc3NOYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pKVxuICAgICsgXCJcXFwiIHN0eWxlPVxcXCJwb3NpdGlvbjpyZWxhdGl2ZTsgb3ZlcmZsb3c6aGlkZGVuOyBtYXJnaW4tcmlnaHQ6NXB4OyBoZWlnaHQ6MTAwJTtcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbXCJpZlwiXS5jYWxsKGFsaWFzMSwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaHJlZiA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLnByb2dyYW0oMywgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuPC9sYWJlbD5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczM9Y29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiXCJcbiAgICArIGFsaWFzMygoaGVscGVycy5jbGFzc05hbWUgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY2xhc3NOYW1lKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJjbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkpXG4gICAgKyBcIlxcXCI+XFxuICAgIDxjYW52YXMgd2lkdGg9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5jYW52YXNXaWR0aCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuY2FudmFzV2lkdGggOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNhbnZhc1dpZHRoXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaGVpZ2h0PVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY2FudmFzSGVpZ2h0IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jYW52YXNIZWlnaHQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMyKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoYWxpYXMxLHtcIm5hbWVcIjpcImNhbnZhc0hlaWdodFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPjwvY2FudmFzPlxcbjwvZGl2PlxcblwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwidHVpLWltYWdlLWVkaXRvci1jb250YWluZXIgXCJcbiAgICArIGNvbnRhaW5lci5lc2NhcGVFeHByZXNzaW9uKChoZWxwZXJzLmNsYXNzTmFtZSB8fCAoZGVwdGgwICYmIGRlcHRoMC5jbGFzc05hbWUpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IHt9LChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJjbGFzc05hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkpXG4gICAgKyBcIlxcXCI+PC9kaXY+XFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi8uLi9qcy9jb25zdHMnKTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignY2xhc3NOYW1lJywgZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBjb25zdHMuQ0xBU1NOQU1FX1BSRUZJWCArICctJyArIG5hbWU7XG59KTtcbiJdfQ==
