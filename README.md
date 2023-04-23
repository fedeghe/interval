[![Coverage Status](https://coveralls.io/repos/github/fedeghe/interval/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/interval?branch=master)  
# interval <sub><small>(v. 1.0.31)</small></sub>

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
}, 20)
    .onStart(({ at }) => console.log(`start 1 (${at})`))
    .onStart(({ at }) => console.log(`start 2, add more really needed (same at ${at})`))
    .onTune(() => console.log('tuning'))
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
The start
start 1
{ cycle: 0, elapsed: 63, effective: 63, progress: 6.3 }
{ cycle: 1, elapsed: 102, effective: 102, progress: 10.2 }
{ cycle: 2, elapsed: 150, effective: 150, progress: 15 }
{ cycle: 3, elapsed: 200, effective: 200, progress: 20 }
pausing { elapsed: 242, effective: 242 }
resuming { elapsed: 441, effective: 244 }
{ cycle: 5, elapsed: 450, effective: 253, progress: 25.3 }
{ cycle: 6, elapsed: 500, effective: 303, progress: 30.3 }
{ cycle: 7, elapsed: 551, effective: 354, progress: 35.4 }
{ cycle: 8, elapsed: 601, effective: 404, progress: 40.4 }
updating { elapsed: 612, effective: 415 }
{ cycle: 9, elapsed: 651, effective: 454, progress: 41.843 }
{ cycle: 10, elapsed: 700, effective: 503, progress: 46.359 }
{ cycle: 11, elapsed: 750, effective: 553, progress: 50.968 }
{ cycle: 12, elapsed: 801, effective: 604, progress: 55.668 }
pausing { elapsed: 842, effective: 645 }
resuming { elapsed: 1042, effective: 845 }
{ cycle: 13, elapsed: 1050, effective: 853, progress: 78.618 }
{ cycle: 14, elapsed: 1101, effective: 904, progress: 83.318 }
{ cycle: 15, elapsed: 1156, effective: 959, progress: 88.387 }
{ cycle: 16, elapsed: 1201, effective: 1004, progress: 92.535 }
{ cycle: 17, elapsed: 1252, effective: 1055, progress: 97.235 }
Ended in 1272 ms
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



