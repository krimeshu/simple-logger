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