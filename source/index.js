var interval = (function () {
    var statuses = {
        init: 'init',
        running: 'running',
        paused: 'paused',
        ended: 'ended',
        error: 'error'
    };
    function Now () { return +new Date(); }
    function isFunction (fn) { return typeof fn === 'function'; }
    function switchState (instance, newStatus) {
        var changeState = false;
        switch (instance.status) {
        case statuses.init:
            changeState = newStatus === statuses.running;
            break;
        case statuses.running:
            changeState = [statuses.running, statuses.paused, statuses.ended].includes(newStatus);
            break;
        case statuses.paused:
            changeState = [statuses.running, statuses.ended].includes(newStatus);
            break;
        }
        changeState = changeState || newStatus === statuses.error;
        if (changeState) {
            instance.status = newStatus;
        }
        return changeState;
    }

    function runHooks (instance, which, params) {
        params = params || {};
        which in instance.subscribers &&
        instance.subscribers[which].forEach(
            function (subscriber) { subscriber(Object.assign({}, params, { instance: instance })); }
        );
    }

    function Interval (fn, tick) {
        this.tick = tick;
        /**
         * until run gets called this must not have a consumable value */
        this.StartTime = null;

        // ticking timeout

        /**
         * this is the very beginning status before run */
        this.status = statuses.init;

        /**
         * by default the interval is undefined, meaning that it is not set to end at a certain point,
         * indeed this can only be achieved invoking endsIn (thus is known befor starting)
         * it can still be ended programmatically invoking end() (for example within an independent setTimeout)
         * but in that case Interval cant know the planned end.
         * Now it is clear that:
         * - either is definite, and this is activate only invoking endsIn()
         * - either is undefinite
         * still it is possible that a Interval starts running as undefinite and after some time becomes definite
         * > const I = interval(console.log, 100)
         * >    .run()
         * >    setTimeout(() => {
         * >        I.endsIn(3000)
         * >    }, 2000)
         * here only lately, (or maybe triggered by a user event) we declare it will end after 2 seconds
         *
         * this gets a value only through acall to endsIn(ms), thus will hold the ms value
         */
        this.definite = false;
        this.definiteDown = false;
        // but the timeout need to be anyway set
        this.definiteTo = null;

        /**
         * only in the definite case, make sense to distinguish the two following behaviour of the pause/resume
         * when we pause we might want to:
         * either only pause the notifications (and the end will remain fixed)
         * either we pause the notifications AND the ending time slides forward to take into account the time between pause and resume
         */
        this.sliding = false;

        /**
         * cumulative pause, more than once could be called
         */
        this.pauses = 0;
        this.pauseStart = null;

        // cycle
        this.cycle = 0;
        /**
         * event hooks containers */
        this.subscribers = {
            start: [],
            pause: [],
            resume: [],
            end: [],
            tick: [],
            err: []
        };

        // ticking notifications to
        this.to = null;

        this.addedCycles = 0;

        // add tick
        this.onTick(fn);
    }

    Interval.prototype.run = function (onStart) {
        if (!switchState(this, statuses.running)) return;
        this.StartTime = this.StartTime || Now();

        var self = this,
            now = Now(),
            target = this.StartTime + (this.cycle + 1) * this.tick,
            bad = now + this.tick,
            addFix = target - bad,
            next = this.tick + addFix;

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
        if (onStart) {
            this.onStart(onStart);
            runHooks(this, 'start');
        }

        this.to = setTimeout(function () {
            if ([statuses.ended, statuses.paused, statuses.error].includes(self.status)) return self;
            try {
                var total = Now() - self.StartTime,
                    effective = total - self.pauses,
                    remaining = self.definite ? self.definite - total + self.pauses : undefined,
                    percentage = self.definite
                        ? parseFloat((100 * remaining / self.definite).toFixed(3), 10)
                        : undefined;
                runHooks(self, 'tick', {
                    cycle: self.cycle - self.addedCycles,
                    elapsed: total,
                    effective: effective,
                    remaining: remaining,
                    percentage: percentage
                });
                self.cycle++;
            } catch (e) {
                switchState(self, statuses.error);
                runHooks(self, 'err', { error: e });
            }
            self.run();
        }, next);
        return this;
    };

    Interval.prototype.pause = function (sliding) {
        if (!switchState(this, statuses.paused)) return this;
        runHooks(this, 'pause');
        // might need to move the end forward, before
        // setting again the definiteTo on resume
        this.sliding = !!sliding && this.definite;
        clearTimeout(this.to);
        if (this.definite) {
            clearTimeout(this.definiteTo);
        }
        this.pauseStart = Now();
        return this;
    };

    Interval.prototype.resume = function () {
        if (!switchState(this, statuses.running)) return this;
        var self = this,
            now = Now(),
            pausedFor = now - this.pauseStart,
            elapsed;
        this.pauses += pausedFor;

        // cycle needs to be updated so to be able
        this.addedCycles += ~~(pausedFor / this.tick);
        this.cycle += this.addedCycles;
        elapsed = now - this.StartTime - (this.sliding ? this.pauses : 0);

        this.definiteDown = this.definite - elapsed;

        this.sliding = false;
        this.run();
        runHooks(this, 'resume');
        if (this.definite) {
            this.definiteTo = setTimeout(function () {
                self.end();
            }, this.definiteDown);
        }
        return this;
    };

    Interval.prototype.endsIn = function (ms) {
        var self = this;
        this.definite = Math.abs(parseInt(ms, 10));
        // clar it in case it exists already
        if (this.definiteTo) clearTimeout(this.definiteTo);
        // and set it
        this.definiteTo = setTimeout(function () {
            self.end();
        }, this.definite);
        return this;
    };

    Interval.prototype.end = function () {
        if (!switchState(this, statuses.ended)) return;
        runHooks(this, 'end');
        return this;
    };
    Interval.prototype.onStart = function (fn) { if (isFunction(fn)) this.subscribers.start.push(fn); return this; };
    Interval.prototype.onPause = function (fn) { if (isFunction(fn)) this.subscribers.pause.push(fn); return this; };
    Interval.prototype.onResume = function (fn) { if (isFunction(fn)) this.subscribers.resume.push(fn); return this; };
    Interval.prototype.onTick = function (fn) { if (isFunction(fn)) this.subscribers.tick.push(fn); return this; };
    Interval.prototype.onErr = function (fn) { if (isFunction(fn)) this.subscribers.err.push(fn); return this; };
    Interval.prototype.onEnd = function (fn) { if (isFunction(fn)) this.subscribers.end.push(fn); return this; };

    return function (fn, tick) {
        return new Interval(fn, tick);
    };
})();

(typeof exports === 'object') && (module.exports = interval);
