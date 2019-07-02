
const interval = (function (fn, interval, err) {
    var isFunction = function (f) { return typeof f === 'function'; };
    function Interval(fn, interval) {
        this.fn = fn;
        this.interval = interval;
        this.int = 0;
        this.counter = 0;
        this.initDate = +new Date;
        this.active = false;
        this.paused = false;
        this._onErr = null;
        this._onEnd = null;
        this._pause = null;
        this._resume = null;
    }
    Interval.prototype.clear = function () {
        this.active = false;
        this._onEnd && this._onEnd();
        return this;
    };
    Interval.prototype.onEnd = function (f) {
        if (isFunction(f)) {
            this._onEnd = f;
        }
        return this;
    };
    Interval.prototype.onErr = function (f) {
        if (isFunction(f)) {
            this._onErr = f;
        }
        return this;
    };
    Interval.prototype.pause = function () {
        this.paused = true;
        return this;
    };
    Interval.prototype.resume = function () {
        this.paused = false;
        return this;
    };
    Interval.prototype.runIfActive = function () {
        this.active && this.run();
        return this;
    };
    Interval.prototype.run = function () {
        this.active = true
        var self = this;
        this.int = this.interval + (this.initDate + (this.counter++ * this.interval) - new Date());
        setTimeout(function () {
            if (!self.paused) {
                try {
                    self.fn();
                } catch (e) {
                    self._onErr && self._onErr.call(self, e);
                    self.active = false;
                }
            }
            self.runIfActive.call(self);
        }, self.int);
        return this;
    };
    return function (fn, interval) {
        return new Interval(fn, interval);
    }
})();
(typeof exports === 'object') && (module.exports = interval);