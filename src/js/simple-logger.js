/**
 * Created by krimeshu on 2016/6/20.
 * Version: {VERSION}
 * Last Modify: 2016/8/19
 */
var Delayer = require('./simple-logger/delayer.js'),
    Logger = require('./simple-logger/logger.js'),
    DragOrClick = require('./simple-logger/drag-or-click.js');

var {
    mapStackTrace
} = require('./lib/sourcemapped-stacktrace.js');

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
            'log', 'info', 'warn', 'error',
            'clear', 'useId', 'genUniqueId',
            'expand', 'collapse', 'hideBtn', 'showBtn',
            'allowHtml', 'preventHtml',
            'tryCatch', 'handlerError'
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
            Logger._autoFocus = true;
            box.classList.add('show');
        };
        Logger.collapse = function () {
            Logger._autoFocus = false;
            box.classList.remove('show');
        };
        Logger.hideBtn = function () {
            btn.style.display = 'none';
        };
        Logger.showBtn = function () {
            btn.style.display = 'block';
        };
        Logger.tryCatch = function (func, thisObj, args) {
            try {
                if (!thisObj) return func();
                else return func.apply(thisObj, args || []);
            } catch (error) {
                handleError(error);
            }
        };
        Logger.handleError = handleError;

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