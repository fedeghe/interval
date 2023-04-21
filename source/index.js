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

    function getInfo (self) {
        var total = Now() - self.StartTime,
            effective = total - self.pauses,
            remaining = self.definite ? self.definite - total + self.pauses : undefined,
            progress = self.definite
                ? parseFloat((100 - 100 * remaining / self.definite).toFixed(3), 10)
                : undefined;
        return {
            cycle: self.cycle - self.addedCycles,
            elapsed: total,
            effective: effective,
            remaining: remaining,
            progress: progress
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
        /**
         * until run gets called this must not have a consumable value */
        this.StartTime = null;

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
            update: [],
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

    Interval.prototype.getStatus = function () {
        return getInfo(this);
    };

    Interval.prototype.update = function (ms) {
        var howMuch = parseInt(ms, 10), end;
        /* instabul ingore-next */
        if (howMuch && this.definite) {
            end = this.definite + howMuch;
            clearTimeout(this.definiteTo);
            end > 0 && this.endsIn(end);
        }
        runHooks(this, 'update', getInfo(this));
        return this;
    };

    Interval.prototype.run = function (onStart) {
        if (this.status === statuses.error) return this;

        // violate the machine
        if (this.status === statuses.init) this.status = statuses.running;
        this.StartTime = this.StartTime || Now();

        var self = this,
            next = getNext(this);

        if (onStart) {
            this.onStart(onStart);
            runHooks(this, 'start', { instance: self });
        }

        this.to = setTimeout(function () {
            if ([statuses.ended, statuses.error].includes(self.status)) return self;
            var info = getInfo(self);
            try {
                self.status === statuses.running && runHooks(self, 'tick', info);
                self.cycle++;
            } catch (e) {
                switchState(self, statuses.error);
                runHooks(self, 'err', Object.assign(info, { error: e }));
            }
            self.run();
        }, next);
        return this;
    };

    Interval.prototype.pause = function (sliding) {
        if (!switchState(this, statuses.paused)) return this;
        runHooks(this, 'pause', getInfo(this));
        // might need to move the end forward, before
        // setting again the definiteTo on resume
        this.sliding = !!sliding && this.definite;
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

        this.pauses += this.sliding ? pausedFor : 0;

        elapsed = now - this.StartTime - this.pauses;
        this.definiteDown = this.definite - elapsed;
        this.sliding = false;

        this.addedCycles += ~~(pausedFor / this.tick);

        runHooks(this, 'resume', getInfo(this));
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
        // clear it in case it exists already
        if (this.definiteTo) clearTimeout(this.definiteTo);
        // and set it
        this.definiteTo = setTimeout(function () {
            self.end();
        }, this.definite);
        return this;
    };

    Interval.prototype.end = function () {
        if (!switchState(this, statuses.ended)) return;
        runHooks(this, 'end', getInfo(this));
        return this;
    };

    Interval.prototype.onStart = function (fn) { if (isFunction(fn)) this.subscribers.start.push(fn); return this; };
    Interval.prototype.onPause = function (fn) { if (isFunction(fn)) this.subscribers.pause.push(fn); return this; };
    Interval.prototype.onResume = function (fn) { if (isFunction(fn)) this.subscribers.resume.push(fn); return this; };
    Interval.prototype.onUpdate = function (fn) { if (isFunction(fn)) this.subscribers.update.push(fn); return this; };
    Interval.prototype.onTick = function (fn) { if (isFunction(fn)) this.subscribers.tick.push(fn); return this; };
    Interval.prototype.onErr = function (fn) { if (isFunction(fn)) this.subscribers.err.push(fn); return this; };
    Interval.prototype.onEnd = function (fn) { if (isFunction(fn)) this.subscribers.end.push(fn); return this; };

    return function (fn, tick) {
        return new Interval(fn, tick);
    };
})();

(typeof exports === 'object') && (module.exports = interval);
