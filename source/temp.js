var interval = (function () {
    function Now () { return +new Date(); }
    function isFunction (fn) { return typeof fn === 'function'; }
    function runHooks (instance, which, params) {
        which in instance.subscribers &&
        instance.subscribers[which].forEach(
            function (subscriber) { subscriber(Object.assign({}, params, { instance: instance })); }
        );
    }

    function getInfo (self, theEnd) {
        var total = self.EndTime - self.StartTime,
            elapsed = Now() - self.StartTime,
            effective = elapsed - self.pauses,
            remaining = self.definite ? total - elapsed + self.pauses : undefined,
            progress;
        remaining = Math.max(0, remaining);
        progress = self.definite
            ? parseFloat((100 - 100 * remaining / total).toFixed(3), 10)
            : undefined;

        if (theEnd) {
            remaining = 0;
            progress = 100;
        }
        return {
            at: Now(),
            instance: self,
            cycle: self.cycle - self.addedCycles,
            elapsed: elapsed,
            effective: effective,
            remaining: remaining,
            progress: progress,
            status: self.status
        };
    }

    /**
     * basic fix to setTimeout delays on the long (and even short run)
     * this is very more than enough to fix the native divergent misbehaviour
     */
    function getNext (self) {
        /**
           SD
            0         1         2         3         4         5         6         7
            |=========|=========|=========|=========|=========|=========|=========|=========
            o-------|
                   now
                    |---------|E|
                            bad = now + tick
                                |
                                |
                                trg = SD + tick * cycle

         */
        var now = Now(),
            target = self.StartTime + (self.cycle + 1) * self.tick,
            bad = now + self.tick,
            fix = target - bad;
        return self.tick + fix;
    }

    function Interval (fn, tick) {
        this.tick = tick;
        this.StartTime = null;
        this.EndTime = null;
        this.status = 'init';
        this.pauses = 0;
        this.cycle = 0;
        this.endsAfter = 0;
        this.addedCycles = 0;
        this.finalTo = null;
        this.tickerTo = null;

        this.started = false;
        this.sliding = false;
        this.definite = false;

        this.subscribers = {
            start: [],
            pause: [],
            resume: [],
            end: [],
            tune: [],
            tick: [],
            err: []
        };

        this.onTick(fn);
    }

    Interval.prototype.getStatus = function () { return getInfo(this); };

    // Interval.prototype.decrement = function (ms) { return this.increment(-ms); };
    Interval.prototype.tune = function (ms) {
        if (!this.definite) return this;
        var now = Now(),
            increment = parseInt(ms, 10),
            elapsed, remaining, total;

        this.EndTime += increment;
        elapsed = now - this.StartTime - this.pauses;
        total = this.EndTime - this.StartTime;
        remaining = total - elapsed;

        /* instabul ingore-next */
        if (increment) {
            clearTimeout(this.finalTo);
            if (remaining > 0) {
                this.endsIn(remaining);
            }
            runHooks(this, 'tune', Object.assign({}, getInfo(this), { ms: ms }));
        }
        return this;
    };

    Interval.prototype.endsIn = function (ms) {
        this.endsAfter = Math.abs(parseInt(ms, 10));
        this.definite = true;
        this.resetEnd();
        return this;
    };

    Interval.prototype.resetEnd = function () {
        var self = this;
        if (this.finalTo) clearTimeout(this.finalTo);
        this.finalTo = setTimeout(function () {
            self.end();
        }, this.endsAfter);
    };

    Interval.prototype.run = function (onStart) {
        if (this.status === 'error') return this;
        this.StartTime = this.StartTime || Now();
        if (this.definite) this.EndTime = this.EndTime || (this.StartTime + this.endsAfter);

        var self = this,
            next = getNext(this);

        // only on first invocation
        if (!this.started) {
            this.status = 'running';
            onStart && this.onStart(onStart, true);
            runHooks(this, 'start', { instance: self });
            this.started = true;
            this.resetEnd();
        }

        this.tickerTo = setTimeout(function () {
            if (['ended', 'error'].includes(self.status)) return self;
            var info = getInfo(self);
            try {
                self.status === 'running' && runHooks(self, 'tick', info);
                self.cycle++;
            } catch (e) {
                self.status = 'error';
                runHooks(self, 'err', Object.assign(info, { error: e }));
            }
            self.run();
        }, next);
        return this;
    };

    Interval.prototype.pause = function (sliding) {
        this.status = 'paused';
        runHooks(this, 'pause', getInfo(this));
        this.sliding = !!sliding;
        clearTimeout(this.finalTo);
        this.pauseStart = Now();
        return this;
    };

    Interval.prototype.resume = function () {
        this.status = 'running';

        runHooks(this, 'resume', getInfo(this));
        var now = Now(),
            elapsed, total, remaining, pausedFor = now - this.pauseStart;

        this.addedCycles += ~~(pausedFor / this.tick);

        this.pauses += this.sliding && pausedFor;

        elapsed = now - this.StartTime - this.pauses;
        total = this.EndTime - this.StartTime;
        remaining = total - elapsed;

        this.endsAfter = remaining;
        this.resetEnd();

        this.sliding = false;
        return this;
    };

    Interval.prototype.end = function () {
        this.status = 'ended';
        runHooks(this, 'end', getInfo(this, true));
        return this;
    };

    Interval.prototype.onStart = function (fn, first) {
        if (isFunction(fn)) {
            var method = first ? 'unshift' : 'push';
            this.subscribers.start[method](fn);
        }
        return this;
    };

    Interval.prototype.onPause = function (fn) { if (isFunction(fn)) this.subscribers.pause.push(fn); return this; };
    Interval.prototype.onResume = function (fn) { if (isFunction(fn)) this.subscribers.resume.push(fn); return this; };
    Interval.prototype.onTick = function (fn) { if (isFunction(fn)) this.subscribers.tick.push(fn); return this; };
    Interval.prototype.onErr = function (fn) { if (isFunction(fn)) this.subscribers.err.push(fn); return this; };
    Interval.prototype.onEnd = function (fn) { if (isFunction(fn)) this.subscribers.end.push(fn); return this; };
    Interval.prototype.onTune = function (fn) { if (isFunction(fn)) this.subscribers.tune.push(fn); return this; };
    Interval.prototype.at = function (time, fn) {
        var self = this;
        setTimeout(function () { fn({ instance: self }); }, time);
        return this;
    };

    return function (fn, tick) {
        return new Interval(fn, tick);
    };
})();

(typeof exports === 'object') && (module.exports = interval);
