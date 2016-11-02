/**
 * Created by krimeshu on 2016/6/20.
 */

var JSONViewer = require('./json-viewer/json-viewer.js'),
    styleText = '#include("./json-viewer/json-viewer.css", {"_inlineString": true})';

var Logger = {
    logList: null,
    nextId: null,
    _console: null,
    _allowHtml: false,
    _autoFocus: false,
    allowHtml: function () {
        this._allowHtml = true;
        this.jsonViewer.allowHtml();
    },
    preventHtml: function () {
        this._allowHtml = false;
        this.jsonViewer.preventHtml();
    },
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
            this._autoFocus && window.setTimeout(function () {
                li.scrollIntoView();
                li = null;
            }, 10);
        }
    },
    _format: function (args) {
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
    _stringify: function (arg) {
        var allowHtml = this._allowHtml;
        if (arg instanceof Date) {
            return String(arg);
        }
        var type = typeof arg;
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
