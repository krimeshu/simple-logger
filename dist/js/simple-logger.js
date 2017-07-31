var simpleLogger = (function () {
'use strict';

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.3
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



var delayer$2 = Object.freeze({
	default: delayer,
	__moduleExports: delayer
});

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



var jsonViewer$2 = Object.freeze({
	default: jsonViewer,
	__moduleExports: jsonViewer
});

var JSONViewer = ( jsonViewer$2 && jsonViewer ) || jsonViewer$2;

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
        this.jsonViewer = new JSONViewer(opts);

        var style = document.createElement('STYLE');
        style.setAttribute('type', 'text/css');
        style.innerHTML = styleText;
        document.body.appendChild(style);
    }
};

var logger = Logger;



var logger$2 = Object.freeze({
	default: logger,
	__moduleExports: logger
});

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.3
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



var dragOrClick$2 = Object.freeze({
	default: dragOrClick,
	__moduleExports: dragOrClick
});

var Delayer$1 = ( delayer$2 && delayer ) || delayer$2;

var Logger$1 = ( logger$2 && logger ) || logger$2;

var DragOrClick$1 = ( dragOrClick$2 && dragOrClick ) || dragOrClick$2;

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.3.3
 * Last Modify: 2016/8/19
 */

// var {
//     mapStackTrace
// } = require('./lib/sourcemapped-stacktrace.min.js');

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
        window.console = window.SimpleLogger = Delayer$1.create(['log', 'info', 'warn', 'error', 'clear', 'useId', 'genUniqueId', 'expand', 'collapse', 'hideBtn', 'showBtn', 'allowHtml', 'preventHtml', 'tryCatch', 'handlerError']);
    }

    function initLogger() {
        var box = document.querySelector('.simple-logger-box'),
            list = box.querySelector('.simple-logger-list'),
            btn = document.querySelector('.simple-logger-btn');
        Logger$1._init({
            logList: list,
            eventHandler: list,
            indentSize: 16,
            expand: 1,
            theme: 'dark'
        });
        Logger$1.bindConsole(window._console);
        Logger$1.expand = function () {
            Logger$1._autoFocus = true;
            box.classList.add('show');
        };
        Logger$1.collapse = function () {
            Logger$1._autoFocus = false;
            box.classList.remove('show');
        };
        Logger$1.hideBtn = function () {
            btn.style.display = 'none';
        };
        Logger$1.showBtn = function () {
            btn.style.display = 'block';
        };
        Logger$1.tryCatch = function (func, thisObj, args) {
            try {
                if (!thisObj) return func();else return func.apply(thisObj, args || []);
            } catch (error) {
                handleError(error);
            }
        };
        Logger$1.handleError = handleError;

        var btnDOC = new DragOrClick$1(btn);
        btnDOC.on('click', function () {
            SimpleLogger.expand();
        });

        box.addEventListener('touchstart', function (e) {
            var listRect = list.getBoundingClientRect(),
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            var touchPos = DragOrClick$1.getTouchPos(e);
            touchPos.x -= scrollLeft;
            touchPos.y -= scrollTop;
            if (touchPos && (touchPos.x < listRect.left || touchPos.x > listRect.right || touchPos.y < listRect.top || touchPos.y > listRect.bottom)) {
                SimpleLogger.collapse();
            }
            e.stopPropagation();
        });
        Delayer$1.execQueue(Logger$1);
        Delayer$1.clearQueue();
        window.console = window.SimpleLogger = Logger$1;
    }

    function handleError(error) {
        if (error.stack) {
            // var isHandled = false;
            // mapStackTrace(error.stack, function (mappedStack) {
            // if (isHandled) return;
            // isHandled = true;
            // var stack = mappedStack;
            var stack = error.stack.split(/\n/g);
            SimpleLogger.error('Error:', {
                message: error.message,
                stack: ['\n' + stack.join('\n') + '\n']
            });
            // });
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
