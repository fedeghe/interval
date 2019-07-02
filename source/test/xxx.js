var interval = require('../../dist/index.js');


var clear = setInterval(function () {
    console.log(+new Date)
}, 100);
// even now shout down after one second
setTimeout(function () { clearInterval(clear); }, 1000);