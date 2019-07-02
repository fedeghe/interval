/**
 * @param {function} theTargetFunction this is the function you may want to execute every x ms
 * @param {int} interval This is the interval in ms between one execution and the following
 * @param {function} [errHandler] optionally if an error occurs while executing theTargetFunction the error will be forwarded to this function
 */
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