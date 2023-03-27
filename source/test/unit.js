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
    it('should throw an exception, and handle it', done => {
        var i = 0;
        var c1 = interval(function () {
            i++;
            if (i === 10) throw new Error('Error')
        }, 10).onErr(function (e) {
            assert.equal(e instanceof Error, true);
            done();
        }).run();
    });
    it('should run onEnd, using endsIn', done => {
        var i = 0;
        interval(function () {i++;}, 10)
            .onEnd(function (e) {done()})
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
            paused = false,
            resumed = false;
        var c1 = interval(function () {
            i++;
        }, 10).endsIn(305).onEnd(() => {
            assert.equal(i, 20);
            assert.ok(paused);
            assert.ok(resumed);
            done()
        })
        .onPause(() => {paused = true;})
        .onResume(() => {resumed = true;})
        .run();
        
        setTimeout(function () {
            assert.equal(i, 10);
            c1.pause();
        }, 105)
        setTimeout(function () {
            assert.equal(i, 10);
            c1.resume();
        }, 205)
        
    });

});
