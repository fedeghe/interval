var assert = require('assert'),
    interval = require('../dist/index.js');

describe('basic operations', () => {
    it('should converge (1s run with 100ms interval, 10ms tolerance)', () => {
        var inter = 100,
            tolerance = 10,
            times = [],
            c1 = interval(function () {
                var t = +new Date;
                times.push(t)
            }, inter).run();
        setTimeout(function () {
            c1.clear();
            for (var i = 0, l = times.length; i < l - 1; i++) {
                assert.equal(times[i + 1] - times[i] - inter < tolerance, true);
            }
        }, 1000);
    });
    it('should converge on a long run (10s run with 10ms interval, 10ms tolerance)', () => {
        var inter = 10,
            tolerance = 10,
            times = [],
            c1 = interval(function () {
                var t = +new Date;
                times.push(t)
            }, inter).run();
        setTimeout(function () {
            c1.clear();
            for (var i = 0, l = times.length; i < l - 1; i++) {
                assert.equal(times[i + 1] - times[i] - inter < tolerance, true);
            }
        }, 10000);
    });
    it('should throw an exception, and handle it', () => {
        var i = 0;
        var c1 = interval(function () {
            i++;
            if (i === 10) throw new Error('Error')
        }, 10).onErr(function (e) {
            assert.equal(e instanceof Error, true);
        }).run();
    });
    it('should run onEnd', (done) => {
        var i = 0;
        var c1 = interval(function () {
            i++;
        }, 10).onEnd(function (e) {
            done()
        }).run();
        setTimeout(function () {
            c1.clear();
        }, 200)
    });
    it('should pause and resume', () => {
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
            c1.clear();
        }, 305)
    });

});
