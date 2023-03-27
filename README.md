[![Coverage Status](https://coveralls.io/repos/github/fedeghe/interval/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/interval?branch=master)
[![Build Status](https://travis-ci.org/fedeghe/interval.svg?branch=master)](https://travis-ci.org/fedeghe/interval)
# interval

A really simple tool meant to replace `setInterval`  
primarily providing a stable interval execution and   
- can be pause and resumed


``` js
var intr = interval(
        r => console.log(`run #${r}: ${+new Date()}`),
        1e2
    )
    .onEnd(() => console.log(`ENDS: ${+new Date()}`))
    .run(() => console.log(`STARTS: ${+new Date()}`));

// shut down after 1 second
setTimeout(function () {
    intr.end();
}, 1e3);

/*
// run() can accept a onStart function, thus can be also written as 

interval(r => console.log(`run #${r}: ${+new Date}`), 1e2)
    .run(i => setTimeout(()=> i.end(), 1e3));

// OR EVEN
interval(r => console.log(`run #${r}: ${+new Date}`), 1e2)
    .endsIn(1e3)
    .run();
*/

```

will produce

```
STARTS: 1679946525631
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
ENDS: 1679946526637   // end 6
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
- **run(ƒn)** to start it, optionally accepts a function that will be called once started passing the interval instance
- **end()** to stop it manually
- **endsIn(ms)** to plan a stop after ms milliseconds
- **onErr(fn)** to pass a function that will handle any thrown err
- **onEnd(fn)** to pass a function that will be called when `end` will be called  
- **onPause(fn)** to pass a function that will be called when `pause` will be called  
- **pause()** to pause it manually
- **onResume(fn)** to pass a function that will be called when `resume` will be called  
- **resume()** to resume it manually

### Who is misbehaving?  
I tried some env, and looks like the best is chrome browser, all other envs test have shown time warping (+) to some extent.  

Node js as well does not show great  results.
Just to summarize a bit, a metric of how bad the `setInterval` behave could be the first iteration that overlaps. 
Using an interval of 100ms for example the incident occurs only at the 30th iteration:  
![100runs](https://raw.githubusercontent.com/fedeghe/interval/master/compare/100.png)  
you can try it by yoursef in your env simply running:  
```
yarn compare 200 // for example, or passing any integer interval in ms
                 // ...you have to stop it manually (+c)
```





