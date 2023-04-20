[![Coverage Status](https://coveralls.io/repos/github/fedeghe/interval/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/interval?branch=master)  
# interval <sub><small>(v. $PACKAGE.version$)</small></sub>

A really simple tool meant to replace `setInterval`  
primarily providing a stable interval execution, moreover can be paused and resumed

install
``` shell
> yarn add @fedeghe/interval 
```
import 
``` js
const interval = require('@fedeghe/interval')
```

use 
``` js
interval(
    ({ cycle }) => console.log(`cycle #${cycle} (${+new Date()})`),
    100
).run()
```
but something more is possible:
``` js
var intr = interval(
        ({ cycle }) => console.log(`cycle #${cycle} (${+new Date()})`),
        100
    )
    .onEnd(() => console.log(`ENDED at ${+new Date()}`))
    .run(() => console.log(`STARTED at ${+new Date()}`));

// force shut down after 1 second
setTimeout(function () {
    intr.end();
}, 1e3);
```
same thing can be rewritten as 
```js
interval(({ cycle }) => console.log(`run #${cycle}: ${+new Date}`), 1e2)
    .onEnd(() => console.log(`ENDED at ${+new Date()}`))
    .run(inst => {
        console.log(`STARTED at ${+new Date()}`)
        setTimeout(()=> inst.end(), 1e3);
    });
```
or
``` js
interval(({ cycle }) => console.log(`run #${cycle}: ${+new Date}`), 1e2)
    .onEnd(() => console.log(`ENDED at ${+new Date()}`))
    .endsIn(1e3)
    .run(console.log(`STARTED at ${+new Date()}`));
```

will produce

```
STARTED at 1679946525631
run #0: 1679946525738 // distance from target : 7
run #1: 1679946525831 // " 0
run #2: 1679946525932 // " 1
run #3: 1679946526031 // " 0
run #4: 1679946526132 // " 0
run #5: 1679946526232 // " 0
run #6: 1679946526332 // " 0
run #7: 1679946526431 // " 1
run #8: 1679946526532 // " 0
run #9: 1679946526633 // " 1
ENDED at 1679946526637   // end 6
```
as You can see the distance between each contiguous allows some more stability compared to the analogous `setInterval` version:

``` js
var clear = setInterval(function () {
    console.log(+new Date)
}, 100);

// even now shout down after one second
setTimeout(function () { clearInterval(clear); }, 1000);
```
which produce instead something similar to; ran on firefox which seem to have a really bad divergence:
```
1562049640169
1562049640269 // dist from wanted: 0
1562049640371 // " 2
1562049640475 // " 6
1562049640576 // " 7
1562049640678 // " 8
1562049640784 // " 15
1562049640884 // " 15
1562049640988 // " 19
```
### _API_
the `interval` function returns an instance of a simple object where the following methods are available:
- **run(ƒn)** to start it, optionally accepts a function that will be called once started passing _**some info**_
- **end()** to force a stop manually
- **endsIn(ms)** to plan a stop after ms milliseconds
- **pause(_slide_)**  
    - to pause it manually (by just pause interval execution; do not delays the end maybe booked with `endsIn`)  
    -  in case the pause needs to move the planned end accordingly (set with _endsIn()_) then pass `true` when invoking that function. 
- **resume()** to resume it manually  

few hooks, u can set one or more function for each of the following:
- **onErr(fn)** to pass a function that will handle any thrown err; _fn_ will be invoked receiving `{error, instance}`
- **onEnd(fn)** to pass a function that will be called when `end` will be called; _fn_ will be invoked receiving _**some info**_  
- **onPause(fn)** to pass a function that will be called when `pause` will be called; _fn_ will be invoked receiving _**some info**_ 
- **onResume(fn)** to pass a function that will be called when `resume` will be called; _fn_ will be invoked receiving _**some info**_  

_**some info**_ consists in a object containing: 
- **`cycle`**: an integer containing the currect cycle of notification 
- **`elapsed`**: the elapsed time (pauses included)   
- **`effective`**: the elapsed time (pauses excluded)
- **`remaining`**: the remaining time
- **`progress`**: the progress percentage (float, precision 3)

## Just cause `setInterval` is badly divergent!  
I tried some environments and looks like all shows time warping (+) to some extent.  

Just to summarize a bit, a metric of how bad the `setInterval` behave could be the first iteration that overlaps. 
Using an interval of 100ms for example the incident occurs already at the **30th** cycle:  
![100runs](https://raw.githubusercontent.com/fedeghe/interval/master/compare/100.png)  
you can try it by yoursef in your node environment simply running:  

```
yarn compare 200 // for example, or passing any integer interval in ms
                 // ...you have to stop it manually (+c)
```





