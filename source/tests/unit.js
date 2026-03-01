var interval = require('../dist/index.js');

describe('basic operations', () => {
    it('should converge and run onStart (1s run with 100ms interval, 10ms tolerance)', done => {
        var inter = 100,
            tolerance = 10,
            times = [],
            c1 = interval(function () {
                var t = +new Date;
                times.push(t)
            }, inter).run(inst => {
                setTimeout(function () {
                    c1.end();
                    for (var i = 0, l = times.length; i < l - 1; i++) {
                        expect(times[i + 1] - times[i] - inter < tolerance).toBe(true);
                    }
                    done()
                }, 1000);
            });
    });
    it('should converge on a long run (10s run with 10ms interval, 10ms tolerance)', done => {
        var inter = 10,
            tolerance = 100,
            times = [],
            c1 = interval(function () {
                var t = +new Date;
                times.push(t)
            }, inter).run();
        setTimeout(function () {
            c1.end();
            for (var i = 0, l = times.length; i < l - 1; i++) {
                expect(times[i + 1] - times[i] - inter < tolerance).toBe(true);
            }
            done()
        }, 10000);
    }, 15000);
    it('should throw an exception, and handle it', done => {
        var i = 0,
            t = 0;
        interval(function () {
            i++;
            if (i === 10) throw new Error('Error')
        }, 10)
        .onTick(() => {t++;})
        .onErr(function ({ error }) {
            expect(error instanceof Error).toBe(true);
            expect(t > 0).toBe(true);
            done();
        })
        .run();
    });
    it('should run onEnd, using endsIn', done => {
        var i = 0;
        interval(function () {i++;}, 10)
            .onEnd(function () {done(); })
            .endsIn(200)
            .run();
    });
    it('should pause and resume', done => {
        var i = 0;
        var c1 = interval(function () {
            i++;
        }, 10).run();
        setTimeout(function () {
            expect(i).toBe(10);
            c1.pause();
        }, 105)
        setTimeout(function () {
            expect(i).toBe(10);
            c1.resume();
        }, 205)
        setTimeout(function () {
            expect(i > 15).toBe(true);
            c1.end();
            done()
        }, 305)
    });
    it('should pause and resume - with eventhook', done => {
        var i = 0,
            hasPaused = false,
            hasResumed = false,
            c1 = interval(function () {
                    i++;
                }, 10)
                .endsIn(300)
                .onEnd(() => {
                    expect(i >= 18 && i <= 22).toBe(true);
                    expect(hasPaused).toBe(true);
                    expect(hasResumed).toBe(true);
                    done();
                })
                .onPause(() => {hasPaused = true;})
                .onResume(() => {hasResumed = true;})
                .run();
        
        setTimeout(function () {
            expect(i >= 9 && i <= 10).toBe(true);
            c1.pause();
        }, 100);
        setTimeout(function () {
            expect(i >= 9 && i <= 10).toBe(true);
            c1.resume();
        }, 205);
    });

    it('should pause and resume - sliding pause', (done) => {
        var targetEnd = 3e3,
            pauseAfter = 1e3,
            pauseLength = 1000,
            step = 100;
        var start, end,
            c1 = interval(() => {}, step)
                .endsIn(targetEnd)
                //.endsIn(targetEnd) //trigger edge case
                .onEnd(() => {
                    end = +new Date();
                    var elapsed = end - start,
                    shouldBe = targetEnd + pauseLength,
                    dist = Math.abs(elapsed - shouldBe);
                    
                    // some tolerance
                    expect(dist < step).toBe(true);
                    done()
                })
                .run(() => {start = +new Date();}),
                status = c1.getStatus();
        // console.log(status)
        expect(status).toHaveProperty('cycle');
        expect(status).toHaveProperty('elapsed');
        expect(status).toHaveProperty('effective');
        expect(status).toHaveProperty('remaining');
        expect(status).toHaveProperty('progress');
        setTimeout(function () {
            c1.pause(true);
        }, pauseAfter);
        setTimeout(function () {
            c1.resume();
        }, pauseAfter + pauseLength);
    }, 10e3);

    it('should tune as expected', done => {
        var targetEnd = 1e3,
            tuneAt = 500,
            tuning = 200,
            step = 100,
            start, end, tuned = false;
        interval(() => {}, step)
            .endsIn(targetEnd)
            .onTune(() => {tuned = true;})
            .onEnd(({ at }) => {
                end = at;
                var elapsed = end - start;
                
                // some tolerance
                expect(elapsed >= targetEnd + tuning).toBe(true);
                expect(tuned).toBe(true);
                done();
            })
            .at(tuneAt, ({ i }) => i.tune(tuning))
            .run(() => {start = +new Date();});


    });
});

