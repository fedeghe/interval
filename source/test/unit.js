var assert = require('assert'),
    interval = require('../dist/index.js');

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
                        assert.equal(times[i + 1] - times[i] - inter < tolerance, true);
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
                assert.equal(times[i + 1] - times[i] - inter < tolerance, true);
            }
            done()
        }, 10000);
    }).timeout(15000);
    it('should throw an exception, and handle it', () => {
        var i = 0,
            t = 0;
        interval(function () {
            i++;
            if (i === 10) throw new Error('Error')
        }, 10)
        .onTick(() => {t++;})
        .onErr(function ({ error }) {
            assert.equal(error instanceof Error, true);
            assert.ok(t > 0);
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
            assert.equal(i, 10);
            c1.pause();
        }, 105)
        setTimeout(function () {
            assert.equal(i, 10);
            c1.resume();
        }, 205)
        setTimeout(function () {
            assert.equal(i > 15, true);
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
                
                    assert.ok(i >= 18 && i <= 22);
                    assert.ok(hasPaused);
                    assert.ok(hasResumed);
                    done()
                })
                .onPause(() => {hasPaused = true;})
                .onResume(() => {hasResumed = true;})
                .run();
        
        setTimeout(function () {
            assert.ok(i >= 9 && i <= 10);
            c1.pause();
        }, 100);
        setTimeout(function () {
            assert.ok(i >= 9 && i <= 10);
            c1.resume();
        }, 205);
    });

    it('should pause and resume - sliding pause', done => {
        var targetEnd = 3e3,
            pauseAfter = 1e3,
            pauseLength = 4000,
            step = 100;
        var start, end,
            c1 = interval(() => {}, step)
                .endsIn(targetEnd)
                .endsIn(targetEnd) //trigger edge case
                .run(() => {start = +new Date();})
                .onEnd(() => {
                    end = +new Date();
                    var elapsed = end - start,
                        shouldBe = targetEnd + pauseLength,
                        dist = Math.abs(elapsed - shouldBe);
                    
                    // some tolerance
                    assert.ok(dist < step);
                    done();
                }),
                status = c1.getStatus();
        assert('cycle' in status);
        assert('elapsed' in status);
        assert('effective' in status);
        assert('remaining' in status);
        assert('progress' in status);
        setTimeout(function () {
            c1.pause(true);
        }, 1000);
        setTimeout(function () {
            c1.resume();
        }, pauseAfter + pauseLength);
    }).timeout(10000);
});
describe('edge cases', () => {
    it('cant pause when not started', done => {
        var step = 10,
            c1 = interval(() => {}, step)
                .endsIn(100);
    
        setTimeout(function () {
            c1.pause();
            assert(c1.status === 'init');
            done();
        }, 200);
    });
    it('cant resume when ended', done => {
        var step = 10,
            c1 = interval(() => {}, step)
                .endsIn(100).run();
    
        setTimeout(function () {
            c1.resume();
            assert(c1.status === 'ended');
            done();
        }, 200);
    });
    it('cant end when not started', done => {
        var step = 10,
            c1 = interval(() => {}, step)
                .endsIn(100);
    
        setTimeout(function () {
            c1.end();
            assert(c1.status === 'init');
            done();
        }, 200);
    });

});
