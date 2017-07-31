var simpleLogger = (function () {
'use strict';

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.2
 * Last Modify: 2016/8/19
 */
var Delayer = {
    _waitingQueue: [],
    _makeFunc: function _makeFunc(funcName) {
        var self = this;
        return function () {
            var args = [].slice.call(arguments, 0);
            self._waitingQueue.push({ funcName: funcName, args: args });
        };
    },
    create: function create(funcNames) {
        var delayObj = {};
        for (var i = 0, len = funcNames.length; i < len; i++) {
            var funcName = funcNames[i];
            delayObj[funcName] = this._makeFunc(funcName);
        }
        return delayObj;
    },
    execQueue: function execQueue(obj) {
        var queue = this._waitingQueue;
        for (var i = 0, item; item = queue[i]; i++) {
            var funcName = item.funcName,
                args = item.args,
                func = obj && obj[funcName];
            func && func.apply(obj, args);
        }
    },
    clearQueue: function clearQueue() {
        this._waitingQueue = [];
    }
};

var delayer = Delayer;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}



function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var jsonViewer = createCommonjsModule(function (module) {
    /**
     * JSON 对象转为可视化易读的 HTML 代码的工具类
     * Ver 1.0.0 (20160404)
     * Created by krimeshu on 2016/4/2.
     */

    var isNative = typeof process !== 'undefined' && process.version,
        stream = isNative ? commonjsRequire.call(null, 'stream') : null,
        isStream = stream && function (o) {
        return o instanceof stream;
    };

    var JSONViewer = function JSONViewer(opts) {
        var eventHandler = this._getUsefulDOM(opts.eventHandler),
            indentSize = opts.indentSize,
            expand = opts.expand,
            quoteKeys = opts.quoteKeys,
            theme = opts.theme,
            rowClass = ['json-viewer-row'];
        this._allowHtml = false;
        this.indentSize = indentSize === undefined ? 14 : indentSize | 0;
        this.expand = expand | 0;
        this.quoteKeys = !!quoteKeys;
        typeof theme === 'string' && rowClass.push('theme-' + theme);
        this.rowClass = rowClass.join(' ');
        this.setEventHandler(eventHandler);
    };

    JSONViewer.prototype = {
        allowHtml: function allowHtml() {
            this._allowHtml = true;
        },
        preventHtml: function preventHtml() {
            this._allowHtml = false;
        },
        _getUsefulDOM: function _getUsefulDOM(unknown) {
            if (this._isDOM(unknown) || unknown.length && typeof unknown.append === 'function') {
                return unknown;
            }
            return document.querySelector && document.querySelector(unknown) || document.getElementById(unknown);
        },
        _isDOM: (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? function (unknown) {
            return unknown instanceof HTMLElement;
        } : function (unknown) {
            return unknown && (typeof unknown === 'undefined' ? 'undefined' : _typeof(unknown)) === 'object' && unknown.nodeType === 1 && typeof unknown.nodeName === 'string';
        },
        _isThis: function _isThis(el, selector) {
            var _matches = el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector;
            if (_matches) {
                return _matches.call(el, selector);
            } else if (el.parentNode) {
                var nodes = el.parentNode.querySelectorAll(selector);
                for (var i = nodes.length; i--;) {
                    if (nodes[i] === el) {
                        return true;
                    }
                }return false;
            }
            return false;
        },
        _refluxToFind: function _refluxToFind(el, selector, excludeThis) {
            if (!excludeThis && this._isThis(el, selector)) {
                return el;
            } else if (el.parentNode) {
                return this._refluxToFind(el.parentNode, selector);
            } else {
                return null;
            }
        },
        // _findPrevSibling: function (elem) {
        //     while (elem = elem.previousSibling) {
        //         if (elem.nodeType === 1) {
        //             return elem;
        //         }
        //     }
        //     return null;
        // },
        _findNextSibling: function _findNextSibling(elem) {
            while (elem = elem.nextSibling) {
                if (elem.nodeType === 1) {
                    return elem;
                }
            }
            return null;
        },
        setEventHandler: function setEventHandler(eventHandler) {
            var self = this;
            if (this.eventHandler && this.eventListener) {
                this.eventHandler.removeEventListener('click', this.eventListener);
            }
            this.eventHandler = eventHandler;
            this.eventListener = function (e) {
                var target = e.target,
                    row = target && self._refluxToFind(target, '.json-viewer-row'),
                    isEmpty = row && self._isThis(row, '.empty'),
                    isCollapsed = row && self._isThis(row, '.collapsed'),
                    members = row && self._findNextSibling(row),
                    afterMembers = members && self._findNextSibling(members);
                if (!isEmpty && members && afterMembers && self._isThis(members, '.json-viewer-array-members,.json-viewer-object-members') && self._isThis(afterMembers, '.json-viewer-after-array-members,.json-viewer-after-object-members')) {
                    if (isCollapsed) {
                        row.classList.remove('collapsed');
                        members.classList.remove('collapsed');
                        afterMembers.classList.remove('collapsed');
                    } else {
                        row.classList.add('collapsed');
                        members.classList.add('collapsed');
                        afterMembers.classList.add('collapsed');
                    }
                }
            };
            this.eventHandler.addEventListener('click', this.eventListener);
        },
        toJSON: function toJSON(target, _depth, _unfinished, _isLast, _keyName) {
            var buffer = [],
                type = Object.prototype.toString.call(target),
                unfinished = _unfinished || [],
                depth = _depth | 0,
                indentSize = this.indentSize | 0,
                expand = this.expand | 0,
                rowClass = this.rowClass || 'json-viewer-row',
                allowHtml = this._allowHtml,
                isEmpty,
                collapseClass,
                child,
                baseType,
                objectType,
                i,
                l;
            if (unfinished.indexOf(target) >= 0) {
                throw new Error('Converting circular structure to JSON');
            }
            if (isStream && isStream(target)) {
                type = '[object Stream]';
            }
            unfinished.push(target);
            switch (type) {
                case '[object Function]':
                    // 函数不编码
                    break;
                case '[object String]':
                    baseType = 'string';
                    break;
                case '[object Number]':
                    baseType = 'number';
                    break;
                case '[object Boolean]':
                    baseType = 'boolean';
                    break;
                case '[object Null]':
                    baseType = 'null';
                    break;
                case '[object Undefined]':
                    baseType = 'undefined';
                    break;
                case '[object Stream]':
                    baseType = 'stream';
                    break;
                case '[object Array]':
                    isEmpty = target.length ? '' : ' empty';
                    collapseClass = expand > 0 && depth >= expand || isEmpty ? ' collapsed' : '';
                    buffer.push('<div class="' + rowClass + collapseClass + isEmpty + '">');
                    _keyName && this._tryPrependKey(buffer, _keyName);
                    buffer.push('<div class="json-viewer-bracket">[</div>');
                    buffer.push('<div class="json-viewer-collapse-tag json-viewer-ellipsis">...</div>');
                    buffer.push('<div class="json-viewer-collapse-tag json-viewer-bracket">]</div>');
                    buffer.push('</div>'); // <div class="json-viewer-row">
                    buffer.push('<div class="json-viewer-array-members' + collapseClass + '" style="padding-left:' + indentSize + 'px;">');
                    for (i = 0, l = target.length - 1; i <= l; i++) {
                        child = this.toJSON(target[i], depth + 1, unfinished, i < l);
                        buffer.push(child);
                    }
                    buffer.push('</div>'); // <div class="json-viewer-array-members">
                    buffer.push('<div class="json-viewer-after-array-members ' + rowClass + collapseClass + '">');
                    buffer.push('<div class="json-viewer-bracket">]</div>');
                    if (_isLast) {
                        buffer.push('<div class="json-viewer-comma">, </div>');
                    }
                    buffer.push('</div>'); // <div class="json-viewer-row">
                    break;
                case '[object Object]':
                    objectType = true;
                    break;
                default:
                    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object') {
                        objectType = true;
                    } else {
                        baseType = 'value';
                    }
                    break;
            }
            if (objectType) {
                var keys = [];
                for (var k in target) {
                    if (target.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                // Error 特殊处理
                if (target.message && keys.indexOf('message') < 0 && !Object.getOwnPropertyDescriptor(target, 'message').enumerable) {
                    keys.splice(0, 0, 'message');
                }
                isEmpty = keys.length ? '' : ' empty';
                collapseClass = expand > 0 && depth >= expand || isEmpty ? ' collapsed' : '';
                buffer.push('<div class="' + rowClass + collapseClass + isEmpty + '">');
                _keyName && this._tryPrependKey(buffer, _keyName);
                buffer.push('<div class="json-viewer-bracket">{</div>');
                buffer.push('<div class="json-viewer-collapse-tag json-viewer-ellipsis">...</div>');
                buffer.push('<div class="json-viewer-collapse-tag json-viewer-bracket">}</div>');
                buffer.push('</div>'); // <div class="json-viewer-row">
                buffer.push('<div class="json-viewer-object-members' + collapseClass + '" style="padding-left:' + indentSize + 'px;">');
                for (i = 0, l = keys.length - 1; i <= l; i++) {
                    k = keys[i];
                    child = this.toJSON(target[k], depth + 1, unfinished, i < l, k);
                    buffer.push(child);
                }
                buffer.push('</div>'); // <div class="json-viewer-object-members">
                buffer.push('<div class="json-viewer-after-object-members ' + rowClass + collapseClass + '">');
                buffer.push('<div class="json-viewer-bracket">}</div>');
                if (_isLast) {
                    buffer.push('<div class="json-viewer-comma">, </div>');
                }
                buffer.push('</div>'); // <div class="json-viewer-row">
            }
            if (baseType) {
                buffer.push('<div class="' + rowClass + '">');
                _keyName && this._tryPrependKey(buffer, _keyName);
                buffer.push('<div class="json-viewer-' + baseType + '">');
                if (baseType === 'string') {
                    buffer.push('"');
                    if (!allowHtml) {
                        target = target.replace(/</g, '&lt;');
                    }
                    buffer.push(target.replace(/"/g, '\\"'));
                    buffer.push('"');
                } else if (baseType === 'stream') {
                    buffer.push('Stream');
                } else {
                    target = String(target);
                    if (!allowHtml) {
                        target = target.replace(/</g, '&lt;');
                    }
                    buffer.push(target);
                }
                buffer.push('</div>');
                if (_isLast) {
                    buffer.push('<div class="json-viewer-comma">, </div>');
                }
                buffer.push('</div>'); // <div class="json-viewer-row">
            }
            unfinished.pop();
            return buffer.join('');
        },
        _tryPrependKey: function _tryPrependKey(buffer, key) {
            var quoteKeys = !!this.quoteKeys;
            buffer.push('<div class="json-viewer-key">');
            quoteKeys && buffer.push('"');
            buffer.push(quoteKeys ? key.replace(/"/g, '\\"') : key);
            quoteKeys && buffer.push('"');
            buffer.push('</div><div class="json-viewer-comma">: </div>');
        }
    };

    if (typeof commonjsRequire !== 'undefined') {
        module.exports = JSONViewer;
    }
});

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.2
 * Last Modify: 2016/8/19
 */
var styleText = '.json-viewer-row {\r\n    cursor: default;\r\n    color: #545353;\r\n    margin: 2px 0;\r\n}\r\n\r\n.json-viewer-ellipsis {\r\n    background: #C0C0C0;\r\n    padding: 0 6px;\r\n    margin: 0 2px;\r\n    border-radius: 3px;\r\n}\r\n\r\n.json-viewer-array-members.collapsed,\r\n.json-viewer-after-array-members.collapsed,\r\n.json-viewer-object-members.collapsed,\r\n.json-viewer-after-object-members.collapsed {\r\n    display: none;\r\n}\r\n\r\n.json-viewer-bracket, .json-viewer-colon, .json-viewer-comma {\r\n    margin: 0 2px;\r\n}\r\n\r\n.json-viewer-row .json-viewer-collapse-tag {\r\n    display: none;\r\n}\r\n\r\n.json-viewer-row.collapsed .json-viewer-collapse-tag {\r\n    display: inline;\r\n}\r\n\r\n.json-viewer-row.empty .json-viewer-collapse-tag.json-viewer-ellipsis {\r\n    display: none;\r\n}\r\n\r\n.json-viewer-row.empty .json-viewer-collapse-tag.json-viewer-bracket {\r\n    display: inline;\r\n}\r\n\r\n.json-viewer-bracket,\r\n.json-viewer-key,\r\n.json-viewer-colon,\r\n.json-viewer-comma,\r\n.json-viewer-string,\r\n.json-viewer-number,\r\n.json-viewer-boolean,\r\n.json-viewer-null,\r\n.json-viewer-undefined,\r\n.json-viewer-stream {\r\n    display: inline;\r\n}\r\n\r\n.json-viewer-key, .json-viewer-string {\r\n    color: #036A07;\r\n}\r\n\r\n.json-viewer-number {\r\n    color: #0000CD;\r\n}\r\n\r\n.json-viewer-boolean, .json-viewer-null, .json-viewer-undefined {\r\n    color: #585CF6;\r\n}\r\n\r\n.json-viewer-stream {\r\n    background: #C0C0C0;\r\n    padding: 0 6px;\r\n    margin: 0 2px;\r\n    border-radius: 3px;\r\n}\r\n\r\n/****************************************/\r\n\r\n.json-viewer-row.theme-dark {\r\n    color: #DEDEDE;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-ellipsis {\r\n    background: #666666;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-key {\r\n    color: #74AA04;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-string {\r\n    color: #CCCC81;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-number {\r\n    color: #4178B3;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-boolean,\r\n.json-viewer-row.theme-dark .json-viewer-null,\r\n.json-viewer-row.theme-dark .json-viewer-undefined {\r\n    color: #CC7832;\r\n}\r\n\r\n.json-viewer-stream {\r\n    background: #666666;\r\n}\r\n';

var Logger = {
    logList: null,
    nextId: null,
    _console: null,
    _allowHtml: false,
    _autoFocus: false,
    allowHtml: function allowHtml() {
        this._allowHtml = true;
        this.jsonViewer.allowHtml();
    },
    preventHtml: function preventHtml() {
        this._allowHtml = false;
        this.jsonViewer.preventHtml();
    },
    bindConsole: function bindConsole(console) {
        this._console = console;
    },
    _copyToConsole: function _copyToConsole(funcName, args) {
        var console = this._console,
            func = console && console[funcName];
        func && func.apply(console, args);
    },
    clear: function clear() {
        var logList = this.logList;
        logList.innerHTML = '';
    },
    useId: function useId(id) {
        this.nextId = id;
        return this;
    },
    genUniqueId: function genUniqueId() {
        var id = this._generateId();
        while (document.getElementById(id)) {
            id = this._generateId();
        }
        return id;
    },
    _generateId: function _generateId() {
        return '_log_text_' + new Date().getTime() + Math.random();
    },
    log: function log() {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'literal'
        });
        this._copyToConsole('log', arguments);
    },
    info: function info() {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'info'
        });
        this._copyToConsole('info', arguments);
    },
    warn: function warn() {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'warn'
        });
        this._copyToConsole('warn', arguments);
    },
    error: function error() {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'error'
        });
    },
    _append: function _append(item) {
        var logList = this.logList,
            nextId = this.nextId || '',
            existed = nextId && document.getElementById(nextId);
        this.nextId = null;
        var li = existed || document.createElement('li');
        li.innerHTML = item.text;
        li.className = item.type;
        if (!existed) {
            li.id = nextId;
            logList.appendChild(li);
            this._autoFocus && window.setTimeout(function () {
                li.scrollIntoView();
                li = null;
            }, 10);
        }
    },
    _format: function _format(args) {
        var formatStr = this._stringify(args[0]),
            formats = formatStr.split('%');

        var offset = 1,
            type,
            arg;

        var res = [];
        res.push(formats[0]);
        if (formats.length > 1) {
            for (var i = offset, f; f = formats[i]; i++, offset++) {
                type = f[0];
                arg = args[offset];
                switch (type) {
                    case '%':
                        res.push('%');
                        break;
                    case 'c':
                        res.push('</span><span style="' + this._stringify(arg) + '">');
                        break;
                    case 'd':
                    case 'i':
                        try {
                            res.push(String(parseInt(arg)));
                        } catch (ex) {
                            res.push('NaN');
                        }
                        break;
                    case 'f':
                        try {
                            res.push(String(parseFloat(arg)));
                        } catch (ex) {
                            res.push('NaN');
                        }
                        break;
                    case 's':
                        try {
                            res.push(this._stringify(arg));
                        } catch (ex) {
                            res.push('');
                        }
                        break;
                    case 'O':
                    case 'o':
                        try {
                            res.push(this._stringify(arg));
                        } catch (ex) {
                            res.push('');
                        }
                        break;
                }
                res.push(f.substr(1));
            }
        }
        for (var len = args.length, restArg; offset < len; offset++) {
            restArg = args[offset];
            res.push(' ');
            res.push(this._stringify(restArg));
        }
        res = '<span>' + res.join('') + '</span>';
        res = res.replace(/\n/g, '<br/>');
        return res;
    },
    _stringify: function _stringify(arg) {
        var allowHtml = this._allowHtml;
        if (arg instanceof Date) {
            return String(arg);
        }
        var type = typeof arg === 'undefined' ? 'undefined' : _typeof(arg);
        switch (type) {
            case 'string':
                if (!allowHtml) {
                    arg = arg.replace(/</g, '&lt;');
                }
                return arg;
            case 'object':
                return this.jsonViewer.toJSON(arg);
            default:
                return String(arg);
        }
    },
    _init: function _init(opts) {
        this.logList = opts.logList;
        this.jsonViewer = new jsonViewer(opts);

        var style = document.createElement('STYLE');
        style.setAttribute('type', 'text/css');
        style.innerHTML = styleText;
        document.body.appendChild(style);
    }
};

