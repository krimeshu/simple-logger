(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.0.6
 * Last Modify: 2016/7/1
 */
var Delayer = require('./simple-logger/delayer.js'),
    Logger = require('./simple-logger/logger.js'),
    DragOrClick = require('./simple-logger/drag-or-click.js');

(function () {

    window._console = console;

    function initElements() {
        var tempBox = document.createElement('DIV');
        tempBox.innerHTML = '<style type=\"text/css\">\r\n    .simple-logger-btn {\n  position: fixed;\n  z-index: 2147483647;\n  top: 40px;\n  right: 40px;\n  width: 25px;\n  height: 25px;\n  background-color: rgba(50, 50, 50, 0.2);\n  border: 5px solid rgba(0, 0, 0, 0.2);\n  border-radius: 10px; }\n\n.simple-logger-box {\n  position: fixed;\n  z-index: 2147483647;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(255, 255, 255, 0.8);\n  -webkit-transition: opacity 400ms ease, visibility 400ms ease;\n  transition: opacity 400ms ease, visibility 400ms ease;\n  opacity: 0;\n  visibility: hidden; }\n  .simple-logger-box.show {\n    opacity: 1;\n    visibility: visible; }\n  .simple-logger-box .simple-logger-list {\n    position: absolute;\n    z-index: 2147483647;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 80%;\n    background-color: rgba(0, 0, 0, 0.8);\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n    overflow: auto;\n    -webkit-overflow-scrolling: touch;\n    -webkit-transition: -webkit-transform 400ms ease;\n    transition: -webkit-transform 400ms ease;\n    transition: transform 400ms ease;\n    transition: transform 400ms ease, -webkit-transform 400ms ease;\n    -webkit-transform: translate3d(0, -100%, 0);\n            transform: translate3d(0, -100%, 0); }\n  .simple-logger-box.show .simple-logger-list {\n    -webkit-transform: translate3d(0, 0, 0);\n            transform: translate3d(0, 0, 0); }\n  .simple-logger-box .simple-logger-list {\n    list-style: none;\n    color: #cacaca;\n    text-align: left;\n    word-break: break-all;\n    font-size: 13px;\n    font-family: Consolas, custom-font, sans-serif; }\n    .simple-logger-box .simple-logger-list li {\n      margin: 4px 8px;\n      line-height: 1.5; }\n    .simple-logger-box .simple-logger-list a {\n      color: #ffffff; }\n    .simple-logger-box .simple-logger-list hr {\n      border-color: #cacaca; }\n    .simple-logger-box .simple-logger-list .literal {\n      color: #cacaca; }\n    .simple-logger-box .simple-logger-list .info {\n      color: #74aa04; }\n    .simple-logger-box .simple-logger-list .warn {\n      color: #cccc81; }\n    .simple-logger-box .simple-logger-list .error {\n      color: #a70334; }\n    .simple-logger-box .simple-logger-list .options-confirm {\n      font-style: normal;\n      color: #cacaca; }\n      .simple-logger-box .simple-logger-list .options-confirm .options-link.ok, .simple-logger-box .simple-logger-list .options-confirm .options-link.cancel {\n        color: white; }\n    .simple-logger-box .simple-logger-list .json-holder {\n      font-style: normal; }\n    .simple-logger-box .simple-logger-list .pos-str {\n      float: right;\n      color: #999;\n      text-decoration: underline; }\n    .simple-logger-box .simple-logger-list .clear {\n      clear: both;\n      display: block;\n      height: 0; }\n\r\n</style>\r\n<a class=\"simple-logger-btn\"></a>\r\n<div class=\"simple-logger-box\">\r\n    <ul class=\"simple-logger-list\"></ul>\r\n</div>\r\n';
        var elements = [].slice.call(tempBox.children, 0),
            element;
        for (var i = 0; element = elements[i]; i++) {
            document.body.appendChild(element);
        }
    }

    function initLoggerDelayer() {
        window.console = window.SimpleLogger = Delayer.create([
            'log', 'info', 'warn', 'error',
            'clear', 'useId', 'genUniqueId',
            'expand', 'collapse', 'hideBtn', 'showBtn'
        ]);
    }

    function initLogger() {
        var box = document.querySelector('.simple-logger-box'),
            list = box.querySelector('.simple-logger-list'),
            btn = document.querySelector('.simple-logger-btn');
        Logger._init({
            logList: list,
            eventHandler: list,
            indentSize: 16,
            expand: 1,
            theme: 'dark'
        });
        Logger.bindConsole(window._console);
        Logger.expand = function () {
            box.classList.add('show');
        };
        Logger.collapse = function () {
            box.classList.remove('show');
        };
        Logger.hideBtn = function () {
            btn.style.display = 'none';
        };
        Logger.showBtn = function () {
            btn.style.display = 'block';
        };

        var btnDOC = new DragOrClick(btn);
        btnDOC.on('click', function () {
            SimpleLogger.expand();
        });

        box.addEventListener('touchstart', function (e) {
            var listRect = list.getBoundingClientRect(),
                scrollTop = (document.documentElement.scrollTop || document.body.scrollTop),
                scrollLeft = (document.documentElement.scrollLeft || document.body.scrollLeft);
            var touchPos = DragOrClick.getTouchPos(e);
            touchPos.x -= scrollLeft;
            touchPos.y -= scrollTop;
            if (touchPos && (touchPos.x < listRect.left || touchPos.x > listRect.right ||
                touchPos.y < listRect.top || touchPos.y > listRect.bottom)) {
                SimpleLogger.collapse();
            }
            e.stopPropagation();
        });
        Delayer.execQueue(Logger);
        Delayer.clearQueue();
        window.console = window.SimpleLogger = Logger;
    }

    function listenToError() {
        window.addEventListener('error', function (error) {
            var line = error ['lineno'];
            var file = error['filename']
            var posStr = '(' + line + ')';
            if (file) {
                file = file.substring(0, ((file.indexOf('?') + 1) || (file.indexOf('#') + 1) || (file.length + 1)) - 1);
                var page = window.location.href;
                page = page.substring(0, ((page.indexOf('?') + 1) || (page.indexOf('#') + 1) || (page.length + 1)) - 1);
                var path = page.substring(0, page.lastIndexOf('/') + 1);
                if (file.indexOf(path) == 0) {
                    file = file.length > path.length ? file.substring(path.length) : '(index)';
                }
                posStr = !file ? posStr : '</span><span class="pos-str">' + file + ': ' + line + '</span><span class="clear">';
            }
            SimpleLogger.error(error['message'] + posStr);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initElements();
        initLogger();
    });

    initLoggerDelayer();
    listenToError();
})();

},{"./simple-logger/delayer.js":2,"./simple-logger/drag-or-click.js":3,"./simple-logger/logger.js":5}],2:[function(require,module,exports){
/**
 * Created by krimeshu on 2016/6/20.
 */

var Delayer = {
    _waitingQueue: [],
    _makeFunc: function (funcName) {
        var self = this;
        return function () {
            var args = [].slice.call(arguments, 0);
            self._waitingQueue.push({funcName: funcName, args: args});
        }
    },
    create: function (funcNames) {
        var delayObj = {};
        for (var i = 0, len = funcNames.length; i < len; i++) {
            var funcName = funcNames[i];
            delayObj[funcName] = this._makeFunc(funcName);
        }
        return delayObj;
    },
    execQueue: function (obj) {
        var queue = this._waitingQueue;
        for (var i = 0, item; item = queue[i]; i++) {
            var funcName = item.funcName,
                args = item.args,
                func = obj && obj[funcName];
            func && func.apply(obj, args);
        }
    },
    clearQueue: function () {
        this._waitingQueue = {};
    }
};

module.exports = Delayer;
},{}],3:[function(require,module,exports){
/**
 * Created by krimeshu on 2016/6/20.
 */

var DragOrClick = function (obj) {
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
    var x = t.pageX || (t.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
    var y = t.pageY || (t.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
    return {
        x: x,
        y: y
    };
};

DragOrClick.getViewportDimension = function () {
    var e = window, a = 'inner';
    if (!( 'innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {w: e[a + 'Width'], h: e[a + 'Height']};
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

    this.oldPos = {
        x: parseInt(getComputedStyle(obj).left, 10),
        y: parseInt(getComputedStyle(obj).top, 10)
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
        touchMoveDis = Math.pow(this.touchEndPos.x - this.touchStartPos.x, 2) +
            Math.pow(this.touchEndPos.y - this.touchStartPos.y, 2);
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
        if (typeof(callback) == 'function') {
            callback(e);
        }
    }
};

module.exports = DragOrClick;
},{}],4:[function(require,module,exports){
(function (process){
/**
 * JSON 对象转为可视化易读的 HTML 代码的工具类
 * Ver 1.0.0 (20160404)
 * Created by krimeshu on 2016/4/2.
 */

var isNative = typeof process !== 'undefined' && process.version,
    stream = isNative ? require.call(null, 'stream') : null,
    isStream = stream && function (o) {
            return o instanceof stream;
        };

var JSONViewer = function (opts) {
    var eventHandler = this._getUsefulDOM(opts.eventHandler),
        indentSize = opts.indentSize,
        expand = opts.expand,
        quoteKeys = opts.quoteKeys,
        theme = opts.theme,
        rowClass = ['json-viewer-row'];
    this.indentSize = indentSize === undefined ? 14 : indentSize | 0;
    this.expand = expand | 0;
    this.quoteKeys = !!quoteKeys;
    typeof (theme) === 'string' && rowClass.push('theme-' + theme);
    this.rowClass = rowClass.join(' ');
    this.setEventHandler(eventHandler);
};

JSONViewer.prototype = {
    _getUsefulDOM: function (unknown) {
        if (this._isDOM(unknown) ||
            (unknown.length && typeof(unknown.append) === 'function')) {
            return unknown;
        }
        return (document.querySelector && document.querySelector(unknown)) ||
            document.getElementById(unknown);
    },
    _isDOM: ( typeof HTMLElement === 'object' ) ?
        function (unknown) {
            return unknown instanceof HTMLElement;
        } :
        function (unknown) {
            return (unknown && typeof unknown === 'object'
            && unknown.nodeType === 1 && typeof unknown.nodeName === 'string');
        },
    _isThis: function (el, selector) {
        var _matches = (el.matches || el.matchesSelector
        || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector);
        if (_matches) {
            return _matches.call(el, selector);
        } else if (el.parentNode) {
            var nodes = el.parentNode.querySelectorAll(selector);
            for (var i = nodes.length; i--;)
                if (nodes[i] === el) {
                    return true;
                }
            return false;
        }
        return false;
    },
    _refluxToFind: function (el, selector, excludeThis) {
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
    _findNextSibling: function (elem) {
        while (elem = elem.nextSibling) {
            if (elem.nodeType === 1) {
                return elem;
            }
        }
        return null;
    },
    setEventHandler: function (eventHandler) {
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
            if (!isEmpty && members && afterMembers &&
                self._isThis(members, '.json-viewer-array-members,.json-viewer-object-members') &&
                self._isThis(afterMembers, '.json-viewer-after-array-members,.json-viewer-after-object-members')) {
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
    toJSON: function (target, _depth, _unfinished, _isLast, _keyName) {
        var buffer = [],
            type = Object.prototype.toString.call(target),
            unfinished = _unfinished || [],
            depth = _depth | 0,
            indentSize = this.indentSize | 0,
            expand = this.expand | 0,
            rowClass = this.rowClass || 'json-viewer-row',
            isEmpty,
            collapseClass,
            child,
            baseType,
            objectType,
            i, l;
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
                collapseClass = ((expand > 0 && depth >= expand) || isEmpty) ? ' collapsed' : '';
                buffer.push('<div class="' + rowClass + collapseClass + isEmpty + '">');
                _keyName && this._tryPrependKey(buffer, _keyName);
                buffer.push('<div class="json-viewer-bracket">[</div>');
                buffer.push('<div class="json-viewer-collapse-tag json-viewer-ellipsis">...</div>');
                buffer.push('<div class="json-viewer-collapse-tag json-viewer-bracket">]</div>');
                buffer.push('</div>');      // <div class="json-viewer-row">
                buffer.push('<div class="json-viewer-array-members' + collapseClass + '" style="padding-left:' + indentSize + 'px;">');
                for (i = 0, l = target.length - 1; i <= l; i++) {
                    child = this.toJSON(target[i], depth + 1, unfinished, i < l);
                    buffer.push(child);
                }
                buffer.push('</div>');      // <div class="json-viewer-array-members">
                buffer.push('<div class="json-viewer-after-array-members ' + rowClass + collapseClass + '">');
                buffer.push('<div class="json-viewer-bracket">]</div>');
                if (_isLast) {
                    buffer.push('<div class="json-viewer-comma">, </div>');
                }
                buffer.push('</div>');      // <div class="json-viewer-row">
                break;
            case '[object Object]':
                objectType = true;
                break;
            default:
                if (typeof(target) === 'object') {
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
            if (target.message && keys.indexOf('message') < 0
                && !Object.getOwnPropertyDescriptor(target, 'message').enumerable) {
                keys.splice(0, 0, 'message');
            }
            isEmpty = keys.length ? '' : ' empty';
            collapseClass = ((expand > 0 && depth >= expand) || isEmpty) ? ' collapsed' : '';
            buffer.push('<div class="' + rowClass + collapseClass + isEmpty + '">');
            _keyName && this._tryPrependKey(buffer, _keyName);
            buffer.push('<div class="json-viewer-bracket">{</div>');
            buffer.push('<div class="json-viewer-collapse-tag json-viewer-ellipsis">...</div>');
            buffer.push('<div class="json-viewer-collapse-tag json-viewer-bracket">}</div>');
            buffer.push('</div>');  // <div class="json-viewer-row">
            buffer.push('<div class="json-viewer-object-members' + collapseClass + '" style="padding-left:' + indentSize + 'px;">');
            for (i = 0, l = keys.length - 1; i <= l; i++) {
                k = keys[i];
                child = this.toJSON(target[k], depth + 1, unfinished, i < l, k);
                buffer.push(child);
            }
            buffer.push('</div>');      // <div class="json-viewer-object-members">
            buffer.push('<div class="json-viewer-after-object-members ' + rowClass + collapseClass + '">');
            buffer.push('<div class="json-viewer-bracket">}</div>');
            if (_isLast) {
                buffer.push('<div class="json-viewer-comma">, </div>');
            }
            buffer.push('</div>');      // <div class="json-viewer-row">
        }
        if (baseType) {
            buffer.push('<div class="' + rowClass + '">');
            _keyName && this._tryPrependKey(buffer, _keyName);
            buffer.push('<div class="json-viewer-' + baseType + '">');
            if (baseType === 'string') {
                buffer.push('"');
                buffer.push(target.replace(/"/g, '\\"'));
                buffer.push('"');
            } else if (baseType === 'stream') {
                buffer.push('Stream');
            } else {
                buffer.push(String(target));
            }
            buffer.push('</div>');
            if (_isLast) {
                buffer.push('<div class="json-viewer-comma">, </div>');
            }
            buffer.push('</div>');  // <div class="json-viewer-row">
        }
        unfinished.pop();
        return buffer.join('');
    },
    _tryPrependKey: function (buffer, key) {
        var quoteKeys = !!this.quoteKeys;
        buffer.push('<div class="json-viewer-key">');
        quoteKeys && buffer.push('"');
        buffer.push(quoteKeys ? key.replace(/"/g, '\\"') : key);
        quoteKeys && buffer.push('"');
        buffer.push('</div><div class="json-viewer-comma">: </div>');
    }
};

if (typeof require !== 'undefined') {
    module.exports = JSONViewer;
}
}).call(this,require('_process'))
},{"_process":6}],5:[function(require,module,exports){
/**
 * Created by krimeshu on 2016/6/20.
 */

var JSONViewer = require('./json-viewer/json-viewer.js'),
    styleText = '.json-viewer-row {\r\n    cursor: default;\r\n    color: #545353;\r\n    margin: 2px 0;\r\n}\r\n\r\n.json-viewer-ellipsis {\r\n    background: #C0C0C0;\r\n    padding: 0 6px;\r\n    margin: 0 2px;\r\n    border-radius: 3px;\r\n}\r\n\r\n.json-viewer-array-members.collapsed,\r\n.json-viewer-after-array-members.collapsed,\r\n.json-viewer-object-members.collapsed,\r\n.json-viewer-after-object-members.collapsed {\r\n    display: none;\r\n}\r\n\r\n.json-viewer-bracket, .json-viewer-colon, .json-viewer-comma {\r\n    margin: 0 2px;\r\n}\r\n\r\n.json-viewer-row .json-viewer-collapse-tag {\r\n    display: none;\r\n}\r\n\r\n.json-viewer-row.collapsed .json-viewer-collapse-tag {\r\n    display: inline;\r\n}\r\n\r\n.json-viewer-row.empty .json-viewer-collapse-tag.json-viewer-ellipsis {\r\n    display: none;\r\n}\r\n\r\n.json-viewer-row.empty .json-viewer-collapse-tag.json-viewer-bracket {\r\n    display: inline;\r\n}\r\n\r\n.json-viewer-bracket,\r\n.json-viewer-key,\r\n.json-viewer-colon,\r\n.json-viewer-comma,\r\n.json-viewer-string,\r\n.json-viewer-number,\r\n.json-viewer-boolean,\r\n.json-viewer-null,\r\n.json-viewer-undefined,\r\n.json-viewer-stream {\r\n    display: inline;\r\n}\r\n\r\n.json-viewer-key, .json-viewer-string {\r\n    color: #036A07;\r\n}\r\n\r\n.json-viewer-number {\r\n    color: #0000CD;\r\n}\r\n\r\n.json-viewer-boolean, .json-viewer-null, .json-viewer-undefined {\r\n    color: #585CF6;\r\n}\r\n\r\n.json-viewer-stream {\r\n    background: #C0C0C0;\r\n    padding: 0 6px;\r\n    margin: 0 2px;\r\n    border-radius: 3px;\r\n}\r\n\r\n/****************************************/\r\n\r\n.json-viewer-row.theme-dark {\r\n    color: #DEDEDE;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-ellipsis {\r\n    background: #666666;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-key {\r\n    color: #74AA04;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-string {\r\n    color: #CCCC81;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-number {\r\n    color: #4178B3;\r\n}\r\n\r\n.json-viewer-row.theme-dark .json-viewer-boolean,\r\n.json-viewer-row.theme-dark .json-viewer-null,\r\n.json-viewer-row.theme-dark .json-viewer-undefined {\r\n    color: #CC7832;\r\n}\r\n\r\n.json-viewer-stream {\r\n    background: #666666;\r\n}';

var Logger = {
    logList: null,
    nextId: null,
    _console: null,
    bindConsole: function (console) {
        this._console = console;
    },
    _copyToConsole: function (funcName, args) {
        var console = this._console,
            func = console && console[funcName];
        func && func.apply(console, args);
    },
    clear: function () {
        var logList = this.logList;
        logList.innerHTML = '';
    },
    useId: function (id) {
        this.nextId = id;
        return this;
    },
    genUniqueId: function () {
        var id = this._generateId();
        while (document.getElementById(id)) {
            id = this._generateId();
        }
        return id;
    },
    _generateId: function () {
        return '_log_text_' + new Date().getTime() + Math.random();
    },
    log: function () {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'literal'
        });
        this._copyToConsole('log', arguments);
    },
    info: function () {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'info'
        });
        this._copyToConsole('info', arguments);
    },
    warn: function () {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'warn'
        });
        this._copyToConsole('warn', arguments);
    },
    error: function () {
        var text = this._format(arguments);
        this._append({
            text: text,
            type: 'error'
        });
    },
    _append: function (item) {
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
            window.setTimeout(function () {
                li.scrollIntoView();
                li = null;
            }, 10);
        }
    },
    _format: function (args) {
        var formatStr = args[0];
        if (typeof formatStr !== 'string') {
            formatStr = this._stringify(formatStr);
        }
        var res = [];
        var formats = formatStr.split('%');
        res.push(formats[0]);
        var offset = 1,
            type,
            arg;
        if (formats.length > 1) {
            for (var i = offset, f; f = formats[i]; i++, offset++) {
                type = f[0];
                arg = args[offset];
                switch (type) {
                    case '%':
                        res.push('%');
                        break;
                    case 'c':
                        res.push('</span><span style="' + arg + '">');
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
    _stringify: function (arg) {
        if (arg instanceof Date) {
            return String(arg);
        }
        var type = typeof arg;
        switch (type) {
            case 'string':
                return arg;
            case 'object':
                return this.jsonViewer.toJSON(arg);
            default:
                return String(arg);
        }
    },
    _init: function (opts) {
        this.logList = opts.logList;
        this.jsonViewer = new JSONViewer(opts);

        var style = document.createElement('STYLE');
        style.setAttribute('type', 'text/css');
        style.innerHTML = styleText;
        document.body.appendChild(style);
    }
};

module.exports = Logger;

},{"./json-viewer/json-viewer.js":4}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
