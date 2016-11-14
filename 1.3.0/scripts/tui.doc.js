(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.doc', require('./src/js/fedoc'));

},{"./src/js/fedoc":4}],2:[function(require,module,exports){
var docUtil = require('./docUtil');

/**
 * @fileoverview The content manager
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, tui-code-snippet
 */
var Content = tui.util.defineClass({
    /**
     * Initialize
     * @param {object} options A set of content options
     *  @param {object} options.element A jquery element for infomation contents
     *  @param {object} options.codeElement A jquery element for code
     *  @param {object} options.content A initialize content
     */
    init: function(options) {
        this.$info = options.element;
        this.$code = options.codeElement;
        this.state = 'info';
        this.$code.hide();
        this.setInfo(options.content);
        this.setEvent();

        if (docUtil.isDeveloper()) {
            this.$info.addClass('developer');
        }
    },

    /**
     * Set event
     */
    setEvent: function() {
        this.$info.on('click', tui.util.bind(this.onClick, this));
    },

    /**
     * Click event handler
     * @param {object} A jquery event object
     */
    onClick: function(e) {
        var target = e.target,
            tagName = target.tagName.toLowerCase(),
            readme = this.$info.find('.readme');

        if (tagName === 'a') {
            if (readme.length &&  $.contains(readme[0], target)) {
                open(target.href);
            }
            e.preventDefault();
        }
        if (tagName === 'code' && $(target).parent().hasClass('container-source')) {
            this.fire('notify', {
                line: parseInt(target.innerHTML.replace('line', ''), 10) || 1
            });
        }
    },

    /**
     * Set information html to info
     * @param {string} html A html string to change content
     */
    setInfo: function(html) {
        this.$info.html(html);
    },

    /**
     * Set code html to code
     * @param {string} code A code html string to chagne content
     */
    setCode: function(code) {
        this.$code.html(code);
        this.setCodeLine();
    },

    /**
     * Set code line
     */
    setCodeLine: function() {
        var source,
            i,
            lineNumber,
            lineId,
            lines,
            totalLines,
            anchorHash,
            number;
        prettyPrint();
        source = this.$code.find('.prettyprint');
        if (source && source[0]) {
            anchorHash = document.location.hash.substring(1);
            lines = source[0].getElementsByTagName('li');
            totalLines = lines.length;
            i =  0;
            for (; i < totalLines; i++) {
                lineId = 'line' + i;
                lines[i].id = lineId;
                number = this.getNumberElement(i);
                lines[i].insertBefore(number, lines[i].firstChild);
                if (lineId === anchorHash) {
                    lines[i].className += ' selected';
                }
            }
        }
    },

    /**
     * Make a element to display line number
     * @param {number} num
     */
    getNumberElement: function(num) {
        var span = document.createElement('span');
        span.className = 'number';
        span.style.display = "inline-block";
        span.style.color = "#666";
        span.style.width = "40px";
        span.innerHTML = num + ' : ';
        return span;
    },

    /**
     * Change tab for state change
     * @param {string} state A state to chagne tab
     */
    changeTab: function(state) {
        if (state === 'info') {
            this._enableInfo();
        } else {
            this._enableCode();
        }
    },

    /**
     * Be enable info state
     */
    _enableInfo: function() {
        this.state = 'info';
        this.$info.show();
        this.$code.hide();
    },

    /**
     * Be enable code state
     */
    _enableCode: function() {
        this.state = 'code';
        this.$code.show();
        this.$info.hide();
    },

    /**
     * Move to moethod by id
     * @param {string} id A id to move by document.location attribute
     */
    moveTo: function(id) {
        document.location = document.URL.split('#')[0] + id;
    },

    /**
     * Change tab and move to line (number)
     * @param {number} line The number of line to move
     */
    moveToLine: function(line) {
        this.changeTab('code');
        document.location = document.URL.split('#')[0] + '#line' + line;
    }
});

tui.util.CustomEvents.mixin(Content);
module.exports = Content;

},{"./docUtil":3}],3:[function(require,module,exports){
var templates = require('./template');
var isDeveloper = /developer=true/.test(location.search);

module.exports = {
    /**
     * Meta data
     * @param {object} meta The file meta data
     */
    getCode: function(meta) {
        var path = meta.path.split('/src/')[1];
        if (path && path.indexOf('js/') !== -1) {
            path = path.split('js/')[1];
        } else if (path && path.indexOf('js') !== -1) {
            path = path.split('js')[1];
        }
        if (!path) {
            return meta.filename;
        }
        return path.replace(/\//g, '_') + '_' + meta.filename;
    },

    /**
     * Make list by data
     * @param {object} data A data for list
     */
    getList: function(data) {
        var self = this,
            html = '';

        data.sort(function(a, b) {
            var fa = self.getPath(a.meta) + a.longname,
                fb = self.getPath(b.meta) + b.longname;
            if(fa < fb) {
                return -1;
            } else if (fa > fb) {
                return 1;
            } else {
                return 0;
            }
        });

        tui.util.forEach(data, function(el) {
            var code = self.getCode(el.meta),
                members = '',
                methods = '',
                isEmpty = tui.util.isEmpty,
                tmpl;

            if (isEmpty(el.methods) && isEmpty(el.members)) {
                return;
            }

            if (el.members) {
                tmpl = templates.list.members;
                members = self._getInnerHTML(el.members, code, el.longname, tmpl);
            }

            if (el.methods) {
                tmpl = templates.list.methods;
                methods = self._getInnerHTML(el.methods, code, el.longname, tmpl);
            }

            html += self.templating(templates.list.outer, {
                longname: el.longname,
                code: code,
                fullname: self.getDirectory(el.meta, el.longname),
                members: members,
                methods: methods
            });
        });

        return html;
    },

    /**
     * Get path
     * @param meta
     * @returns {*|string}
     */
    getPath: function(meta) {
        var path = meta.path.split('/src/')[1];
        if (path && path.indexOf('js/') !== -1) {
            path = path.split('js/')[1];
        } else if (path && path.indexOf('js') !== -1) {
            path = path.split('js')[1];
        }
        return path || '';
    },

    /**
     * Get file directory info
     * @param {object} meta The file meta data
     * @param {string} name The name of class
     */
    getDirectory: function(meta, name) {
        var path = this.getPath(meta);
        if (!path || name.indexOf('module:') >= 0) {
            return name;
        }
        return '<span class="directory">' + path.replace(/\//g, '/') + '/</span>' + name;
    },

    /**
     * Get inner html
     * @param {array} items An item array to apply template
     * @param {string} code A code name
     * @param {string} longname A file name
     * @param {strong} tmpl A template
     */
    _getInnerHTML: function(items, code, longname, tmpl) {
        var html = '',
            mhtml = '',
            self = this;
        tui.util.forEach(items, function(m) {
            if (m.access === 'private') {
                return;
            }
            mhtml += self.templating(templates.list.inner, {
                longname: longname,
                code: code,
                id: m.id,
                label: m.id.replace('.', '')
            });
        });
        if (mhtml) {
            html += self.templating(tmpl, {
                html: mhtml
            });
        }
        return html;
    },

    /**
     * Return template string
     */
    templating: function(tmpl, map) {
        var result = tmpl.replace(/\{\{([^\}]+)\}\}/g, function(matchedString, name) {
            return map[name] || '';
        });
        return result;
    },

    /**
     *
     * @returns {boolean}
     */
    isDeveloper: function() {
        return isDeveloper;
    }
};
},{"./template":7}],4:[function(require,module,exports){
/**
 * @fileoverview The Fedoc element
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, tui-code-snippet
 */

var Menu = require('./menu');
var Content = require('./content');
var Search = require('./search');
var docUtil = require('./docUtil');

var Fedoc = tui.util.defineClass({
    /**
     * Initialize
     * @param {object} options
     */
    init: function(options) {
        this.menu = new Menu({
            data: options.data.menu,
            element: options.element.menu,
            tab: options.element.tab
        });
        this.content = new Content({
            element: options.element.content,
            codeElement: options.element.code,
            content: options.data.content
        });
        this.search = new Search({
            element: options.element.search
        });
        this._menu = options.data.menu;
        this.setMenu();
        this.setEvent();
    },

    /**
     * Set events
     */
    setEvent: function() {
        this.content.on('notify', tui.util.bind(this.changePage, this));
        this.menu.on('notify', tui.util.bind(this.changePage, this));
        this.menu.on('tabChange', tui.util.bind(this.changeTab, this));
        this.search.on('search', tui.util.bind(this.searchList, this));
        this.search.on('notify', tui.util.bind(this.changePage, this));
    },

    /**
     * Search words by lnb data
     * @param {object} data A search data
     */
    searchList: function(data) {
        var word = data.text,
            classes = this.menu.getData('classes'),
            namespaces = this.menu.getData('namespaces'),
            modules = this.menu.getData('modules'),
            interfaces = this.menu.getData('interfaces'),
            events = this.menu.getData('events'),
            result = [];
        result = result.concat(
            this.findIn(word, classes),
            this.findIn(word, modules),
            this.findIn(word, interfaces),
            this.findIn(word, namespaces),
            this.findIn(word, events)
        );
        if (!word) {
            result = [];
        }
        data.callback(result);
    },

    /**
     * Find in lnb array
     * @param {string} str A search string
     * @param {array} list A data list
     */
    findIn: function(str, array) {
        var result = [],
            self = this;
        tui.util.forEach(array, function(el) {
            var code = docUtil.getCode(el.meta);
            if (el.kind !== 'event') {
                tui.util.forEach(el.methods, function(m) {
                    self._storeMemberIfMatched(str, m, {
                        array: result,
                        code: code
                    });
                });
            } else if (el.kind === 'event') {
                self._storeMemberIfMatched(str, el, {
                    array: result,
                    code: code
                });
            }
        });
        return result;
    },

    /**
     * Helper method for Searching and this.findIn,
     * @param {string} str - Query
     * @param {element} target - Element
     * @param {object} statics - Object for storing
     * @private
     */
    _storeMemberIfMatched: function(str, target, statics) {
        var isMatched = target.id.replace('.', '').toLowerCase().indexOf(str.toLowerCase()) !== -1;
        if (isMatched) {
            statics.array.push({
                id: target.id,
                label: this.highlighting(target.id, str),
                group: target.longname,
                code: statics.code
            });
        }
    },

    /**
     * Highlight query
     * @param {string} word A word to stress
     * @param {string} string A string include word
     */
    highlighting: function(word, str) {
        var reg = new RegExp(str, 'i', 'g'),
            origin = reg.exec(word)[0];
        return word.replace(reg, '<strong>' + origin + '</strong>');
    },

    /**
     * Chagne Tab
     * @param {object} data A tab data
     */
    changeTab: function(data) {
        this.content.changeTab(data.state);
    },

    /**
     * Set Content page by data
     * @param {object} data A page data
     */
    changePage: function(data) {
        var name = data.name;

        if (name) {
            this.changeTab({state: 'info'});
            this.menu.turnOnInfo();
            if (name.indexOf('module:') >= 0) {
                name = name.replace(/\:/g, '-').replace(/\//g, '_');
            }
            this.content.setInfo(fedoc.content[name + '.html']);
            this.content.setCode(fedoc.content[data.codeName + '.html']);
            this.content.moveTo('#contentTab');
        }
        if (data.line) {
            this.menu.turnOnCode();
            this.content.moveToLine(data.line);
        }
        if (data.href) {
            this.content.moveTo(data.href);
        }
        this.menu.focus(data.name, data.codeName, data.isGlobal ? data.href : null);
        this.search.reset();
    },

    /**
     * Set menu object to html
     */
    setMenu: function() {
        this.menu.setMenu();
    },

    /**
     * Set content
     * @param {string} html A html string to set content
     */
    setContent: function(html) {
        this.content.setInfo(html);
    }
});


module.exports = Fedoc;

},{"./content":2,"./docUtil":3,"./menu":5,"./search":6}],5:[function(require,module,exports){
var docUtil = require('./docUtil');
var templates = require('./template');

/**
 * @fileoverview The left menu and tab menu manager
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, tui-code-snippet
 */
var Menu = tui.util.defineClass({
    /**
     * Initialize
     * @param {object} options The options for menu
     *  @param {object} options.element The jquery wrapping object for left menu
     *  @param {object} options.tab The jquery wrapping object for tab menu
     */
    init: function(options) {
        this.$menu = options.element;
        this.$tab = options.tab;
        this.data = options.data;
        this.current = 'main';
        this.state = 'info';
        this.codeBtn = this.$tab.find('.code');
        this.codeBtn.hide();
        this.setEvent();

        this._refineEvents();
        if (!docUtil.isDeveloper()) {
            tui.util.forEach(this.data, function(typedData, key) {
                if (key === 'events') {
                    this.data.events = this._filterAPI(typedData);
                } else {
                    tui.util.forEach(typedData, function(datum) {
                        if (datum.methods) {
                            datum.methods = this._filterAPI(datum.methods);
                        }
                        if (datum.members) {
                            datum.members = this._filterAPI(datum.members);
                        }
                    }, this);
                }
            }, this);
        }
    },

    /**
     * Make unique lists of custom events
     * @private
     */
    _refineEvents: function() {
        var events = this.data.events,
            temp = {};
        this.data.events = tui.util.filter(events, function(event) {
            if (temp[event.longname]) {
                return false;
            } else {
                temp[event.longname] = true;
                return true;
            }
        });
    },

    /**
     * Set members for userAPI
     *  If you want to identify a param, run on debug mode.
     * @param {object} members - members
     * @returns {object}
     * @private
     */
    _filterAPI: function(members) {
        return tui.util.filter(members, function(member) {
            var found = false;
            if (member.tags) {
                tui.util.forEach(member.tags, function(tag) {
                    found = (tag.originalTitle === 'api');
                    if (found) {
                        return false;
                    }
                });
            }
            return found;
        });
    },

    /**
     * Set event to page move
     */
    setEvent: function() {
        this.$menu.on('click', tui.util.bind(this.onClickMenu, this));
        this.$tab.on('click', tui.util.bind(this.onClickTab, this));
    },

    /**
     * Tab chnage event
     * @param {object} event The JqueryEvent object
     */
    onClickTab: function(event) {
        var target = $(event.target),
            isCode,
            isSample;
        if (target.hasClass('tabmenu') && !target.hasClass('on')) {
            isCode = target.hasClass('code');
            isSample = target.hasClass('sample');

            if (isSample) {
                window.open('tutorial.html');
                return;
            }

            this.fire('tabChange', {
                state: isCode ? 'code' : 'info'
            });

            if (isCode) {
                this.turnOnCode();
            } else {
                this.turnOnInfo();
            }
        }
    },

    /**
     * Focus on selected menu
     * @param {string} spec A specification id to find
     * @param {string} code A code line to move
     */
    focus: function(spec, code, href) {
        if (!spec || !code) {
            return;
        }
        this.$menu.find('.listitem').each(function(index) {
            var self = $(this),
                child = self.find('a[href=' + href + ']');
            self.removeClass('selected');
            if (child.length) {
                self.addClass('selected');
            } else {
                if (href) {
                    return;
                }
                if ((self.attr('data-spec') === spec) && self.attr('data-code')) {
                    self.addClass('selected');
                }
            }
        });
    },

    /**
     * Focus on specification page
     */
    turnOnInfo: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.info').addClass('on');
    },

    /**
     * Focus on code page
     */
    turnOnCode: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.code').addClass('on');
    },

    /**
     * Notify for change content
     * @param {object} event A click event object
     */
    onClickMenu: function(event) {
        event.preventDefault();
        var preTarget = $(event.target),
            isDirectory = preTarget.hasClass('directory'),
            midTarget = isDirectory ? preTarget.parent() : preTarget,
            href = midTarget.attr('href'),
            target = href ? midTarget.parent() : midTarget,
            isGlobal = target.hasClass('globalitem'),
            spec = target.attr('data-spec'),
            code = target.attr('data-code');
        if (isGlobal && !href) {
            href = target.find('a').attr('href');
        }

        if (spec) {
            this.fire('notify', {
                name: spec,
                codeName: code,
                href: href,
                isGlobal: isGlobal
            });
        }

        this.codeBtn.show();
    },

    getData: function(type) {
        return this.data[type];
    },

    /**
     * Get general list
     * @param {string} type - Type of contents
     * @return {string} Contents html
     */
    getContents: function(type) {
        var html = '',
            data,
            list,
            isEmpty = tui.util.isEmpty;

        type = type.toLowerCase();
        data = this.data[type];

        if (isEmpty(data)) {
            return html;
        }

        list = docUtil.getList(data);

        if (list) {
            html += docUtil.templating(templates.menu, {
                title: type.charAt(0).toUpperCase() + type.substr(1),
                cname: type,
                list: list
            });
        }

        return html;
    },

    getEvents: function() {
        var events = this.data.events,
            html = '',
            list = '';

        if (!events || !events.length) {
            return html;
        }
        tui.util.forEach(events, function(el) {
            var code = docUtil.getCode(el.meta);
            list += docUtil.templating(templates.events, {
                code: code,
                id: el.id,
                longname: el.longname,
                scope: el.longname.split('#')[0]
            });
        });
        html = docUtil.templating(templates.menu, {
            title: 'Events',
            cname: 'events',
            list: list
        });
        return html;
    },

    /**
     * Get global menus
     */
    getGlobals: function() {
        var globals = this.data.globals,
            html = '',
            list = '';

        if (!globals || !globals.length) {
            return html;
        }
        tui.util.forEach(globals, function(el) {
            var code = docUtil.getCode(el.meta);
            list += docUtil.templating(templates.global, {
                scope: el.scope,
                code: code,
                id: el.id,
                longname: el.longname
            });
        });
        html = docUtil.templating(templates.menu, {
            title: 'Globals',
            cname: 'globals',
            list: list
        });
        return html;
    },

    /**
     * Set menus
     * @todo getEvents and menu select
     */
    setMenu: function() {
        var html = '',
            types = [
                'classes',
                'modules',
                'namespaces',
                'interfaces'
            ],
            self = this;

        tui.util.forEach(types, function(type) {
            html += self.getContents(type);
        });
        html += this.getEvents();
        this.$menu.html(html);
    },

    /**
     * Select menu with state
     * @param {string} menu A selected menu
     * @param {string} state A tab statement
     */
    select: function(menu, state) {
        this.current = menu;
        this.state = state || 'info';
    },

    /**
     * Open selected menu
     * @param {string} menu A selected menu
     */
    open: function(menu) {
        this.$menu.find('.' + menu).addClass('unfold');
    },

    /**
     * Set tab menu html
     * @param {string} html The html to show up on page
     */
    setTab: function(html) {
        this.$tab.html(html);
    },

    /**
     * On selected tab
     * @param {string} name A selected tab name
     */
    tabOn: function(name) {
        this.$tab.removeClass();
        this.$tab.addClass('tab tab-' + name);
    }
});

tui.util.CustomEvents.mixin(Menu);
module.exports = Menu;

},{"./docUtil":3,"./template":7}],6:[function(require,module,exports){
/**
 * @fileoverview The search manager
 * @author NHN Entertainment. FE Development team (dl_javascript@nhnent.com)
 * @dependency jquery1.8.3, tui-code-snippet
 */
var Search = tui.util.defineClass({

    /**
     * Special key code
     */
    keyUp: 38,
    keyDown: 40,
    enter: 13,

    /**
     * Initialize
     * @param {object} options
     *  @param {object} options.element A search element
     * @param {object} app Fedec instance
     */
    init: function(options, app) {
        this.$el = options.element;
        this.$input = this.$el.find('input');
        this.$list = this.$el.find('.searchList');
        this.$list.hide();
        this.root = app;
        this._addEvent();
        this.index = null;
    },

    /**
     * Add Events
     */
    _addEvent: function() {
        this.$input.on('keyup', tui.util.bind(function(event) {
            var selected,
                first;
            if(event.keyCode === this.keyUp || event.keyCode === this.keyDown || event.keyCode === this.enter) {
                if (this.$list.css('display') !== 'none') {
                    if (event.keyCode === this.enter) {
                        selected = this.$list.find('li.on');
                        first = this.$list.find('li').eq(0);
                        if (selected.length !== 0) {
                            this.onSubmit({ target: selected[0] });
                        } else if (first.length !== 0) {
                            this.onSubmit({ target: first[0]});
                        }
                    } else {
                        this.selectItem(event.keyCode);
                    }
                }
            } else {
                this.find(event.target.value);
            }
        }, this));
    },

    /**
     * Select item by keyboard
     * @param {number} code Keycode
     */
    selectItem: function(code) {
        var len;
        this.$list.find('li').removeClass('on');
        len = this.$list.find('li').length;
        if (!tui.util.isNumber(this.index)) {
            this.index = 0;
        }  else {
            if (code === this.keyUp) {
                this.index = (this.index - 1 + len) % len;
            } else {
                this.index = (this.index + 1) % len;
            }
        }
        this.$list.find('li').eq(this.index).addClass('on');
        this.$input.val(this.$list.find('li.on').find('a').text());
    },

    /**
     * Reset search
     */
    reset: function() {
        this.$input.val('');
        this.$list.find('li').off('click');
        this.$list.empty();
        this.$list.hide();
        this.index = null;
    },

    /**
     * Submit for change by search result list
     * @param {object} A submit event object
     */
    onSubmit: function(event) {
        var target = event.target,
            href,
            spec,
            code;
        target = this.getTarget(target);
        href = target.find('a').attr('href');
        spec = target.find('span').attr('data-spec');
        code = target.find('span').attr('data-code');

        this.fire('notify', {
            codeName: code,
            name: spec,
            href: href
        });
    },

    /**
     * Get target
     * @param {object} target The target that have to extract
     */
    getTarget: function(target) {
        var tagName = target.tagName.toUpperCase(),
            $target = $(target);
        if (tagName !== 'LI') {
            return this.getTarget($target.parent()[0]);
        } else {
            return $target;
        }
    },

    /**
     * Find word by input text
     * @param {string} text A string to find
     */
    find: function(text) {
        var self = this;
        this.$list.hide();
        this.fire('search', {
            text: text,
            callback: function(data) {
                self.update(data);
            }
        });
    },

    /**
     * Update search list
     * @param {array} list Search result list
     */
    update: function(list) {
        var str = '';
        tui.util.forEach(list, function(el) {
            str += '<li><span data-spec="' + el.group.split('#')[0] + '" data-code="' + el.code + '"><a href="#' + el.id + '">' + el.label.replace('.', '') + '</a><span class="group">' + el.group + '</span></span></li>';
        });
        this.$list.html(str);
        if (str) {
            this.$list.show();
        }
        this.$list.find('li').on('click', tui.util.bind(this.onSubmit, this));
    }
});

tui.util.CustomEvents.mixin(Search);
module.exports = Search;

},{}],7:[function(require,module,exports){
/**
 * @fileoverview The templates for html
 */
var templates = {
    menu: [
        '<h3>{{title}}</h3>',
        '<ul class={{cname}}>',
        '{{list}}',
        '</ul>'
    ].join(''),
    global: '',
    events: '<li class="listitem eventitem" data-spec="{{scope}}" data-code="{{code}}"><a href="#{{id}}">{{longname}}</a></li>',
    tutorials: '<li clsss="tutorials"><a class="tutorialLink" href="tutorial-{{name}}.html" target="_blank">{{title}}</a></li>',
    list: {
        outer: [
            '<li class="listitem" data-spec="{{longname}}" data-code="{{code}}">',
            '<a href="#">{{fullname}}</a>',
            '{{members}}',
            '{{methods}}',
            '</li>'
        ].join(''),
        methods: [
            '<div class="title"><strong>Methods</strong></div>',
            '<ul class="inner">',
            '{{html}}',
            '</ul>'
        ].join(''),
        members: [
            '<div class="title"><strong>Members</strong></div>',
            '<ul class="inner">',
            '{{html}}',
            '</ul>'
        ].join(''),
        inner: '<li class="memberitem" data-spec="{{longname}}" data-code="{{code}}"><a href="#{{id}}">{{label}}</a></li>'
    }
};
module.exports = templates;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb250ZW50LmpzIiwic3JjL2pzL2RvY1V0aWwuanMiLCJzcmMvanMvZmVkb2MuanMiLCJzcmMvanMvbWVudS5qcyIsInNyYy9qcy9zZWFyY2guanMiLCJzcmMvanMvdGVtcGxhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmRvYycsIHJlcXVpcmUoJy4vc3JjL2pzL2ZlZG9jJykpO1xuIiwidmFyIGRvY1V0aWwgPSByZXF1aXJlKCcuL2RvY1V0aWwnKTtcblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBjb250ZW50IG1hbmFnZXJcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQuIEZFIERldmVsb3BtZW50IHRlYW0gKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeTEuOC4zLCB0dWktY29kZS1zbmlwcGV0XG4gKi9cbnZhciBDb250ZW50ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBIHNldCBvZiBjb250ZW50IG9wdGlvbnNcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZWxlbWVudCBBIGpxdWVyeSBlbGVtZW50IGZvciBpbmZvbWF0aW9uIGNvbnRlbnRzXG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNvZGVFbGVtZW50IEEganF1ZXJ5IGVsZW1lbnQgZm9yIGNvZGVcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuY29udGVudCBBIGluaXRpYWxpemUgY29udGVudFxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy4kaW5mbyA9IG9wdGlvbnMuZWxlbWVudDtcbiAgICAgICAgdGhpcy4kY29kZSA9IG9wdGlvbnMuY29kZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgICAgICB0aGlzLnNldEluZm8ob3B0aW9ucy5jb250ZW50KTtcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuXG4gICAgICAgIGlmIChkb2NVdGlsLmlzRGV2ZWxvcGVyKCkpIHtcbiAgICAgICAgICAgIHRoaXMuJGluZm8uYWRkQ2xhc3MoJ2RldmVsb3BlcicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudFxuICAgICAqL1xuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5mby5vbignY2xpY2snLCB0dWkudXRpbC5iaW5kKHRoaXMub25DbGljaywgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IEEganF1ZXJ5IGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICAgICAgdGFnTmFtZSA9IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICByZWFkbWUgPSB0aGlzLiRpbmZvLmZpbmQoJy5yZWFkbWUnKTtcblxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2EnKSB7XG4gICAgICAgICAgICBpZiAocmVhZG1lLmxlbmd0aCAmJiAgJC5jb250YWlucyhyZWFkbWVbMF0sIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBvcGVuKHRhcmdldC5ocmVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2NvZGUnICYmICQodGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnY29udGFpbmVyLXNvdXJjZScpKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICAgICBsaW5lOiBwYXJzZUludCh0YXJnZXQuaW5uZXJIVE1MLnJlcGxhY2UoJ2xpbmUnLCAnJyksIDEwKSB8fCAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5mb3JtYXRpb24gaHRtbCB0byBpbmZvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBodG1sIHN0cmluZyB0byBjaGFuZ2UgY29udGVudFxuICAgICAqL1xuICAgIHNldEluZm86IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kaW5mby5odG1sKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBodG1sIHRvIGNvZGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29kZSBBIGNvZGUgaHRtbCBzdHJpbmcgdG8gY2hhZ25lIGNvbnRlbnRcbiAgICAgKi9cbiAgICBzZXRDb2RlOiBmdW5jdGlvbihjb2RlKSB7XG4gICAgICAgIHRoaXMuJGNvZGUuaHRtbChjb2RlKTtcbiAgICAgICAgdGhpcy5zZXRDb2RlTGluZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBsaW5lXG4gICAgICovXG4gICAgc2V0Q29kZUxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc291cmNlLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGxpbmVOdW1iZXIsXG4gICAgICAgICAgICBsaW5lSWQsXG4gICAgICAgICAgICBsaW5lcyxcbiAgICAgICAgICAgIHRvdGFsTGluZXMsXG4gICAgICAgICAgICBhbmNob3JIYXNoLFxuICAgICAgICAgICAgbnVtYmVyO1xuICAgICAgICBwcmV0dHlQcmludCgpO1xuICAgICAgICBzb3VyY2UgPSB0aGlzLiRjb2RlLmZpbmQoJy5wcmV0dHlwcmludCcpO1xuICAgICAgICBpZiAoc291cmNlICYmIHNvdXJjZVswXSkge1xuICAgICAgICAgICAgYW5jaG9ySGFzaCA9IGRvY3VtZW50LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgbGluZXMgPSBzb3VyY2VbMF0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG4gICAgICAgICAgICB0b3RhbExpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgaSA9ICAwO1xuICAgICAgICAgICAgZm9yICg7IGkgPCB0b3RhbExpbmVzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsaW5lSWQgPSAnbGluZScgKyBpO1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldLmlkID0gbGluZUlkO1xuICAgICAgICAgICAgICAgIG51bWJlciA9IHRoaXMuZ2V0TnVtYmVyRWxlbWVudChpKTtcbiAgICAgICAgICAgICAgICBsaW5lc1tpXS5pbnNlcnRCZWZvcmUobnVtYmVyLCBsaW5lc1tpXS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAobGluZUlkID09PSBhbmNob3JIYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzW2ldLmNsYXNzTmFtZSArPSAnIHNlbGVjdGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBhIGVsZW1lbnQgdG8gZGlzcGxheSBsaW5lIG51bWJlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1cbiAgICAgKi9cbiAgICBnZXROdW1iZXJFbGVtZW50OiBmdW5jdGlvbihudW0pIHtcbiAgICAgICAgdmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHNwYW4uY2xhc3NOYW1lID0gJ251bWJlcic7XG4gICAgICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgIHNwYW4uc3R5bGUuY29sb3IgPSBcIiM2NjZcIjtcbiAgICAgICAgc3Bhbi5zdHlsZS53aWR0aCA9IFwiNDBweFwiO1xuICAgICAgICBzcGFuLmlubmVySFRNTCA9IG51bSArICcgOiAnO1xuICAgICAgICByZXR1cm4gc3BhbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRhYiBmb3Igc3RhdGUgY2hhbmdlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlIEEgc3RhdGUgdG8gY2hhZ25lIHRhYlxuICAgICAqL1xuICAgIGNoYW5nZVRhYjogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnaW5mbycpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZUluZm8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZUNvZGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCZSBlbmFibGUgaW5mbyBzdGF0ZVxuICAgICAqL1xuICAgIF9lbmFibGVJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpbmZvJztcbiAgICAgICAgdGhpcy4kaW5mby5zaG93KCk7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCZSBlbmFibGUgY29kZSBzdGF0ZVxuICAgICAqL1xuICAgIF9lbmFibGVDb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb2RlJztcbiAgICAgICAgdGhpcy4kY29kZS5zaG93KCk7XG4gICAgICAgIHRoaXMuJGluZm8uaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG1vZXRob2QgYnkgaWRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgQSBpZCB0byBtb3ZlIGJ5IGRvY3VtZW50LmxvY2F0aW9uIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIG1vdmVUbzogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24gPSBkb2N1bWVudC5VUkwuc3BsaXQoJyMnKVswXSArIGlkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGFiIGFuZCBtb3ZlIHRvIGxpbmUgKG51bWJlcilcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZSBUaGUgbnVtYmVyIG9mIGxpbmUgdG8gbW92ZVxuICAgICAqL1xuICAgIG1vdmVUb0xpbmU6IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VUYWIoJ2NvZGUnKTtcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24gPSBkb2N1bWVudC5VUkwuc3BsaXQoJyMnKVswXSArICcjbGluZScgKyBsaW5lO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oQ29udGVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRlbnQ7XG4iLCJ2YXIgdGVtcGxhdGVzID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xudmFyIGlzRGV2ZWxvcGVyID0gL2RldmVsb3Blcj10cnVlLy50ZXN0KGxvY2F0aW9uLnNlYXJjaCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIE1ldGEgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhIFRoZSBmaWxlIG1ldGEgZGF0YVxuICAgICAqL1xuICAgIGdldENvZGU6IGZ1bmN0aW9uKG1ldGEpIHtcbiAgICAgICAgdmFyIHBhdGggPSBtZXRhLnBhdGguc3BsaXQoJy9zcmMvJylbMV07XG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMvJylbMV07XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCAmJiBwYXRoLmluZGV4T2YoJ2pzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMnKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRhLmZpbGVuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnXycpICsgJ18nICsgbWV0YS5maWxlbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBsaXN0IGJ5IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBBIGRhdGEgZm9yIGxpc3RcbiAgICAgKi9cbiAgICBnZXRMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGh0bWwgPSAnJztcblxuICAgICAgICBkYXRhLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgdmFyIGZhID0gc2VsZi5nZXRQYXRoKGEubWV0YSkgKyBhLmxvbmduYW1lLFxuICAgICAgICAgICAgICAgIGZiID0gc2VsZi5nZXRQYXRoKGIubWV0YSkgKyBiLmxvbmduYW1lO1xuICAgICAgICAgICAgaWYoZmEgPCBmYikge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmEgPiBmYikge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzZWxmLmdldENvZGUoZWwubWV0YSksXG4gICAgICAgICAgICAgICAgbWVtYmVycyA9ICcnLFxuICAgICAgICAgICAgICAgIG1ldGhvZHMgPSAnJyxcbiAgICAgICAgICAgICAgICBpc0VtcHR5ID0gdHVpLnV0aWwuaXNFbXB0eSxcbiAgICAgICAgICAgICAgICB0bXBsO1xuXG4gICAgICAgICAgICBpZiAoaXNFbXB0eShlbC5tZXRob2RzKSAmJiBpc0VtcHR5KGVsLm1lbWJlcnMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWwubWVtYmVycykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZXMubGlzdC5tZW1iZXJzO1xuICAgICAgICAgICAgICAgIG1lbWJlcnMgPSBzZWxmLl9nZXRJbm5lckhUTUwoZWwubWVtYmVycywgY29kZSwgZWwubG9uZ25hbWUsIHRtcGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIHRtcGwgPSB0ZW1wbGF0ZXMubGlzdC5tZXRob2RzO1xuICAgICAgICAgICAgICAgIG1ldGhvZHMgPSBzZWxmLl9nZXRJbm5lckhUTUwoZWwubWV0aG9kcywgY29kZSwgZWwubG9uZ25hbWUsIHRtcGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBodG1sICs9IHNlbGYudGVtcGxhdGluZyh0ZW1wbGF0ZXMubGlzdC5vdXRlciwge1xuICAgICAgICAgICAgICAgIGxvbmduYW1lOiBlbC5sb25nbmFtZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICAgICAgICAgIGZ1bGxuYW1lOiBzZWxmLmdldERpcmVjdG9yeShlbC5tZXRhLCBlbC5sb25nbmFtZSksXG4gICAgICAgICAgICAgICAgbWVtYmVyczogbWVtYmVycyxcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZXRob2RzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBwYXRoXG4gICAgICogQHBhcmFtIG1ldGFcbiAgICAgKiBAcmV0dXJucyB7KnxzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0UGF0aDogZnVuY3Rpb24obWV0YSkge1xuICAgICAgICB2YXIgcGF0aCA9IG1ldGEucGF0aC5zcGxpdCgnL3NyYy8nKVsxXTtcbiAgICAgICAgaWYgKHBhdGggJiYgcGF0aC5pbmRleE9mKCdqcy8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCdqcy8nKVsxXTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCdqcycpWzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoIHx8ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmlsZSBkaXJlY3RvcnkgaW5mb1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhIFRoZSBmaWxlIG1ldGEgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIGNsYXNzXG4gICAgICovXG4gICAgZ2V0RGlyZWN0b3J5OiBmdW5jdGlvbihtZXRhLCBuYW1lKSB7XG4gICAgICAgIHZhciBwYXRoID0gdGhpcy5nZXRQYXRoKG1ldGEpO1xuICAgICAgICBpZiAoIXBhdGggfHwgbmFtZS5pbmRleE9mKCdtb2R1bGU6JykgPj0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cImRpcmVjdG9yeVwiPicgKyBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnLycpICsgJy88L3NwYW4+JyArIG5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbm5lciBodG1sXG4gICAgICogQHBhcmFtIHthcnJheX0gaXRlbXMgQW4gaXRlbSBhcnJheSB0byBhcHBseSB0ZW1wbGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIEEgY29kZSBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxvbmduYW1lIEEgZmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJvbmd9IHRtcGwgQSB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIF9nZXRJbm5lckhUTUw6IGZ1bmN0aW9uKGl0ZW1zLCBjb2RlLCBsb25nbmFtZSwgdG1wbCkge1xuICAgICAgICB2YXIgaHRtbCA9ICcnLFxuICAgICAgICAgICAgbWh0bWwgPSAnJyxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGl0ZW1zLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBpZiAobS5hY2Nlc3MgPT09ICdwcml2YXRlJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1odG1sICs9IHNlbGYudGVtcGxhdGluZyh0ZW1wbGF0ZXMubGlzdC5pbm5lciwge1xuICAgICAgICAgICAgICAgIGxvbmduYW1lOiBsb25nbmFtZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxuICAgICAgICAgICAgICAgIGlkOiBtLmlkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBtLmlkLnJlcGxhY2UoJy4nLCAnJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG1odG1sKSB7XG4gICAgICAgICAgICBodG1sICs9IHNlbGYudGVtcGxhdGluZyh0bXBsLCB7XG4gICAgICAgICAgICAgICAgaHRtbDogbWh0bWxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGVtcGxhdGUgc3RyaW5nXG4gICAgICovXG4gICAgdGVtcGxhdGluZzogZnVuY3Rpb24odG1wbCwgbWFwKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0bXBsLnJlcGxhY2UoL1xce1xceyhbXlxcfV0rKVxcfVxcfS9nLCBmdW5jdGlvbihtYXRjaGVkU3RyaW5nLCBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwW25hbWVdIHx8ICcnO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0RldmVsb3BlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc0RldmVsb3BlcjtcbiAgICB9XG59OyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaGUgRmVkb2MgZWxlbWVudFxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudC4gRkUgRGV2ZWxvcG1lbnQgdGVhbSAoZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5MS44LjMsIHR1aS1jb2RlLXNuaXBwZXRcbiAqL1xuXG52YXIgTWVudSA9IHJlcXVpcmUoJy4vbWVudScpO1xudmFyIENvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBTZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpO1xudmFyIGRvY1V0aWwgPSByZXF1aXJlKCcuL2RvY1V0aWwnKTtcblxudmFyIEZlZG9jID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tZW51ID0gbmV3IE1lbnUoe1xuICAgICAgICAgICAgZGF0YTogb3B0aW9ucy5kYXRhLm1lbnUsXG4gICAgICAgICAgICBlbGVtZW50OiBvcHRpb25zLmVsZW1lbnQubWVudSxcbiAgICAgICAgICAgIHRhYjogb3B0aW9ucy5lbGVtZW50LnRhYlxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb250ZW50ID0gbmV3IENvbnRlbnQoe1xuICAgICAgICAgICAgZWxlbWVudDogb3B0aW9ucy5lbGVtZW50LmNvbnRlbnQsXG4gICAgICAgICAgICBjb2RlRWxlbWVudDogb3B0aW9ucy5lbGVtZW50LmNvZGUsXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmRhdGEuY29udGVudFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBuZXcgU2VhcmNoKHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9wdGlvbnMuZWxlbWVudC5zZWFyY2hcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21lbnUgPSBvcHRpb25zLmRhdGEubWVudTtcbiAgICAgICAgdGhpcy5zZXRNZW51KCk7XG4gICAgICAgIHRoaXMuc2V0RXZlbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGV2ZW50c1xuICAgICAqL1xuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Lm9uKCdub3RpZnknLCB0dWkudXRpbC5iaW5kKHRoaXMuY2hhbmdlUGFnZSwgdGhpcykpO1xuICAgICAgICB0aGlzLm1lbnUub24oJ25vdGlmeScsIHR1aS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMubWVudS5vbigndGFiQ2hhbmdlJywgdHVpLnV0aWwuYmluZCh0aGlzLmNoYW5nZVRhYiwgdGhpcykpO1xuICAgICAgICB0aGlzLnNlYXJjaC5vbignc2VhcmNoJywgdHVpLnV0aWwuYmluZCh0aGlzLnNlYXJjaExpc3QsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5zZWFyY2gub24oJ25vdGlmeScsIHR1aS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB3b3JkcyBieSBsbmIgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIEEgc2VhcmNoIGRhdGFcbiAgICAgKi9cbiAgICBzZWFyY2hMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciB3b3JkID0gZGF0YS50ZXh0LFxuICAgICAgICAgICAgY2xhc3NlcyA9IHRoaXMubWVudS5nZXREYXRhKCdjbGFzc2VzJyksXG4gICAgICAgICAgICBuYW1lc3BhY2VzID0gdGhpcy5tZW51LmdldERhdGEoJ25hbWVzcGFjZXMnKSxcbiAgICAgICAgICAgIG1vZHVsZXMgPSB0aGlzLm1lbnUuZ2V0RGF0YSgnbW9kdWxlcycpLFxuICAgICAgICAgICAgaW50ZXJmYWNlcyA9IHRoaXMubWVudS5nZXREYXRhKCdpbnRlcmZhY2VzJyksXG4gICAgICAgICAgICBldmVudHMgPSB0aGlzLm1lbnUuZ2V0RGF0YSgnZXZlbnRzJyksXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChcbiAgICAgICAgICAgIHRoaXMuZmluZEluKHdvcmQsIGNsYXNzZXMpLFxuICAgICAgICAgICAgdGhpcy5maW5kSW4od29yZCwgbW9kdWxlcyksXG4gICAgICAgICAgICB0aGlzLmZpbmRJbih3b3JkLCBpbnRlcmZhY2VzKSxcbiAgICAgICAgICAgIHRoaXMuZmluZEluKHdvcmQsIG5hbWVzcGFjZXMpLFxuICAgICAgICAgICAgdGhpcy5maW5kSW4od29yZCwgZXZlbnRzKVxuICAgICAgICApO1xuICAgICAgICBpZiAoIXdvcmQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEuY2FsbGJhY2socmVzdWx0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBpbiBsbmIgYXJyYXlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIEEgc2VhcmNoIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxpc3QgQSBkYXRhIGxpc3RcbiAgICAgKi9cbiAgICBmaW5kSW46IGZ1bmN0aW9uKHN0ciwgYXJyYXkpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXJyYXksIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IGRvY1V0aWwuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGlmIChlbC5raW5kICE9PSAnZXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChlbC5tZXRob2RzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3N0b3JlTWVtYmVySWZNYXRjaGVkKHN0ciwgbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXk6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGNvZGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsLmtpbmQgPT09ICdldmVudCcpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zdG9yZU1lbWJlcklmTWF0Y2hlZChzdHIsIGVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5OiByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IGNvZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgZm9yIFNlYXJjaGluZyBhbmQgdGhpcy5maW5kSW4sXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciAtIFF1ZXJ5XG4gICAgICogQHBhcmFtIHtlbGVtZW50fSB0YXJnZXQgLSBFbGVtZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHN0YXRpY3MgLSBPYmplY3QgZm9yIHN0b3JpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zdG9yZU1lbWJlcklmTWF0Y2hlZDogZnVuY3Rpb24oc3RyLCB0YXJnZXQsIHN0YXRpY3MpIHtcbiAgICAgICAgdmFyIGlzTWF0Y2hlZCA9IHRhcmdldC5pZC5yZXBsYWNlKCcuJywgJycpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdHIudG9Mb3dlckNhc2UoKSkgIT09IC0xO1xuICAgICAgICBpZiAoaXNNYXRjaGVkKSB7XG4gICAgICAgICAgICBzdGF0aWNzLmFycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiB0YXJnZXQuaWQsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuaGlnaGxpZ2h0aW5nKHRhcmdldC5pZCwgc3RyKSxcbiAgICAgICAgICAgICAgICBncm91cDogdGFyZ2V0LmxvbmduYW1lLFxuICAgICAgICAgICAgICAgIGNvZGU6IHN0YXRpY3MuY29kZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlnaGxpZ2h0IHF1ZXJ5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmQgQSB3b3JkIHRvIHN0cmVzc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgQSBzdHJpbmcgaW5jbHVkZSB3b3JkXG4gICAgICovXG4gICAgaGlnaGxpZ2h0aW5nOiBmdW5jdGlvbih3b3JkLCBzdHIpIHtcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoc3RyLCAnaScsICdnJyksXG4gICAgICAgICAgICBvcmlnaW4gPSByZWcuZXhlYyh3b3JkKVswXTtcbiAgICAgICAgcmV0dXJuIHdvcmQucmVwbGFjZShyZWcsICc8c3Ryb25nPicgKyBvcmlnaW4gKyAnPC9zdHJvbmc+Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYWduZSBUYWJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBBIHRhYiBkYXRhXG4gICAgICovXG4gICAgY2hhbmdlVGFiOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5jaGFuZ2VUYWIoZGF0YS5zdGF0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBDb250ZW50IHBhZ2UgYnkgZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIEEgcGFnZSBkYXRhXG4gICAgICovXG4gICAgY2hhbmdlUGFnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbmFtZSA9IGRhdGEubmFtZTtcblxuICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VUYWIoe3N0YXRlOiAnaW5mbyd9KTtcbiAgICAgICAgICAgIHRoaXMubWVudS50dXJuT25JbmZvKCk7XG4gICAgICAgICAgICBpZiAobmFtZS5pbmRleE9mKCdtb2R1bGU6JykgPj0gMCkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1xcOi9nLCAnLScpLnJlcGxhY2UoL1xcLy9nLCAnXycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNldEluZm8oZmVkb2MuY29udGVudFtuYW1lICsgJy5odG1sJ10pO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFtkYXRhLmNvZGVOYW1lICsgJy5odG1sJ10pO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUbygnI2NvbnRlbnRUYWInKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5saW5lKSB7XG4gICAgICAgICAgICB0aGlzLm1lbnUudHVybk9uQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUb0xpbmUoZGF0YS5saW5lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5ocmVmKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQubW92ZVRvKGRhdGEuaHJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZW51LmZvY3VzKGRhdGEubmFtZSwgZGF0YS5jb2RlTmFtZSwgZGF0YS5pc0dsb2JhbCA/IGRhdGEuaHJlZiA6IG51bGwpO1xuICAgICAgICB0aGlzLnNlYXJjaC5yZXNldCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudSBvYmplY3QgdG8gaHRtbFxuICAgICAqL1xuICAgIHNldE1lbnU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm1lbnUuc2V0TWVudSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29udGVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEEgaHRtbCBzdHJpbmcgdG8gc2V0IGNvbnRlbnRcbiAgICAgKi9cbiAgICBzZXRDb250ZW50OiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGh0bWwpO1xuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRmVkb2M7XG4iLCJ2YXIgZG9jVXRpbCA9IHJlcXVpcmUoJy4vZG9jVXRpbCcpO1xudmFyIHRlbXBsYXRlcyA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBsZWZ0IG1lbnUgYW5kIHRhYiBtZW51IG1hbmFnZXJcbiAqIEBhdXRob3IgTkhOIEVudGVydGFpbm1lbnQuIEZFIERldmVsb3BtZW50IHRlYW0gKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeTEuOC4zLCB0dWktY29kZS1zbmlwcGV0XG4gKi9cbnZhciBNZW51ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBUaGUgb3B0aW9ucyBmb3IgbWVudVxuICAgICAqICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5lbGVtZW50IFRoZSBqcXVlcnkgd3JhcHBpbmcgb2JqZWN0IGZvciBsZWZ0IG1lbnVcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMudGFiIFRoZSBqcXVlcnkgd3JhcHBpbmcgb2JqZWN0IGZvciB0YWIgbWVudVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy4kbWVudSA9IG9wdGlvbnMuZWxlbWVudDtcbiAgICAgICAgdGhpcy4kdGFiID0gb3B0aW9ucy50YWI7XG4gICAgICAgIHRoaXMuZGF0YSA9IG9wdGlvbnMuZGF0YTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gJ21haW4nO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2luZm8nO1xuICAgICAgICB0aGlzLmNvZGVCdG4gPSB0aGlzLiR0YWIuZmluZCgnLmNvZGUnKTtcbiAgICAgICAgdGhpcy5jb2RlQnRuLmhpZGUoKTtcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuXG4gICAgICAgIHRoaXMuX3JlZmluZUV2ZW50cygpO1xuICAgICAgICBpZiAoIWRvY1V0aWwuaXNEZXZlbG9wZXIoKSkge1xuICAgICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHR5cGVkRGF0YSwga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2V2ZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhLmV2ZW50cyA9IHRoaXMuX2ZpbHRlckFQSSh0eXBlZERhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHR1aS51dGlsLmZvckVhY2godHlwZWREYXRhLCBmdW5jdGlvbihkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdHVtLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXR1bS5tZXRob2RzID0gdGhpcy5fZmlsdGVyQVBJKGRhdHVtLm1ldGhvZHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdHVtLm1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXR1bS5tZW1iZXJzID0gdGhpcy5fZmlsdGVyQVBJKGRhdHVtLm1lbWJlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHVuaXF1ZSBsaXN0cyBvZiBjdXN0b20gZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVmaW5lRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuZGF0YS5ldmVudHMsXG4gICAgICAgICAgICB0ZW1wID0ge307XG4gICAgICAgIHRoaXMuZGF0YS5ldmVudHMgPSB0dWkudXRpbC5maWx0ZXIoZXZlbnRzLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKHRlbXBbZXZlbnQubG9uZ25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wW2V2ZW50LmxvbmduYW1lXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVtYmVycyBmb3IgdXNlckFQSVxuICAgICAqICBJZiB5b3Ugd2FudCB0byBpZGVudGlmeSBhIHBhcmFtLCBydW4gb24gZGVidWcgbW9kZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWVtYmVycyAtIG1lbWJlcnNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbHRlckFQSTogZnVuY3Rpb24obWVtYmVycykge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZmlsdGVyKG1lbWJlcnMsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAobWVtYmVyLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICB0dWkudXRpbC5mb3JFYWNoKG1lbWJlci50YWdzLCBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSAodGFnLm9yaWdpbmFsVGl0bGUgPT09ICdhcGknKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudCB0byBwYWdlIG1vdmVcbiAgICAgKi9cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJG1lbnUub24oJ2NsaWNrJywgdHVpLnV0aWwuYmluZCh0aGlzLm9uQ2xpY2tNZW51LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuJHRhYi5vbignY2xpY2snLCB0dWkudXRpbC5iaW5kKHRoaXMub25DbGlja1RhYiwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUYWIgY2huYWdlIGV2ZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBKcXVlcnlFdmVudCBvYmplY3RcbiAgICAgKi9cbiAgICBvbkNsaWNrVGFiOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNDb2RlLFxuICAgICAgICAgICAgaXNTYW1wbGU7XG4gICAgICAgIGlmICh0YXJnZXQuaGFzQ2xhc3MoJ3RhYm1lbnUnKSAmJiAhdGFyZ2V0Lmhhc0NsYXNzKCdvbicpKSB7XG4gICAgICAgICAgICBpc0NvZGUgPSB0YXJnZXQuaGFzQ2xhc3MoJ2NvZGUnKTtcbiAgICAgICAgICAgIGlzU2FtcGxlID0gdGFyZ2V0Lmhhc0NsYXNzKCdzYW1wbGUnKTtcblxuICAgICAgICAgICAgaWYgKGlzU2FtcGxlKSB7XG4gICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oJ3R1dG9yaWFsLmh0bWwnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZmlyZSgndGFiQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHN0YXRlOiBpc0NvZGUgPyAnY29kZScgOiAnaW5mbydcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNDb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuT25Db2RlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybk9uSW5mbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvY3VzIG9uIHNlbGVjdGVkIG1lbnVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3BlYyBBIHNwZWNpZmljYXRpb24gaWQgdG8gZmluZFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIEEgY29kZSBsaW5lIHRvIG1vdmVcbiAgICAgKi9cbiAgICBmb2N1czogZnVuY3Rpb24oc3BlYywgY29kZSwgaHJlZikge1xuICAgICAgICBpZiAoIXNwZWMgfHwgIWNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRtZW51LmZpbmQoJy5saXN0aXRlbScpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBjaGlsZCA9IHNlbGYuZmluZCgnYVtocmVmPScgKyBocmVmICsgJ10nKTtcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBpZiAoY2hpbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGhyZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoKHNlbGYuYXR0cignZGF0YS1zcGVjJykgPT09IHNwZWMpICYmIHNlbGYuYXR0cignZGF0YS1jb2RlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb2N1cyBvbiBzcGVjaWZpY2F0aW9uIHBhZ2VcbiAgICAgKi9cbiAgICB0dXJuT25JbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnRhYm1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kdGFiLmZpbmQoJy5pbmZvJykuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZvY3VzIG9uIGNvZGUgcGFnZVxuICAgICAqL1xuICAgIHR1cm5PbkNvZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmNvZGUnKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm90aWZ5IGZvciBjaGFuZ2UgY29udGVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBBIGNsaWNrIGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uQ2xpY2tNZW51OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcHJlVGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNEaXJlY3RvcnkgPSBwcmVUYXJnZXQuaGFzQ2xhc3MoJ2RpcmVjdG9yeScpLFxuICAgICAgICAgICAgbWlkVGFyZ2V0ID0gaXNEaXJlY3RvcnkgPyBwcmVUYXJnZXQucGFyZW50KCkgOiBwcmVUYXJnZXQsXG4gICAgICAgICAgICBocmVmID0gbWlkVGFyZ2V0LmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgIHRhcmdldCA9IGhyZWYgPyBtaWRUYXJnZXQucGFyZW50KCkgOiBtaWRUYXJnZXQsXG4gICAgICAgICAgICBpc0dsb2JhbCA9IHRhcmdldC5oYXNDbGFzcygnZ2xvYmFsaXRlbScpLFxuICAgICAgICAgICAgc3BlYyA9IHRhcmdldC5hdHRyKCdkYXRhLXNwZWMnKSxcbiAgICAgICAgICAgIGNvZGUgPSB0YXJnZXQuYXR0cignZGF0YS1jb2RlJyk7XG4gICAgICAgIGlmIChpc0dsb2JhbCAmJiAhaHJlZikge1xuICAgICAgICAgICAgaHJlZiA9IHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNwZWMpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnbm90aWZ5Jywge1xuICAgICAgICAgICAgICAgIG5hbWU6IHNwZWMsXG4gICAgICAgICAgICAgICAgY29kZU5hbWU6IGNvZGUsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZixcbiAgICAgICAgICAgICAgICBpc0dsb2JhbDogaXNHbG9iYWxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb2RlQnRuLnNob3coKTtcbiAgICB9LFxuXG4gICAgZ2V0RGF0YTogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW3R5cGVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZ2VuZXJhbCBsaXN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUeXBlIG9mIGNvbnRlbnRzXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBDb250ZW50cyBodG1sXG4gICAgICovXG4gICAgZ2V0Q29udGVudHM6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGh0bWwgPSAnJyxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBsaXN0LFxuICAgICAgICAgICAgaXNFbXB0eSA9IHR1aS51dGlsLmlzRW1wdHk7XG5cbiAgICAgICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZGF0YSA9IHRoaXMuZGF0YVt0eXBlXTtcblxuICAgICAgICBpZiAoaXNFbXB0eShkYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ID0gZG9jVXRpbC5nZXRMaXN0KGRhdGEpO1xuXG4gICAgICAgIGlmIChsaXN0KSB7XG4gICAgICAgICAgICBodG1sICs9IGRvY1V0aWwudGVtcGxhdGluZyh0ZW1wbGF0ZXMubWVudSwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiB0eXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHlwZS5zdWJzdHIoMSksXG4gICAgICAgICAgICAgICAgY25hbWU6IHR5cGUsXG4gICAgICAgICAgICAgICAgbGlzdDogbGlzdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9LFxuXG4gICAgZ2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuZGF0YS5ldmVudHMsXG4gICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICBsaXN0ID0gJyc7XG5cbiAgICAgICAgaWYgKCFldmVudHMgfHwgIWV2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICB9XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goZXZlbnRzLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBkb2NVdGlsLmdldENvZGUoZWwubWV0YSk7XG4gICAgICAgICAgICBsaXN0ICs9IGRvY1V0aWwudGVtcGxhdGluZyh0ZW1wbGF0ZXMuZXZlbnRzLCB7XG4gICAgICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgICAgICBpZDogZWwuaWQsXG4gICAgICAgICAgICAgICAgbG9uZ25hbWU6IGVsLmxvbmduYW1lLFxuICAgICAgICAgICAgICAgIHNjb3BlOiBlbC5sb25nbmFtZS5zcGxpdCgnIycpWzBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGh0bWwgPSBkb2NVdGlsLnRlbXBsYXRpbmcodGVtcGxhdGVzLm1lbnUsIHtcbiAgICAgICAgICAgIHRpdGxlOiAnRXZlbnRzJyxcbiAgICAgICAgICAgIGNuYW1lOiAnZXZlbnRzJyxcbiAgICAgICAgICAgIGxpc3Q6IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZ2xvYmFsIG1lbnVzXG4gICAgICovXG4gICAgZ2V0R2xvYmFsczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBnbG9iYWxzID0gdGhpcy5kYXRhLmdsb2JhbHMsXG4gICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICBsaXN0ID0gJyc7XG5cbiAgICAgICAgaWYgKCFnbG9iYWxzIHx8ICFnbG9iYWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChnbG9iYWxzLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBkb2NVdGlsLmdldENvZGUoZWwubWV0YSk7XG4gICAgICAgICAgICBsaXN0ICs9IGRvY1V0aWwudGVtcGxhdGluZyh0ZW1wbGF0ZXMuZ2xvYmFsLCB7XG4gICAgICAgICAgICAgICAgc2NvcGU6IGVsLnNjb3BlLFxuICAgICAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICAgICAgaWQ6IGVsLmlkLFxuICAgICAgICAgICAgICAgIGxvbmduYW1lOiBlbC5sb25nbmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sID0gZG9jVXRpbC50ZW1wbGF0aW5nKHRlbXBsYXRlcy5tZW51LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0dsb2JhbHMnLFxuICAgICAgICAgICAgY25hbWU6ICdnbG9iYWxzJyxcbiAgICAgICAgICAgIGxpc3Q6IGxpc3RcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudXNcbiAgICAgKiBAdG9kbyBnZXRFdmVudHMgYW5kIG1lbnUgc2VsZWN0XG4gICAgICovXG4gICAgc2V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gJycsXG4gICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgICduYW1lc3BhY2VzJyxcbiAgICAgICAgICAgICAgICAnaW50ZXJmYWNlcydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICBodG1sICs9IHNlbGYuZ2V0Q29udGVudHModHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sICs9IHRoaXMuZ2V0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuJG1lbnUuaHRtbChodG1sKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IG1lbnUgd2l0aCBzdGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZW51IEEgc2VsZWN0ZWQgbWVudVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSBBIHRhYiBzdGF0ZW1lbnRcbiAgICAgKi9cbiAgICBzZWxlY3Q6IGZ1bmN0aW9uKG1lbnUsIHN0YXRlKSB7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG1lbnU7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSB8fCAnaW5mbyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9wZW4gc2VsZWN0ZWQgbWVudVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZW51IEEgc2VsZWN0ZWQgbWVudVxuICAgICAqL1xuICAgIG9wZW46IGZ1bmN0aW9uKG1lbnUpIHtcbiAgICAgICAgdGhpcy4kbWVudS5maW5kKCcuJyArIG1lbnUpLmFkZENsYXNzKCd1bmZvbGQnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRhYiBtZW51IGh0bWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBUaGUgaHRtbCB0byBzaG93IHVwIG9uIHBhZ2VcbiAgICAgKi9cbiAgICBzZXRUYWI6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kdGFiLmh0bWwoaHRtbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9uIHNlbGVjdGVkIHRhYlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgc2VsZWN0ZWQgdGFiIG5hbWVcbiAgICAgKi9cbiAgICB0YWJPbjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLiR0YWIucmVtb3ZlQ2xhc3MoKTtcbiAgICAgICAgdGhpcy4kdGFiLmFkZENsYXNzKCd0YWIgdGFiLScgKyBuYW1lKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKE1lbnUpO1xubW9kdWxlLmV4cG9ydHMgPSBNZW51O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBzZWFyY2ggbWFuYWdlclxuICogQGF1dGhvciBOSE4gRW50ZXJ0YWlubWVudC4gRkUgRGV2ZWxvcG1lbnQgdGVhbSAoZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5MS44LjMsIHR1aS1jb2RlLXNuaXBwZXRcbiAqL1xudmFyIFNlYXJjaCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKHtcblxuICAgIC8qKlxuICAgICAqIFNwZWNpYWwga2V5IGNvZGVcbiAgICAgKi9cbiAgICBrZXlVcDogMzgsXG4gICAga2V5RG93bjogNDAsXG4gICAgZW50ZXI6IDEzLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAgICogIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmVsZW1lbnQgQSBzZWFyY2ggZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhcHAgRmVkZWMgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCBhcHApIHtcbiAgICAgICAgdGhpcy4kZWwgPSBvcHRpb25zLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWwuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgdGhpcy4kbGlzdCA9IHRoaXMuJGVsLmZpbmQoJy5zZWFyY2hMaXN0Jyk7XG4gICAgICAgIHRoaXMuJGxpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLnJvb3QgPSBhcHA7XG4gICAgICAgIHRoaXMuX2FkZEV2ZW50KCk7XG4gICAgICAgIHRoaXMuaW5kZXggPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgRXZlbnRzXG4gICAgICovXG4gICAgX2FkZEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5wdXQub24oJ2tleXVwJywgdHVpLnV0aWwuYmluZChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGZpcnN0O1xuICAgICAgICAgICAgaWYoZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5rZXlVcCB8fCBldmVudC5rZXlDb2RlID09PSB0aGlzLmtleURvd24gfHwgZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5lbnRlcikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRsaXN0LmNzcygnZGlzcGxheScpICE9PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IHRoaXMuZW50ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhpcy4kbGlzdC5maW5kKCdsaS5vbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSB0aGlzLiRsaXN0LmZpbmQoJ2xpJykuZXEoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN1Ym1pdCh7IHRhcmdldDogc2VsZWN0ZWRbMF0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpcnN0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25TdWJtaXQoeyB0YXJnZXQ6IGZpcnN0WzBdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW0oZXZlbnQua2V5Q29kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZmluZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCBpdGVtIGJ5IGtleWJvYXJkXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgS2V5Y29kZVxuICAgICAqL1xuICAgIHNlbGVjdEl0ZW06IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICBsZW4gPSB0aGlzLiRsaXN0LmZpbmQoJ2xpJykubGVuZ3RoO1xuICAgICAgICBpZiAoIXR1aS51dGlsLmlzTnVtYmVyKHRoaXMuaW5kZXgpKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gdGhpcy5rZXlVcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCAtIDEgKyBsZW4pICUgbGVuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXggKyAxKSAlIGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRsaXN0LmZpbmQoJ2xpJykuZXEodGhpcy5pbmRleCkuYWRkQ2xhc3MoJ29uJyk7XG4gICAgICAgIHRoaXMuJGlucHV0LnZhbCh0aGlzLiRsaXN0LmZpbmQoJ2xpLm9uJykuZmluZCgnYScpLnRleHQoKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IHNlYXJjaFxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsKCcnKTtcbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLm9mZignY2xpY2snKTtcbiAgICAgICAgdGhpcy4kbGlzdC5lbXB0eSgpO1xuICAgICAgICB0aGlzLiRsaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5pbmRleCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBmb3IgY2hhbmdlIGJ5IHNlYXJjaCByZXN1bHQgbGlzdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBBIHN1Ym1pdCBldmVudCBvYmplY3RcbiAgICAgKi9cbiAgICBvblN1Ym1pdDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICBzcGVjLFxuICAgICAgICAgICAgY29kZTtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgaHJlZiA9IHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuICAgICAgICBzcGVjID0gdGFyZ2V0LmZpbmQoJ3NwYW4nKS5hdHRyKCdkYXRhLXNwZWMnKTtcbiAgICAgICAgY29kZSA9IHRhcmdldC5maW5kKCdzcGFuJykuYXR0cignZGF0YS1jb2RlJyk7XG5cbiAgICAgICAgdGhpcy5maXJlKCdub3RpZnknLCB7XG4gICAgICAgICAgICBjb2RlTmFtZTogY29kZSxcbiAgICAgICAgICAgIG5hbWU6IHNwZWMsXG4gICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGFyZ2V0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IHRoYXQgaGF2ZSB0byBleHRyYWN0XG4gICAgICovXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgJHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhZ05hbWUgIT09ICdMSScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRhcmdldCgkdGFyZ2V0LnBhcmVudCgpWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgd29yZCBieSBpbnB1dCB0ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgQSBzdHJpbmcgdG8gZmluZFxuICAgICAqL1xuICAgIGZpbmQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLiRsaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5maXJlKCdzZWFyY2gnLCB7XG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBzZWFyY2ggbGlzdFxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxpc3QgU2VhcmNoIHJlc3VsdCBsaXN0XG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbihsaXN0KSB7XG4gICAgICAgIHZhciBzdHIgPSAnJztcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgc3RyICs9ICc8bGk+PHNwYW4gZGF0YS1zcGVjPVwiJyArIGVsLmdyb3VwLnNwbGl0KCcjJylbMF0gKyAnXCIgZGF0YS1jb2RlPVwiJyArIGVsLmNvZGUgKyAnXCI+PGEgaHJlZj1cIiMnICsgZWwuaWQgKyAnXCI+JyArIGVsLmxhYmVsLnJlcGxhY2UoJy4nLCAnJykgKyAnPC9hPjxzcGFuIGNsYXNzPVwiZ3JvdXBcIj4nICsgZWwuZ3JvdXAgKyAnPC9zcGFuPjwvc3Bhbj48L2xpPic7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLiRsaXN0Lmh0bWwoc3RyKTtcbiAgICAgICAgaWYgKHN0cikge1xuICAgICAgICAgICAgdGhpcy4kbGlzdC5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLm9uKCdjbGljaycsIHR1aS51dGlsLmJpbmQodGhpcy5vblN1Ym1pdCwgdGhpcykpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU2VhcmNoKTtcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSB0ZW1wbGF0ZXMgZm9yIGh0bWxcbiAqL1xudmFyIHRlbXBsYXRlcyA9IHtcbiAgICBtZW51OiBbXG4gICAgICAgICc8aDM+e3t0aXRsZX19PC9oMz4nLFxuICAgICAgICAnPHVsIGNsYXNzPXt7Y25hbWV9fT4nLFxuICAgICAgICAne3tsaXN0fX0nLFxuICAgICAgICAnPC91bD4nXG4gICAgXS5qb2luKCcnKSxcbiAgICBnbG9iYWw6ICcnLFxuICAgIGV2ZW50czogJzxsaSBjbGFzcz1cImxpc3RpdGVtIGV2ZW50aXRlbVwiIGRhdGEtc3BlYz1cInt7c2NvcGV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+PGEgaHJlZj1cIiN7e2lkfX1cIj57e2xvbmduYW1lfX08L2E+PC9saT4nLFxuICAgIHR1dG9yaWFsczogJzxsaSBjbHNzcz1cInR1dG9yaWFsc1wiPjxhIGNsYXNzPVwidHV0b3JpYWxMaW5rXCIgaHJlZj1cInR1dG9yaWFsLXt7bmFtZX19Lmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj57e3RpdGxlfX08L2E+PC9saT4nLFxuICAgIGxpc3Q6IHtcbiAgICAgICAgb3V0ZXI6IFtcbiAgICAgICAgICAgICc8bGkgY2xhc3M9XCJsaXN0aXRlbVwiIGRhdGEtc3BlYz1cInt7bG9uZ25hbWV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+JyxcbiAgICAgICAgICAgICc8YSBocmVmPVwiI1wiPnt7ZnVsbG5hbWV9fTwvYT4nLFxuICAgICAgICAgICAgJ3t7bWVtYmVyc319JyxcbiAgICAgICAgICAgICd7e21ldGhvZHN9fScsXG4gICAgICAgICAgICAnPC9saT4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIG1ldGhvZHM6IFtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1ldGhvZHM8L3N0cm9uZz48L2Rpdj4nLFxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImlubmVyXCI+JyxcbiAgICAgICAgICAgICd7e2h0bWx9fScsXG4gICAgICAgICAgICAnPC91bD4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIG1lbWJlcnM6IFtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nLFxuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImlubmVyXCI+JyxcbiAgICAgICAgICAgICd7e2h0bWx9fScsXG4gICAgICAgICAgICAnPC91bD4nXG4gICAgICAgIF0uam9pbignJyksXG4gICAgICAgIGlubmVyOiAnPGxpIGNsYXNzPVwibWVtYmVyaXRlbVwiIGRhdGEtc3BlYz1cInt7bG9uZ25hbWV9fVwiIGRhdGEtY29kZT1cInt7Y29kZX19XCI+PGEgaHJlZj1cIiN7e2lkfX1cIj57e2xhYmVsfX08L2E+PC9saT4nXG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGVzO1xuIl19
