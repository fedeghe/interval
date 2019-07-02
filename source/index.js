const interval = function (fn, interval, err) {
    var active = true,
        i = 0,
        int = interval,
        init = +new Date;
    (function run() {
        int = interval + (init + (i++ * interval) - new Date());
        setTimeout(function () {
            try {
                fn();
            } catch (e) {
                err && err(e);
                active = false;
            }
            active && run();
        },
            int);
    })();
    return function () {
        active = false;
    };
};
(typeof exports === 'object') && (module.exports = interval);