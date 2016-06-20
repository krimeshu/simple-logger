'browserify entry';

/**
 * Created by krimeshu on 2016/6/20.
 * Version: 3.0.1
 * Last Modify: 2016/6/20
 */
var Delayer = require('./simple-logger/delayer.js'),
    Logger = require('./simple-logger/logger.js'),
    DragOrClick = require('./simple-logger/drag-or-click.js');

(function () {

    window._console = console;

    function initElements() {
        var tempBox = document.createElement('DIV');
        tempBox.innerHTML = '#include("./simple-logger/_elements.html", {"_inlineString": true})';
        var elements = [].slice.call(tempBox.children, 0),
            element;
        for (var i = 0; element = elements[i]; i++) {
            document.body.appendChild(element);
        }
    }

    function initLoggerDelayer() {
        window.console = window.SimpleLogger = Delayer.create([
            'log', 'info', 'warn', 'error', 'clear', 'useId', 'genUniqueId'
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

        box.addEventListener('click', function (e) {
            if (e.target === box) {
                Logger.collapse();
            }
        });
        box.addEventListener('touchstart', function (e) {
            var listRect = list.getBoundingClientRect();
            var touchPos = DragOrClick.getTouchPos(e);
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
