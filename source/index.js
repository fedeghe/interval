
const interval = (function (fn, interval, err) {
    var isFunction = function (f) { return typeof f === 'function'; };
    function Interval (fn, interval) {
        this.fn = fn;
        this.interval = interval;
        this.int = 0;
        this.counter = 0;
        this.initDate = +new Date();
        this.active = false;
        this.paused = false;
        this._onErr = null;
        this._onEnd = null;
        this._onPause = null;
        this._onResume = null;
        this._pause = null;
        this._resume = null;
    }
    Interval.prototype.onEnd = function (f) {
        if (isFunction(f)) { this._onEnd = f; } return this;
    };
    Interval.prototype.onErr = function (f) {
        if (isFunction(f)) { this._onErr = f; } return this;
    };
    Interval.prototype.onPause = function (f) {
        if (isFunction(f)) { this._onPause = f; } return this;
    };
    Interval.prototype.onResume = function (f) {
        if (isFunction(f)) { this._onResume = f; } return this;
    };
    Interval.prototype.end = function () {
        this.active = false;
        this._onEnd && this._onEnd(this);
        return this;
    };
    Interval.prototype.endsIn = function (ms) {
        var self = this;
        setTimeout(function () { self.end(); }, ms);
        return this;
    };
    Interval.prototype.pause = function () {
        this.paused = true;
        this._onPause && this._onPause(this);
        return this;
    };
    Interval.prototype.resume = function () {
        this.paused = false;
        this._onPause && this._onResume(this);
        return this;
    };
    Interval.prototype.runIfActive = function () {
        this.active && this.run();
        return this;
    };
    Interval.prototype.run = function (onStart) {
        this.active = true;
        var self = this;
        this.int = this.interval + (this.initDate + (this.counter++ * this.interval) - new Date());
        onStart && onStart(self);
        setTimeout(function () {
            if (!self.paused && self.active) {
                try {
                    self.fn(self.counter - 1);
                } catch (e) {
                    self._onErr &&
                        self._onErr(e);
                    self.active = false;
                }
            }
            self.runIfActive();
        }, self.int);
        return this;
    };
    return function (fn, interval) {
        return new Interval(fn, interval);
    };
})();
(typeof exports === 'object') && (module.exports = interval);
