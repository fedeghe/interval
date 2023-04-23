[![Coverage Status](https://coveralls.io/repos/github/fedeghe/interval/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/interval?branch=master)  
# interval <sub><small>(v. 1.0.33)</small></sub>

A really simple tool meant to replace `setInterval`  
primarily providing a stable interval execution, moreover can be paused and resumed

install
``` shell
> yarn add @fedeghe/interval 
```
import & use as `setInterval` (this will not diverge)
``` js
const interval = require('@fedeghe/interval')

interval(
    ({ cycle, at }) => console.log(`cycle #${cycle} (${at})`),
    100
).run()
```
but we can for example plan the end and hook a function there:
``` js
interval(
    ({ cycle, at }) => console.log(`cycle #${cycle}: (${at})`),
    100
)
.endsIn(1e3).onEnd(() => console.log(`ENDED at ${+new Date()}`))
.run(() => console.log(`STARTED at ${+new Date()}`));

```

getting

```
STARTED at 1679946525631
cycle #0: 1679946525738 // distance from target : 7
cycle #1: 1679946525831 // " 0
cycle #2: 1679946525932 // " 1
cycle #3: 1679946526031 // " 0
cycle #4: 1679946526132 // " 0
cycle #5: 1679946526232 // " 0
cycle #6: 1679946526332 // " 0
cycle #7: 1679946526431 // " 1
cycle #8: 1679946526532 // " 0
cycle #9: 1679946526633 // " 1
ENDED at 1679946526637   // end 6
```
as You can see the distance between each contiguous is quite good.

**IMPORTANT**: when using `endsIn` to set the interval horizont be sure to invoke `run` **after** and  not **before** `endsIn`

more examples:


<details>
<summary>here is an less trial example whcih tries to use almost all available methods</summary>

``` js  
var interval = require('../source/index'),
    start, end;
interval(function ({ cycle, elapsed, effective, progress, remaining }) {
    console.log(JSON.stringify({ cycle, remaining, elapsed, effective, progress }));
}, 50)
    .onStart(({ at }) => console.log(`start 1 (${at})`))
    .onStart(({ at }) => console.log(`start 2, add more really needed (same at ${at})`))
    .onTune(({ at }) => console.log(`tuning at ${at}`))
    .onPause(({ elapsed, effective }) => console.log('pausing', { elapsed, effective }))
    .onResume(({ elapsed, effective }) => console.log('resuming', { elapsed, effective }))
    .onEnd(function ({ progress }) {
        end = +new Date();
        console.log(`Ended in ${end - start} ms (${progress}%)`);
    })
    .at(230, ({ i }) => i.pause(true))
    .at(430, ({ i }) => i.resume())
    .at(600, ({ i }) => i.tune(600))
    .at(900, ({ i }) => i.tune(500))
    .at(1050, ({ i }) => i.tune(-300))
    .endsIn(1000)
    .run(({ at }) => {
        start = at;
        console.log('The very first start, wins over others onStart');
    });

```

and the output is similar to

``` 
The very first start, wins over others onStart
start 1 (1682288747176)
start 2, add more really needed (same at 1682288747176)
{"cycle":0,"remaining":939,"elapsed":61,"effective":61,"progress":6.1}
{"cycle":1,"remaining":899,"elapsed":101,"effective":101,"progress":10.1}
{"cycle":2,"remaining":849,"elapsed":151,"effective":151,"progress":15.1}
{"cycle":3,"remaining":799,"elapsed":201,"effective":201,"progress":20.1}
pausing { elapsed: 230, effective: 230 }
resuming { elapsed: 431, effective: 431 }
{"cycle":5,"remaining":749,"elapsed":450,"effective":251,"progress":25.1}
{"cycle":6,"remaining":699,"elapsed":500,"effective":301,"progress":30.1}
{"cycle":7,"remaining":648,"elapsed":551,"effective":352,"progress":35.2}
tuning at 1682288747777
{"cycle":8,"remaining":1198,"elapsed":601,"effective":402,"progress":25.125}
{"cycle":9,"remaining":1148,"elapsed":651,"effective":452,"progress":28.25}
{"cycle":10,"remaining":1099,"elapsed":700,"effective":501,"progress":31.313}
{"cycle":11,"remaining":1048,"elapsed":751,"effective":552,"progress":34.5}
{"cycle":12,"remaining":998,"elapsed":801,"effective":602,"progress":37.625}
{"cycle":13,"remaining":949,"elapsed":850,"effective":651,"progress":40.688}
tuning at 1682288748077
{"cycle":14,"remaining":1398,"elapsed":901,"effective":702,"progress":33.429}
{"cycle":15,"remaining":1348,"elapsed":951,"effective":752,"progress":35.81}
{"cycle":16,"remaining":1299,"elapsed":1000,"effective":801,"progress":38.143}
tuning at 1682288748227
{"cycle":17,"remaining":948,"elapsed":1051,"effective":852,"progress":47.333}
{"cycle":18,"remaining":898,"elapsed":1101,"effective":902,"progress":50.111}
{"cycle":19,"remaining":848,"elapsed":1151,"effective":952,"progress":52.889}
{"cycle":20,"remaining":798,"elapsed":1201,"effective":1002,"progress":55.667}
{"cycle":21,"remaining":749,"elapsed":1250,"effective":1051,"progress":58.389}
{"cycle":22,"remaining":698,"elapsed":1301,"effective":1102,"progress":61.222}
{"cycle":23,"remaining":649,"elapsed":1350,"effective":1151,"progress":63.944}
{"cycle":24,"remaining":598,"elapsed":1401,"effective":1202,"progress":66.778}
{"cycle":25,"remaining":548,"elapsed":1451,"effective":1252,"progress":69.556}
{"cycle":26,"remaining":498,"elapsed":1501,"effective":1302,"progress":72.333}
{"cycle":27,"remaining":448,"elapsed":1551,"effective":1352,"progress":75.111}
{"cycle":28,"remaining":398,"elapsed":1601,"effective":1402,"progress":77.889}
{"cycle":29,"remaining":346,"elapsed":1653,"effective":1454,"progress":80.778}
{"cycle":30,"remaining":295,"elapsed":1704,"effective":1505,"progress":83.611}
{"cycle":31,"remaining":249,"elapsed":1750,"effective":1551,"progress":86.167}
{"cycle":32,"remaining":198,"elapsed":1801,"effective":1602,"progress":89}
{"cycle":33,"remaining":148,"elapsed":1851,"effective":1652,"progress":91.778}
{"cycle":34,"remaining":99,"elapsed":1900,"effective":1701,"progress":94.5}
{"cycle":35,"remaining":48,"elapsed":1951,"effective":1752,"progress":97.333}
Ended in 2000 ms (100%)
```


</details>

---

### _API_
- **`interval(ticking ƒn, tick)`**:  
 needs a _ticking_ function that will be executed every _tick_ ms; returns an _interval_ instance where the following methods are available:
- **`run(ƒn)`** to start it, optionally accepts a function that will be called once started passing _**some info**_
- **`endsIn(ms)`** to plan a stop after ms milliseconds
- **`end()` meant to be called in `.at`** to force a stop manually  
- **`pause(_slide_)` meant to be called in `.at`**  
    - to pause it manually (by just pause interval execution; do not delays the end maybe booked with `endsIn`)  
    -  in case the pause needs to move the planned end accordingly (set with _endsIn()_) then pass `true` when invoking that function. 
- **`resume()` meant to be called in `.at`** to resume it manually from a pause  
- **`tune(ms)` meant to be called in `.at`, require `endsIn`**  
    live add or remove `ms` milliseconds to the event horizont depending on the sign; clearly enough if one removed more than the remainder the interval will stop immediately.     
- **`at(ms, ƒn)`** after `ms` milliseconds execute `ƒn` passing _**some info**_     
- **`getStatus()`** get _**some info**_    

then few hooks are available to observe relevant events:
- **`onErr(ƒn)`** to pass a function that will handle any thrown err; _ƒn_ will be invoked receiving `{error, i}` (where `i` is the interval instance)
- **`onEnd(ƒn)`** to pass a function that will be called when `end` will be called; _ƒn_ will be invoked receiving _**some info**_  
- **`onStart(ƒn, _first_)`** to pass a function that will be called when `run` will be called; _ƒn_ will be invoked receiving _**some info**_; optionally one can pass `true` as second parameter so this will become the first function invoked at _start_.
- **`onPause(ƒn)`** to pass a function that will be called when `pause` will be called; _ƒn_ will be invoked receiving _**some info**_ 
- **`onResume(ƒn)`** to pass a function that will be called when `resume` will be called; _ƒn_ will be invoked receiving _**some info**_  
- **`onTune(ƒn)`** to pass a function that will be called when `tune` will be called; _ƒn_ will be invoked receiving _**some info**_ with additionally `ms` 

_**some info**_ consists in a object containing: 
- **`at`**: the epoch of the event 
- **`cycle`**: an integer containing the currect cycle of notification 
- **`elapsed`**: the elapsed time (pauses included)   
- **`effective`**: the elapsed time (pauses excluded)
- **`remaining`**: the remaining time
- **`progress`**: the progress percentage (float, precision 3)
- **`status`**: the status of the instance among `['init', 'running', 'paused', 'ended', 'error']`

## Sliding pauses  
This thing applies **only in case** the end of the interval is defined, thus only when `endsIn` is invoked.

![100runs](https://raw.githubusercontent.com/fedeghe/interval/master/schema-slide.jpeg)  

here the end is set `endsIn`, then we trigger two different pauses:  
- **a sliding pause**:  
     pauses the ticking notifications until not resumed, assuming it will last for an amount of time equal to `TP1` the planned end will be slided forward accounting it.
- **a default pause**; it just pauses the ticking notifications without updating the planned end.

## Why? ... just cause `setInterval` is badly divergent!  
I tried some environments and looks like all shows time warping (+) to some extent.  

Just to summarize a bit, a metric of how bad the `setInterval` behave could be the first iteration that overlaps. 
Using an interval of 100ms for example the incident occurs already at the **30th** cycle:  
![100runs](https://raw.githubusercontent.com/fedeghe/interval/master/compare/100.png)  
you can try it by yoursef in your node environment simply running:  

```
> yarn compare 200
// for example, or passing any integer interval in ms
// you have to stop it manually (+c) or wait one hour 🤣
```

<details>
<summary>here you can see the `compare` script</summary>

``` js  
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

// stop anyway after one hour in case no ctrl+c
setTimeout(() => {
    int.clear();
    clearInterval(intervalW);
}, 3600000 * 1);

```
</details>



