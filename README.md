# interval

A really simple function to provide a better timing to replace the `setInterval`

```
var clear = interval(function () {
    console.log(+new Date)
}, 100);

// shut down after 1 second
setTimeout(clear, 1000);
```

will produce

```
1562021827472
1562021827570 // dist from wanted: 2
1562021827671 // " 1
1562021827772 // " 0
1562021827871 // " 1 
1562021827974 // " 2
1562021828074 // " 2
1562021828171 // " 1
1562021828276 // " 4
1562021828374 // " 2
1562021828474 // " 2
```
as You can see the distance between each contiguous allows some more stability compared to the analogous `setInterval` version:

```
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
Who is misbehaving?
I tried some env, and looks like the best is chrome browser, all other env i could test have shown the expanding time to some extent.