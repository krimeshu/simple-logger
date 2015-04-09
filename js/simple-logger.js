/**
 * Created by Grayson Rex on 2015/4/9.
 */
~function (window) {
    var _console = null, console = {};

    var listBox = document.createElement('div');
    listBox.style.position = 'fixed';
    listBox.style.zIndex = 2147483647;
    listBox.style.top = '0';
    listBox.style.left = '0';
    listBox.style.width = '100%';
    listBox.style.height = '100%';
    listBox.style.backgroundColor = 'rgba(0, 0, 0, .8)';
    listBox.style.opacity = 0;
    listBox.style.display = 'none';
    listBox.style.transition = listBox.style.webkitTransition = 'opacity 500ms';

    var list = document.createElement('ul');
    list.style.position = 'absolute';
    list.style.top = '0';
    list.style.left = '0';
    list.style.width = '100%';
    list.style.height = '0%';
    list.style.backgroundColor = 'rgba(255, 255, 255, .7)';
    list.style.color = '#000000';
    list.style.fontSize = '12px';
    list.style.lineHeight = '16px';
    list.style.listStyle = 'none';
    list.style.overflow = 'scroll';
    list.style.padding = '0';
    list.style.transition = list.style.webkitTransition = 'height 500ms';

    var btn = document.createElement('a');
    btn.style.position = 'fixed';
    btn.style.zIndex = 2147483647;
    btn.style.top = '0';
    btn.style.left = '0';
    btn.style.width = '48px';
    btn.style.height = '48px';
    btn.style.backgroundColor = 'rgba(0, 0, 0, .6)';
    btn.style.border = '1px solid rgba(255, 255, 255, .2)'
    btn.style.borderRadius = '12px';
    btn.style.display = 'block';

    document.body.appendChild(btn);
    listBox.appendChild(list);
    document.body.appendChild(listBox);

    var DragOrClick = function (obj) {
        if (obj && obj.addEventListener && obj.classList && obj.classList.add) {
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
            this.obj = obj;
            this.callbacks = {};
        }
    };
    DragOrClick.getTouchPos = function (e) {
        var t = e.touches ? e.touches[0] : e;
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
        this.touchStartTime = new Date().getTime();
        this.touchStartPos = this.touchEndPos = DragOrClick.getTouchPos(e);

        this.oldPos = {
            x: parseInt(getComputedStyle(obj).left, 10),
            y: parseInt(getComputedStyle(obj).top, 10)
        };
        var dim = DragOrClick.getViewportDimension();
        this.limit = {
            x: dim.w - obj.clientWidth,
            y: dim.h - obj.clientHeight
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
        this.touchEndPos = DragOrClick.getTouchPos(e);

        var dx = this.touchEndPos.x - this.touchStartPos.x,
            dy = this.touchEndPos.y - this.touchStartPos.y;
        var newPos = {
            x: this.oldPos.x + dx,
            y: this.oldPos.y + dy
        };
        this.setObjPos(newPos);
    };
    DragOrClick.prototype.touchEnd = function (e) {
        var obj = this.obj;
        this.touchEndTime = new Date().getTime();

        var touchTimeSpan = this.touchEndTime - this.touchStartTime;
        if (touchTimeSpan > 50 && touchTimeSpan < 250) {
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

    var btnDOC = new DragOrClick(btn);
    btnDOC.on('click', function () {
        listBox.style.display = 'block';
        getComputedStyle(listBox).display;

        listBox.style.opacity = 1;

        list.style.height = '80%';
    });
    var listBoxTransitionEnd = function () {
        if (listBox.style.opacity == 0) {
            listBox.style.display = 'none';
        }
    };
    listBox.addEventListener('touchend', function (e) {
        list.style.height = '0%';

        listBox.style.opacity = 0;
    });
    listBox.addEventListener('webkitTransitionEnd', listBoxTransitionEnd);
    listBox.addEventListener('transitionend', listBoxTransitionEnd);
    list.addEventListener('touchend', function (e) {
        e.stopPropagation();
    });

    function format(formatStr, args) {
        var reg = /{(\d+)}/gm;
        var res = formatStr.replace(reg, function (match, name) {
            return args[~~name];
        });
        return res.replace(/{{/g, '{').replace(/}}/, '}');
    }

    function locateToEnd() {
        var item = list.hasChildNodes() ? list.lastChild : null;
        if (!item) {
            return;
        }
        var listRect = list.getBoundingClientRect(),
            itemRect = item.getBoundingClientRect();
        if (itemRect.bottom > listRect.bottom) {
            list.scrollTop += itemRect.bottom - listRect.bottom;
        }
    }

    function log(formatStr) {
        var res = format(formatStr, arguments);
        var item = document.createElement('li');
        item.innerHTML = '&gt; ' + res;
        list.appendChild(item);
        locateToEnd();
    }

    console['log'] = log;

    var UseSimpleLogger = function () {
        _console = window.console != console ? window.console : _console;
        window.console = console;
        btn.style.display = 'block';
    };
    window['UseSimpleLogger'] = UseSimpleLogger;
    var HideSimpleLogger = function () {
        btn.style.display = 'none';
    };
    window['HideSimpleLogger'] = HideSimpleLogger;
    window['SimpleLogger'] = console;
}(window);