var logger = Logger;

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.2
 * Last Modify: 2016/8/19
 */
var DragOrClick = function DragOrClick(obj) {
    var _this = this;
    obj.addEventListener('touchstart', function (e) {
        _this.touchStart(e);
    });
    obj.addEventListener('touchmove', function (e) {
        _this.touchMove(e);
    });
    obj.addEventListener('touchend', function (e) {
        _this.touchEnd(e);
    });
    _this.obj = obj;
    _this.callbacks = {};
};

DragOrClick.getTouchPos = function (e) {
    var t = e.touches ? e.touches[0] : e;
    if (!t) {
        return null;
    }
    var x = t.pageX || t.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
    var y = t.pageY || t.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
    return {
        x: x,
        y: y
    };
};

DragOrClick.getViewportDimension = function () {
    var e = window,
        a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { w: e[a + 'Width'], h: e[a + 'Height'] };
};

DragOrClick.prototype.touchStart = function (e) {
    var obj = this.obj;
    var pos = DragOrClick.getTouchPos(e);
    if (!pos) {
        return;
    }
    this.touchEndPos = pos;
    this.touchStartTime = new Date().getTime();
    this.touchStartPos = this.touchEndPos = pos;

    var oldRect = obj.getBoundingClientRect();
    this.oldPos = {
        x: oldRect.left,
        y: oldRect.top
    };
    var dim = DragOrClick.getViewportDimension(),
        rect = obj.getBoundingClientRect();
    this.limit = {
        x: dim.w - (rect.right - rect.left),
        y: dim.h - (rect.bottom - rect.top)
    };
    e.preventDefault();
};

