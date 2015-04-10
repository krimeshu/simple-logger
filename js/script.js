/**
 * Created by Grayson Rex on 2015/3/24.
 */
(function (window) {

    var isOnline = window.location.protocol.indexOf('http') == 0
        && window.location.hostname != 'localhost' && window.location.hostname != '127.0.0.1';

    /**
     * 获取屏幕分辨率
     * @returns {{w: 宽度, h: 高度}}
     */
    function getViewportDimension() {
        var e = window, a = 'inner';
        if (!( 'innerWidth' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return {w: e[a + 'Width'], h: e[a + 'Height']};
    }

    // 获取viewport分辨率
    var dim = getViewportDimension();

    // Leaf类 start
    /**
     * 叶片类
     * @param ox 初始x坐标
     * @param dx 飘落目标x坐标
     * @param speed 飘落速度
     * @param size 缩放尺寸
     * @constructor
     */
    function Leaf(ox, dx, speed, size) {
        this.ox = ox || Math.floor(Math.random() * 3 * dim.w - dim.w);  // 初始x坐标
        this.dx = dx ||
        (this.ox < 0 ? Math.floor(Math.random() * 2 * dim.w) :
            this.ox < dim.w ? Math.floor(Math.random() * 3 * dim.w - dim.w) :
            Math.random() * 2 * dim.w - dim.w);  // 目标x坐标
        this.speed = speed || Math.floor(Math.random() * 4 + 3);  // 下落速度
        this.size = size || Math.floor(Math.random() * 6 + 4) / 10;  // 尺寸
        this.dw = leafImgSize.dw * this.size;
        this.dh = leafImgSize.dh * this.size;
        this.dstep = 20;  // 目标动画帧
        this.oy = 0;  // 初始y坐标
        this.dy = dim.h;  // 目标y坐标

        this.x = this.ox;  // 当前x坐标
        this.y = this.oy;  // 当前y坐标
        this.step = 0;  // 当前动画帧
        this.dropOver = false;  // 是否飘落结束

        console.log('New Leaf {{ from: ({1}, {2}), to: ({3}, {4}), speed: {5}, size: {6} }}',
            this.ox, this.oy, this.dx, this.dy, this.speed, this.size);
    }

    // Leaf类对象方法
    /**
     * 叶片下落
     */
    Leaf.prototype.drop = function () {
        this.y += this.speed;
        if (this.y >= this.dy) {
            // 已完成飘落
            this.dropOver = true;
            return;
        }

        var per = this.per = this.y / this.dy;
        this.step = Math.floor(this.dstep * per);  // 计算动画帧
        this.x = this.ox + Math.floor((this.dx - this.ox) * per);
    };
    /**
     * 绘制叶片
     * @param ctx 画板的context
     */
    Leaf.prototype.draw = function (ctx) {
        var row = Math.floor(this.step / 10);
        var col = this.step % 10;
        var opc = this.per < .8 ? this.per * 1.25 : 1;
        ctx.globalAlpha = opc;
        ctx.drawImage(leavesImg, col * leafImgSize.w, row * leafImgSize.h, leafImgSize.w, leafImgSize.h,
            this.x, this.y, this.dw, this.dh);
    };
    // Leaf类 end

    // 画板上需要绘制的花瓣对象
    var leaves = [];

    var cvs = document.createElement('canvas'),
        cvsSize = {w: 0, h: 0, r: 0};
    /**
     * 根据屏幕分辨率调整画板尺寸
     * @param dim
     */
    var setCanvasSize = function (dim) {
        // 将canvas尺寸适应viewport分辨率
        cvsSize.w = cvs.width = dim.w;
        cvsSize.h = cvs.height = dim.h;
        cvsSize.r = cvsSize.w / cvsSize.h;
    };
    setCanvasSize(dim);

    document.body.appendChild(cvs);

    var ctx = cvs.getContext('2d');

    // 加载背景图资源
    var bgImg = document.createElement('img'),
        bgImgSize = {w: 0, h: 0, dw: 0, dh: 0, ox: 0, oy: 0},
        bgImgOK = false,
        bgImgLoaded = function () {
            bgImgSize.w = bgImg.naturalWidth;
            bgImgSize.h = bgImg.naturalHeight;
            bgImgOK = true;
            checkAllImgsOK();
        };
    bgImg.onload = bgImgLoaded;
    bgImg.src = isOnline ? "#link('{PROJECT}/img/bg.jpg')" : 'img/bg.jpg';

    /**
     * 根据画布尺寸计算背景尺寸，作为绘制时的参数
     */
    var calculateBgSize = function () {
        // 获取画布与背景尺寸，做相应缩放
        var cw = cvsSize.w, ch = cvsSize.h, cr = cvsSize.r;
        var obw = bgImgSize.w, obh = bgImgSize.h, br = obw / obh;
        var bw = obw, bh = obh, ox = 0, oy = 0;

        if (br > cr) {
            bw = Math.round(cw * obh / ch);
            ox = (obw - bw) / 2;
        } else {
            bh = Math.round(ch * obw / cw);
            oy = (obh - bh) / 2;
        }
        bgImgSize.dw = bw;
        bgImgSize.dh = bh;
        bgImgSize.ox = ox;
        bgImgSize.oy = oy;
    };

    // 窗口尺寸变化时重新计算画板、背景尺寸
    window.addEventListener('resize', function () {
        dim = getViewportDimension();
        setCanvasSize(dim);
        calculateBgSize();
    });

    // 加载花瓣图资源
    var leavesImg = document.createElement('img'),
        leavesImgSize = {w: 0, h: 0},
        leafImgSize = {w: 0, h: 0, dw: 0, dh: 0},
        leavesImgOK = false,
        leavesImgLoaded = function () {
            leavesImgSize.w = leavesImg.naturalWidth;
            leavesImgSize.h = leavesImg.naturalHeight;
            leafImgSize.w = Math.round(leavesImgSize.w / 10);
            leafImgSize.h = Math.round(leavesImgSize.h / 2);
            leafImgSize.dw = Math.round(leafImgSize.w / 10);
            leafImgSize.dh = Math.round(leafImgSize.h / 10);
            leavesImgOK = true;
            checkAllImgsOK();
        };
    leavesImg.onload = leavesImgLoaded;
    leavesImg.src = isOnline ? "#link('{PROJECT}/img/leaves.png')" : 'img/leaves.png';

    /**
     * 摇动手机时生成Leaf对象
     * @param speedAll 摇动总速度
     * @param speedX X轴上的摇动速度
     * @param speedY Y轴上的摇动速度
     * @param speedZ Z轴上的摇动速度
     */
    var onShake = function (speedAll, speedX, speedY, speedZ) {
        var c = speedAll / 200 + 2;
        for (var i = 0; i < c; i++) {
            var ox = Math.round(Math.random() * cvsSize.w * 2),
                dx = Math.round(Math.random() * cvsSize.w * 2 - cvsSize.w);
            if (speedX < 0) {
                var t = ox;
                ox = dx;
                dx = t;
            }
            var speed = (speedAll / 2000) + (Math.random() * 2) + 1;
            leaves.push(new Leaf(ox, dx, speed));
        }
        //alert('all: ' + speedAll + ', x: ' + speedX + ', y: ' + speedY + ', z: ' + speedZ);
    };
    //window['onShake'] = onShake;

    /**
     * 检查是否所有资源加载完毕
     */
    var checkAllImgsOK = function () {
        if (!bgImgOK || !leavesImgOK) {
            return;
        }

        calculateBgSize();

        window.bindShakeListener(onShake);

        drawLeaves(new Date().getTime());
    }

    var fps = 45, last = new Date(), intv = 1000 / fps;
    /**
     * 开始绘制花瓣
     * @param timestamp 绘制帧时刻的时间戳
     */
    var drawLeaves = function (timestamp) {
        window.requestAnimationFrame(drawLeaves);

        var now = new Date();
        var d = now - last;
        if (d < intv) {
            return;
        }
        last = now - (d % intv);

        // 偶尔随机生成
        if (Math.random() < .02) {
            leaves.push(new Leaf());
        }

        // 绘制背景
        ctx.globalAlpha = 1;
        ctx.drawImage(bgImg, bgImgSize.ox, bgImgSize.oy, bgImgSize.dw, bgImgSize.dh, 0, 0, cvsSize.w, cvsSize.h);

        var recycleLeaves = [];
        for (var i = 0, leaf; leaf = leaves[i]; i++) {
            leaf.drop();  // 执行飘落
            if (!leaf.dropOver) {  // 未飘落到底的画到屏幕上
                leaf.draw(ctx);
            } else {  // 飘落到底则等待回收
                recycleLeaves.push(leaf);
            }
        }
        // 回收飘落到底的对象
        for (var i = 0, leaf; leaf = recycleLeaves[i]; i++) {
            var pos = leaves.indexOf(leaf);
            leaves.splice(pos, 1);
        }
    };
})(window);

// requestAnimationFrame前缀处理、向下兼容
(function () {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    // MIT license

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}());

// 摇一摇监听模块
(function (window) {
    var SHAKE_THRESHOLD = 1000;
    var last_update = 0;
    var x = 0, y = 0, z = 0, last_x = 0, last_y = 0, last_z = 0;
    var listeners = [];

    function init() {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        } else {
            alert('not support mobile event');
        }
    }

    function deviceMotionHandler(eventData) {
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();
        if ((curTime - last_update) > 100) {
            var diffTime = curTime - last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;

            var speedX = (x - last_x) / diffTime * 10000,
                speedY = (y - last_y) / diffTime * 10000,
                speedZ = (z - last_z) / diffTime * 10000,
                speedAll = Math.abs(speedX) + Math.abs(speedY) + Math.abs(speedZ);

            if (speedAll > SHAKE_THRESHOLD) {
                triggerShakeListener(speedAll, speedX, speedY, speedZ);
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
    }

    function triggerShakeListener(speedAll, speedX, speedY, speedZ) {
        for (var i = 0, listener; listener = listeners[i]; i++) {
            if (typeof(listener) == 'function') {
                listener(speedAll, speedX, speedY, speedZ);
            }
        }
    }

    function bindShakeListener(listener) {
        listeners.push(listener);
    }

    window['bindShakeListener'] = bindShakeListener;

    function unbindShakeListener(listener) {
        var pos = listeners.indexOf(listener);
        if (pos >= 0) {
            listeners.splice(pos, 1);
        }
    }

    window['unbindShakeListener'] = unbindShakeListener;

    init();
})(window);