describe('tuning', () => {
    it('should tune the end as expected (0.1% tolerance)', done => {
        var inter = 100,
            tolerance = 10,
            times = [],
            c1 = interval(function ({ at }) {
                times.push(at)
            }, inter).run(({ i }) => {
                setTimeout(function () {
                    c1.end();
                    for (var j = 0, l = times.length; j < l - 1; j++) {
                        expect(times[j + 1] - times[j] - inter < tolerance).toBe(true);
                    }
                    done()
                }, 1000);
            });
    });


    it('should update as expected', done => {
        var targetEnd = 1e3,
            tuning = 200,
            step = 100;
        var start, end, updated = false,
            c1 = interval(() => {}, step)
                .endsIn(targetEnd)
                .onTune(() => {updated = true;})
                .onEnd(({ at }) => {
                    end = at;
                    var elapsed = end - start;
                    
                    // some tolerance
                    expect(elapsed >= 1200).toBe(true);
                    expect(updated).toBe(true);
                    done();
                })
                .run(({ at }) => {start = at;});

        setTimeout(function () {
            c1.tune(tuning);
        }, 500);

    });
});

describe('edge cases', () => {
    it('when indefinite - tune is identity', done => {
        var tolerance = 0.01,
            attemptTuneAt = 200,
            endAt = 300,
            step = 100,
            updated = false,
            start, end;
        interval(() => {}, step)
            .run(({ at }) => {
                start = at;
            })
            .at(attemptTuneAt, ({ i }) => i.tune(200))
            .at(endAt, ({ i }) => i.end())
            .onTune(() => { updated = true; })
            .onEnd(({ at }) => {
                end = at;
                var elapsed = end - start;
                
                // some tolerance
                expect(elapsed > endAt * (1 - tolerance)).toBe(true);
                expect(elapsed < endAt * (1 + tolerance)).toBe(true);
                expect(updated === false).toBe(true);
                done();
            });
    });

    it('onStart through run wins', done => {
        var endAt = 300,
            step = 100,
            starter;
        interval(() => {}, step)
            .run(() => {
                starter = starter || 'run';
            })
            .at(endAt, ({ i }) => i.end())
            .onStart(() => { starter = starter || 'start' })
            .onEnd(() => {
                expect(starter === 'run').toBe(true);
                done();
            });
    });

    it('if undefinite, pause(true) is as pause', ( done ) => {
        var s1, t1,
            s2, t2,
            endAfter = 1000,
            step = 50;
        interval(() => {}, step)
            .run(({ at }) => { s1 = at; })
            .at(200, ({ i }) => i.pause(true))
            .at(400, ({ i }) => i.resume())
            .at(endAfter, ({ i }) => i.end())
            .onEnd(({ at }) => { t1 = at - s1; });
        interval(() => {}, step)
            .run(({ at }) => { s2 = at; })
            .at(200, ({ i }) => i.pause())
            .at(400, ({ i }) => i.resume())
            .at(endAfter, ({ i }) => i.end())
            .onEnd(({ at }) => { t2 = at - s2; });
        setTimeout(() => {
            expect(Math.abs(t1 - t2) < 5).toBe(true)
            done();
        }, endAfter + 10)
    });

    it('if undefinite, tune() has no effect, different way', ( done ) => {
        var s1, t1,
            s2, t2,
            endAfter = 1000,
            step = 50;
        interval(() => {}, step)
            .run(({ at }) => { s1 = at; })
            .at(200, ({ i }) => i.tune(5000))
            .at(endAfter, ({ i }) => i.end())
            .onEnd(({ at }) => { t1 = at - s1; });
        interval(() => {}, step)
            .run(({ at }) => { s2 = at; })
            .at(endAfter, ({ i }) => i.end())
            .onEnd(({ at }) => { t2 = at - s2; });
        setTimeout(() => {
            expect(Math.abs(t1 - t2) < 5).toBe(true)
            done();
        }, endAfter + 10)
    });
});
