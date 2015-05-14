/**
 * Created by Grayson Rex on 2015/4/9.
 * Version: 1.01
 * Modify: 2015/5/14
 */
~function (window) {
    var _console = null, console = {};

    var listBox = null, list = null, btn = null;

    var initOK = false,
        cachedItems = [];

    // 初始化
    function init() {
        if (initOK) {
            return;
        }
        if (window.innerHeight && document.createElement && document.body && document.body.appendChild) {
            // 创建DOM
            createDOMs();
            // 绑定事件
            bindEvents();
            // 检查DOM创建完成前是否有缓存
            handleCachedItems();

            initOK = true;
        } else {
            window.setTimeout(init, 10);
        }
    }

    // 缓存日志（DOM未创建好时）
    function cacheItem(itemStr) {
        cachedItems.push(itemStr);
    }

    // 处理缓存的日志
    function handleCachedItems() {
        if (cachedItems && cachedItems.length) {
            for (var i = 0, cachedItem; cachedItem = cachedItems[i]; i++) {
                addLogItem(cachedItem);
            }
            cachedItems = [];
        }
    }

    // 格式化字符串
    function format(formatStr, args) {
        var reg = /{(\d+)}/gm;
        var res = formatStr.replace(reg, function (match, name) {
            var value = args[~~name];
            if (typeof(value) != 'string') {
                value = JSON.stringify(value);
            }
            return value;
        });
        return res.replace(/{{/g, '{').replace(/}}/, '}');
    }

    // 将日志列表定位到最底端
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

    // document.body未加载完前缓存起来的日志
    function addLogItem(itemStr) {
        var loh = list.offsetHeight,
            olsh = list.scrollHeight;

        var item = document.createElement('li');
        item.innerHTML = itemStr;
        list.appendChild(item);

        var nlsh = list.scrollHeight; // iOS中拖动问题
        if (olsh <= loh && nlsh > loh) {
            list.scrollTop = 1;
        }
    }

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

        var touchTimeSpan = this.touchEndTime - this.touchStartTime;
        if (touchTimeSpan > 25 && touchTimeSpan < 250) {
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

    // 创建页面所需的对象
    function createDOMs() {
        var dim = DragOrClick.getViewportDimension();

        listBox = document.createElement('div');
        listBox.style.position = 'fixed';
        listBox.style.zIndex = 2147483647;
        listBox.style.top = '0';
        listBox.style.left = '0';
        listBox.style.width = '100%';
        listBox.style.height = '100%';
        listBox.style.backgroundColor = 'rgba(0, 0, 0, .8)';
        listBox.style.opacity = 0;
        listBox.style.display = 'none';
        listBox.style.transform = listBox.style.webkitTransform = 'translate3d(0,0,0)';
        listBox.style.transition = listBox.style.webkitTransition = 'opacity 500ms';

        list = document.createElement('ul');
        list.style.position = 'absolute';
        list.style.top = '0';
        list.style.left = '0';
        list.style.width = '100%';
        list.style.height = '80%';
        list.style.boxSizing = 'border-box';
        list.style.backgroundColor = 'rgba(255, 255, 255, .7)';
        list.style.color = '#000000';
        list.style.fontSize = '12px';
        list.style.lineHeight = '20px';
        list.style.listStyle = 'none';
        list.style.overflowY = 'scroll';
        list.style.webkitOverflowScrolling = 'touch';
        list.style.margin = '0';
        list.style.padding = '2px 6px';
        list.style.transform = list.style.webkitTransform = 'translate3d(0,-100%,0)';
        list.style.transition = list.style.webkitTransition = 'all 500ms';

        btn = document.createElement('a');
        btn.style.position = 'fixed';
        btn.style.zIndex = 2147483647;
        btn.style.top = '10px';
        btn.style.left = (dim.w - 10 - 50) + 'px';
        btn.style.width = '50px';
        btn.style.height = '50px';
        btn.style.boxSizing = 'border-box';
        btn.style.backgroundColor = 'rgba(0, 0, 0, .6)';
        btn.style.border = '4px solid rgba(255, 255, 255, .2)'
        btn.style.borderRadius = '12px';
        btn.style.display = 'block';
        btn.style.color = '#FFFFFF';
        btn.style.transform = btn.style.webkitTransform = 'translate3d(0,0,0)';
        //btn.innerHTML = '0';
        document.body.addEventListener('touchstart', function () {
            /* For bug: QQ浏览器中，手指移出窗口外后，无法再触发对象的touchstart事件问题 */
            //btn.innerHTML = ~~btn.innerHTML + 1;
        });

        document.body.appendChild(btn);
        listBox.appendChild(list);
        document.body.appendChild(listBox);

        if (console._hideBtn) {
            console.hideBtn();
        }
    }

    // 绑定对象相关事件
    function bindEvents() {
        var btnDOC = new DragOrClick(btn);
        btnDOC.on('click', function () {
            console.expand();
        });

        // 动画结束时根据透明度情况隐藏外框
        var listBoxTransitionEnd = function () {
            if (listBox.style.opacity == 0) {
                listBox.style.display = 'none';
            }
        };
        listBox.addEventListener('webkitTransitionEnd', listBoxTransitionEnd);
        listBox.addEventListener('transitionend', listBoxTransitionEnd);

        // 阻止内部高度不够时，整个页面被拖动（iOS）
        var checkScrollable = function (e) {
            if (list.scrollHeight <= list.offsetHeight) {
                e.preventDefault();
            }
            e.stopPropagation();
        };
        list.addEventListener('touchstart', checkScrollable);
        list.addEventListener('touchmove', checkScrollable);

        // 阻止表格外框点击、拖动时整个页面的滚动
        var stopAndPrevent = function (e) {
            e.stopPropagation();
            e.preventDefault(); // 防止放大、页面滚动等操作
        };
        listBox.addEventListener('touchstart', function (e) {
            var listRect = list.getBoundingClientRect();
            var touchPos = DragOrClick.getTouchPos(e);
            if (touchPos && (touchPos.x < listRect.left || touchPos.x > listRect.right ||
                touchPos.y < listRect.top || touchPos.y > listRect.bottom)) {
                console.collapse();
            }
            stopAndPrevent(e);
        });
        listBox.addEventListener('touchmove', stopAndPrevent);
    }

    // 展开日志列表
    console.expand = function () {
        listBox.style.display = 'block';
        getComputedStyle(listBox).display;
        locateToEnd();

        listBox.style.opacity = 1;
        list.style.transform = list.style.webkitTransform = 'translate3d(0,0%,0)';
    };

    // 折叠日志列表
    console.collapse = function () {
        listBox.style.opacity = 0;
        list.style.transform = list.style.webkitTransform = 'translate3d(0,-100%,0)';
    };

    // 隐藏按键
    console.hideBtn = function () {
        if (btn) {
            btn.style.display = 'none';
        } else {
            console._hideBtn = true;
        }
    };

    // 记录日志
    console['log'] = function (formatStr) {
        if (typeof(formatStr) != 'string') {
            formatStr = JSON.stringify(formatStr);
        }
        var res = '<b>&gt;</b> ' + format(formatStr, arguments);
        if (!initOK || !list) {
            cacheItem(res);
        } else {
            addLogItem(res);
        }
    };

    // 替代原生的console
    console['pretend'] = function () {
        _console = window.console != console ? window.console : _console;
        window._console = _console;
        window.console = console;
    };

    // 是否替换原生的window.console
    if (!window['KeepOriginConsole']) {
        console.pretend();
    }

    //init();
    window.addEventListener('load', init);  // 部分客户端内特殊情况处理

    window['SimpleLogger'] = console;
}(window);