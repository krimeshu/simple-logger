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