DragOrClick.prototype.setObjPos = function (newPos) {
    var obj = this.obj;
    if (newPos.x < 0) {
        newPos.x = 0;
    }
    if (newPos.x > this.limit.x) {
        newPos.x = this.limit.x;
    }
    if (newPos.y < 0) {
        newPos.y = 0;
    }
    if (newPos.y > this.limit.y) {
        newPos.y = this.limit.y;
    }
    obj.style.left = newPos.x + 'px';
    obj.style.top = newPos.y + 'px';
};

DragOrClick.prototype.touchMove = function (e) {
    var pos = DragOrClick.getTouchPos(e);
    if (!pos) {
        return;
    }
    this.touchEndPos = pos;

    var dx = this.touchEndPos.x - this.touchStartPos.x,
        dy = this.touchEndPos.y - this.touchStartPos.y;
    var newPos = {
        x: this.oldPos.x + dx,
        y: this.oldPos.y + dy
    };
    this.setObjPos(newPos);
};

DragOrClick.prototype.touchEnd = function (e) {
    this.touchEndTime = new Date().getTime();

    var touchTimeSpan = this.touchEndTime - this.touchStartTime,
        touchMoveDis = Math.pow(this.touchEndPos.x - this.touchStartPos.x, 2) + Math.pow(this.touchEndPos.y - this.touchStartPos.y, 2);
    if (touchTimeSpan > 25 && touchTimeSpan < 250 && touchMoveDis < 2500) {
        this.trigger('click', e);
    }
};

