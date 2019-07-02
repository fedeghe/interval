var assert = require('assert'),
    interval = require('../dist/index.js');

describe('basic operations', () => {
    it('should return a function', () => {
        var c1 = interval(function () {
            done();
            c1();
        }, 1000);
        assert.equal(typeof c1, 'function');
    });
    it('should converge (1s run with 100ms interval, 10ms tolerance)', () => {
        var inter = 100,
            tolerance = 10,
            times = [],
            c1 = interval(function () {
                var t = +new Date;
                times.push(t)
            }, inter);
        setTimeout(function () {
            c1();
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
            }, inter);
        setTimeout(function () {
            c1();
            for (var i = 0, l = times.length; i < l - 1; i++) {
                assert.equal(times[i + 1] - times[i] - inter < tolerance, true);
            }
        }, 10000);
    });
    it('should throw an exception, and handle it', (done) => {
        var i = 0;
        var c1 = interval(function () {
            i++;
            if (i === 10) throw new Error('Error')
        }, 10, function (e) {
            assert.equal(typeof e === 'error');
            done();
        })
    });
});
