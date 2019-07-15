
let args = process.argv.slice(2),
    start = +new Date(),
    i1 = 0,
    i2 = 0,
    increment = parseInt(args[0], 10) || 100;
const interval = require('./../dist/index.js'),
    int = interval(() => {
        const now = +new Date(),
            precise = ++i1 * increment + start;
        let diff = (now - precise);
        console.log(`better ${i1} > ${precise} ${now} \x1b[1m%s\x1b[0m`, `${diff}`);
    }, increment).run(),

    intervalW = setInterval(() => {
        const now = +new Date(),
            precise = ++i2 * increment + start;
        let diff = (now - precise);
        console.log(`   bad ${i2} > ${precise} ${now} \x1b[31m%s\x1b[0m`, `${diff}`);
    }, increment);

setTimeout(() => {
    int.clear();
    clearInterval(intervalW);
}, 3600000 * 8);