DragOrClick.prototype.on = function (type, callback) {
    var callbacks = this.callbacks[type];
    if (Object.prototype.toString.call(callbacks) != '[object Array]') {
        this.callbacks[type] = callbacks = [];
    }
    callbacks.push(callback);
};
DragOrClick.prototype.trigger = function (type, e) {
    var callbacks = this.callbacks[type];
    if (Object.prototype.toString.call(callbacks) != '[object Array]') {
        return;
    }
    for (var i = 0, callback; callback = callbacks[i]; i++) {
        if (typeof callback == 'function') {
            callback(e);
        }
    }
};

var dragOrClick = DragOrClick;

var sourcemappedStacktrace_min = createCommonjsModule(function (module, exports) {
  /*
   * sourcemapped-stacktrace.js
   * created by James Salter <iteration@gmail.com> (2014)
   *
   * https://github.com/novocaine/sourcemapped-stacktrace
   *
   * Licensed under the New BSD license. See LICENSE or:
   * http://opensource.org/licenses/BSD-3-Clause
   */
  (function (q, f) {
    module.exports = f();
  })(commonjsGlobal, function () {
    return function (q) {
      function f(c) {
        if (k[c]) return k[c].exports;var g = k[c] = { exports: {}, id: c, loaded: !1 };q[c].call(g.exports, g, g.exports, f);g.loaded = !0;return g.exports;
      }var k = {};f.m = q;f.c = k;f.p = "";return f(0);
    }([function (q, f, k) {
      var c, g;!(c = [k(1)], g = function (c) {
        function g(a) {
          return (a = String(a).match(-1 < navigator.userAgent.toLowerCase().indexOf("chrome") || document.documentMode && 11 <= document.documentMode ? / +at +([^ ]*).*/ : /([^@]*)@.*/)) && a[1];
        }function e() {
          for (var b = !1, d = 0; d < a.length; d++) {
            try {
              b = a[d]();
            } catch (p) {
              continue;
            }break;
          }return b;
        }var f = {},
            m = function m(a, d) {
          this.sem = 0;this.mapForUri = d && d.cacheGlobally ? f : {};this.done = a;
        };m.prototype.fetchScript = function (a) {
          if (!(a in this.mapForUri)) {
            this.sem++;this.mapForUri[a] = null;var b = e(),
                p = this;b.onreadystatechange = function (b) {
              p.onScriptLoad.call(p, b, a);
            };b.open("GET", a, !0);b.send();
          }
        };var n = /^(?:[a-z]+:)?\/\//i;m.prototype.onScriptLoad = function (a, d) {
          if (4 === a.target.readyState) {
            if (200 === a.target.status || "file://" === d.slice(0, 7) && 0 === a.target.status) {
              var b = a.target.responseText.match("//# [s]ourceMappingURL=(.*)[\\s]*$", "m");if (b && 2 === b.length) {
                var g = b[1];if ((b = g.match("data:application/json;(charset=[^;]+;)?base64,(.*)")) && b[2]) this.mapForUri[d] = new c.SourceMapConsumer(atob(b[2])), this.done(this.mapForUri);else {
                  n.test(g) || (b = d.lastIndexOf("/"), -1 !== b && (b = d.slice(0, b + 1), g = b + g));var h = e(),
                      f = this;h.onreadystatechange = function () {
                    if (4 === h.readyState) {
                      f.sem--;if (200 === h.status || "file://" === g.slice(0, 7) && 0 === h.status) f.mapForUri[d] = new c.SourceMapConsumer(h.responseText);0 === f.sem && f.done(f.mapForUri);
                    }
                  };h.open("GET", g, !0);h.send();
                }
              } else this.sem--;
            } else this.sem--;0 === this.sem && this.done(this.mapForUri);
          }
        };var k = function k(a, d, p, c) {
          return "    at " + (c ? c : "(unknown)") + " (" + a + ":" + d + ":" + p + ")";
        },
            a = [function () {
          return new XMLHttpRequest();
        }, function () {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, function () {
          return new ActiveXObject("Msxml3.XMLHTTP");
        }, function () {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }];return { mapStackTrace: function mapStackTrace(a, d, p) {
            var b = {},
                c = new m(function () {
              for (var a = n, p = c.mapForUri, e = [], f, h = 0; h < a.length; h++) {
                if (f = b[h]) {
                  var x = f[1],
                      m = parseInt(f[2], 10),
                      D = parseInt(f[3], 10);(f = p[x]) ? (x = f.originalPositionFor({ line: m, column: D }), e.push(k(x.source, x.line, x.column, x.name || g(a[h])))) : e.push(k(x, m, D, g(a[h])));
                } else e.push(a[h]);
              }d(e);
            }, p);if (-1 < navigator.userAgent.toLowerCase().indexOf("chrome") || document.documentMode && 11 <= document.documentMode) {
              var e = /^ +at.+\((.*):([0-9]+):([0-9]+)/;var h = 4;var f = 1;
            } else if (-1 < navigator.userAgent.toLowerCase().indexOf("firefox") || -1 < navigator.userAgent.toLowerCase().indexOf("safari")) e = /@(.*):([0-9]+):([0-9]+)/, h = 4, f = 0;else throw Error("unknown browser :(");var n = a.split("\n").slice(f);for (a = 0; a < n.length; a++) {
              f = n[a], p && p.filter && !p.filter(f) || (f = f.match(e)) && f.length === h && (b[a] = f, f = f[1], f.match(/<anonymous>/) || c.fetchScript(f));
            }0 === c.sem && c.done(c.mapForUri);
          } };
      }.apply(f, c), void 0 !== g && (q.exports = g));
    }, function (q, f, k) {
      function c(a) {
        var b = a;"string" === typeof a && (b = JSON.parse(a.replace(/^\)\]\}'/, "")));return null != b.sections ? new h(b) : new g(b);
      }function g(a) {
        var b = a;"string" === typeof a && (b = JSON.parse(a.replace(/^\)\]\}'/, "")));a = e.getArg(b, "version");var d = e.getArg(b, "sources"),
            p = e.getArg(b, "names", []),
            c = e.getArg(b, "sourceRoot", null),
            g = e.getArg(b, "sourcesContent", null),
            f = e.getArg(b, "mappings"),
            b = e.getArg(b, "file", null);if (a != this._version) throw Error("Unsupported version: " + a);d = d.map(String).map(e.normalize).map(function (a) {
          return c && e.isAbsolute(c) && e.isAbsolute(a) ? e.relative(c, a) : a;
        });this._names = m.fromArray(p.map(String), !0);this._sources = m.fromArray(d, !0);this.sourceRoot = c;this.sourcesContent = g;this._mappings = f;this.file = b;
      }function n() {
        this.generatedColumn = this.generatedLine = 0;this.name = this.originalColumn = this.originalLine = this.source = null;
      }function h(a) {
        var b = a;"string" === typeof a && (b = JSON.parse(a.replace(/^\)\]\}'/, "")));a = e.getArg(b, "version");b = e.getArg(b, "sections");
        if (a != this._version) throw Error("Unsupported version: " + a);this._sources = new m();this._names = new m();var d = { line: -1, column: 0 };this._sections = b.map(function (a) {
          if (a.url) throw Error("Support for url field in sections not implemented.");var b = e.getArg(a, "offset"),
              p = e.getArg(b, "line"),
              g = e.getArg(b, "column");if (p < d.line || p === d.line && g < d.column) throw Error("Section offsets must be ordered and non-overlapping.");d = b;return { generatedOffset: { generatedLine: p + 1, generatedColumn: g + 1 }, consumer: new c(e.getArg(a, "map")) };
        });
      }
      var e = k(2),
          l = k(3),
          m = k(4).ArraySet,
          r = k(5),
          v = k(7).quickSort;c.fromSourceMap = function (a) {
        return g.fromSourceMap(a);
      };c.prototype._version = 3;c.prototype.__generatedMappings = null;Object.defineProperty(c.prototype, "_generatedMappings", { get: function get() {
          this.__generatedMappings || this._parseMappings(this._mappings, this.sourceRoot);return this.__generatedMappings;
        } });c.prototype.__originalMappings = null;Object.defineProperty(c.prototype, "_originalMappings", { get: function get() {
          this.__originalMappings || this._parseMappings(this._mappings, this.sourceRoot);return this.__originalMappings;
        } });c.prototype._charIsMappingSeparator = function (a, b) {
        var d = a.charAt(b);return ";" === d || "," === d;
      };c.prototype._parseMappings = function (a, b) {
        throw Error("Subclasses must implement _parseMappings");
      };c.GENERATED_ORDER = 1;c.ORIGINAL_ORDER = 2;c.GREATEST_LOWER_BOUND = 1;c.LEAST_UPPER_BOUND = 2;c.prototype.eachMapping = function (a, b, d) {
        b = b || null;switch (d || c.GENERATED_ORDER) {case c.GENERATED_ORDER:
            d = this._generatedMappings;break;case c.ORIGINAL_ORDER:
            d = this._originalMappings;
            break;default:
            throw Error("Unknown order of iteration.");}var p = this.sourceRoot;d.map(function (a) {
          var b = null === a.source ? null : this._sources.at(a.source);null != b && null != p && (b = e.join(p, b));return { source: b, generatedLine: a.generatedLine, generatedColumn: a.generatedColumn, originalLine: a.originalLine, originalColumn: a.originalColumn, name: null === a.name ? null : this._names.at(a.name) };
        }, this).forEach(a, b);
      };c.prototype.allGeneratedPositionsFor = function (a) {
        var b = e.getArg(a, "line"),
            d = { source: e.getArg(a, "source"), originalLine: b,
          originalColumn: e.getArg(a, "column", 0) };null != this.sourceRoot && (d.source = e.relative(this.sourceRoot, d.source));if (!this._sources.has(d.source)) return [];d.source = this._sources.indexOf(d.source);var p = [],
            d = this._findMapping(d, this._originalMappings, "originalLine", "originalColumn", e.compareByOriginalPositions, l.LEAST_UPPER_BOUND);if (0 <= d) {
          var c = this._originalMappings[d];if (void 0 === a.column) for (b = c.originalLine; c && c.originalLine === b;) {
            p.push({ line: e.getArg(c, "generatedLine", null), column: e.getArg(c, "generatedColumn", null), lastColumn: e.getArg(c, "lastGeneratedColumn", null) }), c = this._originalMappings[++d];
          } else for (a = c.originalColumn; c && c.originalLine === b && c.originalColumn == a;) {
            p.push({ line: e.getArg(c, "generatedLine", null), column: e.getArg(c, "generatedColumn", null), lastColumn: e.getArg(c, "lastGeneratedColumn", null) }), c = this._originalMappings[++d];
          }
        }return p;
      };f.SourceMapConsumer = c;g.prototype = Object.create(c.prototype);g.prototype.consumer = c;g.fromSourceMap = function (a) {
        var b = Object.create(g.prototype),
            d = b._names = m.fromArray(a._names.toArray(), !0),
            c = b._sources = m.fromArray(a._sources.toArray(), !0);b.sourceRoot = a._sourceRoot;b.sourcesContent = a._generateSourcesContent(b._sources.toArray(), b.sourceRoot);b.file = a._file;a = a._mappings.toArray().slice();for (var f = b.__generatedMappings = [], h = b.__originalMappings = [], k = 0, l = a.length; k < l; k++) {
          var r = a[k],
              w = new n();w.generatedLine = r.generatedLine;w.generatedColumn = r.generatedColumn;r.source && (w.source = c.indexOf(r.source), w.originalLine = r.originalLine, w.originalColumn = r.originalColumn, r.name && (w.name = d.indexOf(r.name)), h.push(w));f.push(w);
        }v(b.__originalMappings, e.compareByOriginalPositions);return b;
      };g.prototype._version = 3;Object.defineProperty(g.prototype, "sources", { get: function get() {
          return this._sources.toArray().map(function (a) {
            return null != this.sourceRoot ? e.join(this.sourceRoot, a) : a;
          }, this);
        } });g.prototype._parseMappings = function (a, b) {
        for (var d = 1, c = 0, g = 0, f = 0, h = 0, k = 0, m = a.length, l = 0, q = {}, A = {}, B = [], C = [], t, z, u, y, E; l < m;) {
          if (";" === a.charAt(l)) d++, l++, c = 0;else if ("," === a.charAt(l)) l++;else {
            t = new n();t.generatedLine = d;for (y = l; y < m && !this._charIsMappingSeparator(a, y); y++) {}z = a.slice(l, y);if (u = q[z]) l += z.length;else {
              for (u = []; l < y;) {
                r.decode(a, l, A), E = A.value, l = A.rest, u.push(E);
              }if (2 === u.length) throw Error("Found a source, but no line and column");if (3 === u.length) throw Error("Found a source and line, but no column");q[z] = u;
            }t.generatedColumn = c + u[0];c = t.generatedColumn;1 < u.length && (t.source = h + u[1], h += u[1], t.originalLine = g + u[2], g = t.originalLine, t.originalLine += 1, t.originalColumn = f + u[3], f = t.originalColumn, 4 < u.length && (t.name = k + u[4], k += u[4]));C.push(t);"number" === typeof t.originalLine && B.push(t);
          }
        }v(C, e.compareByGeneratedPositionsDeflated);this.__generatedMappings = C;v(B, e.compareByOriginalPositions);this.__originalMappings = B;
      };g.prototype._findMapping = function (a, b, d, c, e, g) {
        if (0 >= a[d]) throw new TypeError("Line must be greater than or equal to 1, got " + a[d]);if (0 > a[c]) throw new TypeError("Column must be greater than or equal to 0, got " + a[c]);return l.search(a, b, e, g);
      };g.prototype.computeColumnSpans = function () {
        for (var a = 0; a < this._generatedMappings.length; ++a) {
          var b = this._generatedMappings[a];if (a + 1 < this._generatedMappings.length) {
            var d = this._generatedMappings[a + 1];if (b.generatedLine === d.generatedLine) {
              b.lastGeneratedColumn = d.generatedColumn - 1;continue;
            }
          }b.lastGeneratedColumn = Infinity;
        }
      };g.prototype.originalPositionFor = function (a) {
        var b = { generatedLine: e.getArg(a, "line"), generatedColumn: e.getArg(a, "column") };a = this._findMapping(b, this._generatedMappings, "generatedLine", "generatedColumn", e.compareByGeneratedPositionsDeflated, e.getArg(a, "bias", c.GREATEST_LOWER_BOUND));
        if (0 <= a && (a = this._generatedMappings[a], a.generatedLine === b.generatedLine)) {
          b = e.getArg(a, "source", null);null !== b && (b = this._sources.at(b), null != this.sourceRoot && (b = e.join(this.sourceRoot, b)));var d = e.getArg(a, "name", null);null !== d && (d = this._names.at(d));return { source: b, line: e.getArg(a, "originalLine", null), column: e.getArg(a, "originalColumn", null), name: d };
        }return { source: null, line: null, column: null, name: null };
      };g.prototype.hasContentsOfAllSources = function () {
        return this.sourcesContent ? this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function (a) {
          return null == a;
        }) : !1;
      };g.prototype.sourceContentFor = function (a, b) {
        if (!this.sourcesContent) return null;null != this.sourceRoot && (a = e.relative(this.sourceRoot, a));if (this._sources.has(a)) return this.sourcesContent[this._sources.indexOf(a)];var d;if (null != this.sourceRoot && (d = e.urlParse(this.sourceRoot))) {
          var c = a.replace(/^file:\/\//, "");if ("file" == d.scheme && this._sources.has(c)) return this.sourcesContent[this._sources.indexOf(c)];if ((!d.path || "/" == d.path) && this._sources.has("/" + a)) return this.sourcesContent[this._sources.indexOf("/" + a)];
        }if (b) return null;throw Error('"' + a + '" is not in the SourceMap.');
      };g.prototype.generatedPositionFor = function (a) {
        var b = e.getArg(a, "source");null != this.sourceRoot && (b = e.relative(this.sourceRoot, b));if (!this._sources.has(b)) return { line: null, column: null, lastColumn: null };b = this._sources.indexOf(b);b = { source: b, originalLine: e.getArg(a, "line"), originalColumn: e.getArg(a, "column") };a = this._findMapping(b, this._originalMappings, "originalLine", "originalColumn", e.compareByOriginalPositions, e.getArg(a, "bias", c.GREATEST_LOWER_BOUND));return 0 <= a && (a = this._originalMappings[a], a.source === b.source) ? { line: e.getArg(a, "generatedLine", null), column: e.getArg(a, "generatedColumn", null), lastColumn: e.getArg(a, "lastGeneratedColumn", null) } : { line: null, column: null, lastColumn: null };
      };f.BasicSourceMapConsumer = g;h.prototype = Object.create(c.prototype);h.prototype.constructor = c;h.prototype._version = 3;Object.defineProperty(h.prototype, "sources", { get: function get() {
          for (var a = [], b = 0; b < this._sections.length; b++) {
            for (var d = 0; d < this._sections[b].consumer.sources.length; d++) {
              a.push(this._sections[b].consumer.sources[d]);
            }
          }return a;
        } });h.prototype.originalPositionFor = function (a) {
        var b = { generatedLine: e.getArg(a, "line"), generatedColumn: e.getArg(a, "column") },
            d = l.search(b, this._sections, function (a, b) {
          var d = a.generatedLine - b.generatedOffset.generatedLine;return d ? d : a.generatedColumn - b.generatedOffset.generatedColumn;
        });return (d = this._sections[d]) ? d.consumer.originalPositionFor({ line: b.generatedLine - (d.generatedOffset.generatedLine - 1), column: b.generatedColumn - (d.generatedOffset.generatedLine === b.generatedLine ? d.generatedOffset.generatedColumn - 1 : 0), bias: a.bias }) : { source: null, line: null, column: null, name: null };
      };h.prototype.hasContentsOfAllSources = function () {
        return this._sections.every(function (a) {
          return a.consumer.hasContentsOfAllSources();
        });
      };h.prototype.sourceContentFor = function (a, b) {
        for (var d = 0; d < this._sections.length; d++) {
          var c = this._sections[d].consumer.sourceContentFor(a, !0);if (c) return c;
        }if (b) return null;
        throw Error('"' + a + '" is not in the SourceMap.');
      };h.prototype.generatedPositionFor = function (a) {
        for (var b = 0; b < this._sections.length; b++) {
          var d = this._sections[b];if (-1 !== d.consumer.sources.indexOf(e.getArg(a, "source"))) {
            var c = d.consumer.generatedPositionFor(a);if (c) return { line: c.line + (d.generatedOffset.generatedLine - 1), column: c.column + (d.generatedOffset.generatedLine === c.line ? d.generatedOffset.generatedColumn - 1 : 0) };
          }
        }return { line: null, column: null };
      };h.prototype._parseMappings = function (a, b) {
        this.__generatedMappings = [];this.__originalMappings = [];for (var c = 0; c < this._sections.length; c++) {
          for (var g = this._sections[c], f = g.consumer._generatedMappings, h = 0; h < f.length; h++) {
            var k = f[h],
                l = g.consumer._sources.at(k.source);null !== g.consumer.sourceRoot && (l = e.join(g.consumer.sourceRoot, l));this._sources.add(l);var l = this._sources.indexOf(l),
                m = g.consumer._names.at(k.name);this._names.add(m);m = this._names.indexOf(m);k = { source: l, generatedLine: k.generatedLine + (g.generatedOffset.generatedLine - 1), generatedColumn: k.generatedColumn + (g.generatedOffset.generatedLine === k.generatedLine ? g.generatedOffset.generatedColumn - 1 : 0), originalLine: k.originalLine, originalColumn: k.originalColumn, name: m };this.__generatedMappings.push(k);"number" === typeof k.originalLine && this.__originalMappings.push(k);
          }
        }v(this.__generatedMappings, e.compareByGeneratedPositionsDeflated);v(this.__originalMappings, e.compareByOriginalPositions);
      };f.IndexedSourceMapConsumer = h;
    }, function (q, f) {
      function k(a) {
        return (a = a.match(m)) ? { scheme: a[1], auth: a[2], host: a[3], port: a[4],
          path: a[5] } : null;
      }function c(a) {
        var b = "";a.scheme && (b += a.scheme + ":");b += "//";a.auth && (b += a.auth + "@");a.host && (b += a.host);a.port && (b += ":" + a.port);a.path && (b += a.path);return b;
      }function g(a) {
        var b = a,
            d = k(a);if (d) {
          if (!d.path) return a;b = d.path;
        }a = f.isAbsolute(b);for (var b = b.split(/\/+/), g, e = 0, h = b.length - 1; 0 <= h; h--) {
          g = b[h], "." === g ? b.splice(h, 1) : ".." === g ? e++ : 0 < e && ("" === g ? (b.splice(h + 1, e), e = 0) : (b.splice(h, 2), e--));
        }b = b.join("/");"" === b && (b = a ? "/" : ".");return d ? (d.path = b, c(d)) : b;
      }function n(a) {
        return a;
      }function h(a) {
        return l(a) ? "$" + a : a;
      }function e(a) {
        return l(a) ? a.slice(1) : a;
      }function l(a) {
        if (!a) return !1;var b = a.length;if (9 > b || 95 !== a.charCodeAt(b - 1) || 95 !== a.charCodeAt(b - 2) || 111 !== a.charCodeAt(b - 3) || 116 !== a.charCodeAt(b - 4) || 111 !== a.charCodeAt(b - 5) || 114 !== a.charCodeAt(b - 6) || 112 !== a.charCodeAt(b - 7) || 95 !== a.charCodeAt(b - 8) || 95 !== a.charCodeAt(b - 9)) return !1;for (b -= 10; 0 <= b; b--) {
          if (36 !== a.charCodeAt(b)) return !1;
        }return !0;
      }f.getArg = function (a, b, c) {
        if (b in a) return a[b];if (3 === arguments.length) return c;throw Error('"' + b + '" is a required argument.');
      };var m = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/,
          r = /^data:.+\,.+$/;f.urlParse = k;f.urlGenerate = c;f.normalize = g;f.join = function (a, b) {
        "" === a && (a = ".");"" === b && (b = ".");var d = k(b),
            e = k(a);e && (a = e.path || "/");if (d && !d.scheme) return e && (d.scheme = e.scheme), c(d);if (d || b.match(r)) return b;if (e && !e.host && !e.path) return e.host = b, c(e);d = "/" === b.charAt(0) ? b : g(a.replace(/\/+$/, "") + "/" + b);return e ? (e.path = d, c(e)) : d;
      };f.isAbsolute = function (a) {
        return "/" === a.charAt(0) || !!a.match(m);
      };f.relative = function (a, b) {
        "" === a && (a = ".");a = a.replace(/\/$/, "");for (var c = 0; 0 !== b.indexOf(a + "/");) {
          var e = a.lastIndexOf("/");if (0 > e) return b;a = a.slice(0, e);if (a.match(/^([^\/]+:\/)?\/*$/)) return b;++c;
        }return Array(c + 1).join("../") + b.substr(a.length + 1);
      };var v = !("__proto__" in Object.create(null));f.toSetString = v ? n : h;f.fromSetString = v ? n : e;f.compareByOriginalPositions = function (a, b, c) {
        var d = a.source - b.source;if (0 !== d) return d;d = a.originalLine - b.originalLine;if (0 !== d) return d;d = a.originalColumn - b.originalColumn;if (0 !== d || c) return d;
        d = a.generatedColumn - b.generatedColumn;if (0 !== d) return d;d = a.generatedLine - b.generatedLine;return 0 !== d ? d : a.name - b.name;
      };f.compareByGeneratedPositionsDeflated = function (a, b, c) {
        var d = a.generatedLine - b.generatedLine;if (0 !== d) return d;d = a.generatedColumn - b.generatedColumn;if (0 !== d || c) return d;d = a.source - b.source;if (0 !== d) return d;d = a.originalLine - b.originalLine;if (0 !== d) return d;d = a.originalColumn - b.originalColumn;return 0 !== d ? d : a.name - b.name;
      };f.compareByGeneratedPositionsInflated = function (a, b) {
        var d = a.generatedLine - b.generatedLine;if (0 !== d) return d;d = a.generatedColumn - b.generatedColumn;if (0 !== d) return d;var d = a.source,
            c = b.source,
            d = d === c ? 0 : d > c ? 1 : -1;if (0 !== d) return d;d = a.originalLine - b.originalLine;if (0 !== d) return d;d = a.originalColumn - b.originalColumn;0 === d && (d = a.name, c = b.name, d = d === c ? 0 : d > c ? 1 : -1);return d;
      };
    }, function (q, f) {
      function k(c, g, n, h, e, l) {
        var m = Math.floor((g - c) / 2) + c,
            r = e(n, h[m], !0);return 0 === r ? m : 0 < r ? 1 < g - m ? k(m, g, n, h, e, l) : l == f.LEAST_UPPER_BOUND ? g < h.length ? g : -1 : m : 1 < m - c ? k(c, m, n, h, e, l) : l == f.LEAST_UPPER_BOUND ? m : 0 > c ? -1 : c;
      }f.GREATEST_LOWER_BOUND = 1;f.LEAST_UPPER_BOUND = 2;f.search = function (c, g, n, h) {
        if (0 === g.length) return -1;c = k(-1, g.length, c, g, n, h || f.GREATEST_LOWER_BOUND);if (0 > c) return -1;for (; 0 <= c - 1 && 0 === n(g[c], g[c - 1], !0);) {
          --c;
        }return c;
      };
    }, function (q, f, k) {
      function c() {
        this._array = [];this._set = Object.create(null);
      }var g = k(2),
          n = Object.prototype.hasOwnProperty;c.fromArray = function (g, e) {
        for (var h = new c(), f = 0, k = g.length; f < k; f++) {
          h.add(g[f], e);
        }return h;
      };c.prototype.size = function () {
        return Object.getOwnPropertyNames(this._set).length;
      };
      c.prototype.add = function (c, e) {
        var f = g.toSetString(c),
            h = n.call(this._set, f),
            k = this._array.length;h && !e || this._array.push(c);h || (this._set[f] = k);
      };c.prototype.has = function (c) {
        c = g.toSetString(c);return n.call(this._set, c);
      };c.prototype.indexOf = function (c) {
        var e = g.toSetString(c);if (n.call(this._set, e)) return this._set[e];throw Error('"' + c + '" is not in the set.');
      };c.prototype.at = function (c) {
        if (0 <= c && c < this._array.length) return this._array[c];throw Error("No element indexed by " + c);
      };c.prototype.toArray = function () {
        return this._array.slice();
      };f.ArraySet = c;
    }, function (q, f, k) {
      var c = k(6);f.encode = function (g) {
        var f = "",
            h = 0 > g ? (-g << 1) + 1 : (g << 1) + 0;do {
          g = h & 31, h >>>= 5, 0 < h && (g |= 32), f += c.encode(g);
        } while (0 < h);return f;
      };f.decode = function (g, f, h) {
        var e = g.length,
            k = 0,
            m = 0;do {
          if (f >= e) throw Error("Expected more digits in base 64 VLQ value.");var n = c.decode(g.charCodeAt(f++));if (-1 === n) throw Error("Invalid base64 digit: " + g.charAt(f - 1));var q = !!(n & 32);n &= 31;k += n << m;m += 5;
        } while (q);g = k >> 1;h.value = 1 === (k & 1) ? -g : g;h.rest = f;
      };
    }, function (q, f) {
      var k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");f.encode = function (c) {
        if (0 <= c && c < k.length) return k[c];throw new TypeError("Must be between 0 and 63: " + c);
      };f.decode = function (c) {
        return 65 <= c && 90 >= c ? c - 65 : 97 <= c && 122 >= c ? c - 97 + 26 : 48 <= c && 57 >= c ? c - 48 + 52 : 43 == c ? 62 : 47 == c ? 63 : -1;
      };
    }, function (q, f) {
      function k(c, f, h) {
        var e = c[f];c[f] = c[h];c[h] = e;
      }function c(g, f, h, e) {
        if (h < e) {
          var l = h - 1;k(g, Math.round(h + Math.random() * (e - h)), e);for (var m = g[e], n = h; n < e; n++) {
            0 >= f(g[n], m) && (l += 1, k(g, l, n));
          }k(g, l + 1, n);l += 1;c(g, f, h, l - 1);c(g, f, l + 1, e);
        }
      }f.quickSort = function (f, k) {
        c(f, k, 0, f.length - 1);
      };
    }]);
  });
});

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.2
 * Last Modify: 2016/8/19
 */

var mapStackTrace = sourcemappedStacktrace_min.mapStackTrace;


(function () {

    window._console = console;

    function initElements() {
        var tempBox = document.createElement('DIV');
        tempBox.innerHTML = '<style type=\"text/css\">\r\n    .simple-logger-btn {\n  position: fixed;\n  z-index: 2147483647;\n  top: 40px;\n  left: 80%;\n  width: 25px;\n  height: 25px;\n  background-color: rgba(50, 50, 50, 0.2);\n  border: 5px solid rgba(0, 0, 0, 0.2);\n  border-radius: 10px; }\n\n.simple-logger-box {\n  position: fixed;\n  z-index: 2147483647;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(255, 255, 255, 0.8);\n  -webkit-transition: opacity 400ms ease, visibility 400ms ease;\n  transition: opacity 400ms ease, visibility 400ms ease;\n  opacity: 0;\n  visibility: hidden;\n  -webkit-user-select: text; }\n  .simple-logger-box.show {\n    opacity: 1;\n    visibility: visible; }\n  .simple-logger-box .simple-logger-list {\n    position: absolute;\n    z-index: 2147483647;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 80%;\n    background-color: rgba(0, 0, 0, 0.8);\n    -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n    overflow: auto;\n    -webkit-overflow-scrolling: touch;\n    -webkit-transition: -webkit-transform 400ms ease;\n    transition: -webkit-transform 400ms ease;\n    transition: transform 400ms ease;\n    transition: transform 400ms ease, -webkit-transform 400ms ease;\n    -webkit-transform: translate3d(0, -100%, 0);\n            transform: translate3d(0, -100%, 0); }\n  .simple-logger-box.show .simple-logger-list {\n    -webkit-transform: translate3d(0, 0, 0);\n            transform: translate3d(0, 0, 0); }\n  .simple-logger-box .simple-logger-list {\n    list-style: none;\n    color: #cacaca;\n    text-align: left;\n    word-break: break-all;\n    font-size: 13px;\n    font-family: Consolas,\r custom-font,\r sans-serif; }\n    .simple-logger-box .simple-logger-list li {\n      margin: 4px 8px;\n      line-height: 1.5; }\n    .simple-logger-box .simple-logger-list a {\n      color: #ffffff; }\n    .simple-logger-box .simple-logger-list hr {\n      border-color: #cacaca; }\n    .simple-logger-box .simple-logger-list .literal {\n      color: #cacaca; }\n    .simple-logger-box .simple-logger-list .info {\n      color: #74aa04; }\n    .simple-logger-box .simple-logger-list .warn {\n      color: #cccc81; }\n    .simple-logger-box .simple-logger-list .error,\n    .simple-logger-box .simple-logger-list .error .json-viewer-key {\n      color: #a70334; }\n    .simple-logger-box .simple-logger-list .options-confirm {\n      font-style: normal;\n      color: #cacaca; }\n      .simple-logger-box .simple-logger-list .options-confirm .options-link.ok, .simple-logger-box .simple-logger-list .options-confirm .options-link.cancel {\n        color: white; }\n    .simple-logger-box .simple-logger-list .json-holder {\n      font-style: normal; }\n\n\n\n\r\n</style>\r\n<a class=\"simple-logger-btn\"></a>\r\n<div class=\"simple-logger-box\">\r\n    <ul class=\"simple-logger-list\"></ul>\r\n</div>\r\n';
        var elements = [].slice.call(tempBox.children, 0),
            element;
        for (var i = 0; element = elements[i]; i++) {
            document.body.appendChild(element);
        }
    }

    function initLoggerDelayer() {
        window.console = window.SimpleLogger = delayer.create(['log', 'info', 'warn', 'error', 'clear', 'useId', 'genUniqueId', 'expand', 'collapse', 'hideBtn', 'showBtn', 'allowHtml', 'preventHtml', 'tryCatch', 'handlerError']);
    }

    function initLogger() {
        var box = document.querySelector('.simple-logger-box'),
            list = box.querySelector('.simple-logger-list'),
            btn = document.querySelector('.simple-logger-btn');
        logger._init({
            logList: list,
            eventHandler: list,
            indentSize: 16,
            expand: 1,
            theme: 'dark'
        });
        logger.bindConsole(window._console);
        logger.expand = function () {
            logger._autoFocus = true;
            box.classList.add('show');
        };
        logger.collapse = function () {
            logger._autoFocus = false;
            box.classList.remove('show');
        };
        logger.hideBtn = function () {
            btn.style.display = 'none';
        };
        logger.showBtn = function () {
            btn.style.display = 'block';
        };
        logger.tryCatch = function (func, thisObj, args) {
            try {
                if (!thisObj) return func();else return func.apply(thisObj, args || []);
            } catch (error) {
                handleError(error);
            }
        };
        logger.handleError = handleError;

        var btnDOC = new dragOrClick(btn);
        btnDOC.on('click', function () {
            SimpleLogger.expand();
        });

        box.addEventListener('touchstart', function (e) {
            var listRect = list.getBoundingClientRect(),
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            var touchPos = dragOrClick.getTouchPos(e);
            touchPos.x -= scrollLeft;
            touchPos.y -= scrollTop;
            if (touchPos && (touchPos.x < listRect.left || touchPos.x > listRect.right || touchPos.y < listRect.top || touchPos.y > listRect.bottom)) {
                SimpleLogger.collapse();
            }
            e.stopPropagation();
        });
        delayer.execQueue(logger);
        delayer.clearQueue();
        window.console = window.SimpleLogger = logger;
    }

    function handleError(error) {
        if (error.stack) {
            mapStackTrace(error.stack, function (mappedStack) {
                SimpleLogger.error('Error:', {
                    message: error.message,
                    stack: ['\n' + mappedStack.join('\n') + '\n']
                });
            });
        } else {
            SimpleLogger.error('Error:', {
                message: error.message,
                stack: 'Capture missed, try wrap the code into \'SimpleLogger.tryCatch\' for detail.'
            });
        }
    }

    function listenToError() {
        window.addEventListener('error', handleError);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initElements();
        initLogger();
    });

    initLoggerDelayer();
    listenToError();
})();

var simpleLogger = {};

return simpleLogger;

}());

//# sourceMappingURL=simple-logger.js.map
