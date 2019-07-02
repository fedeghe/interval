/*
Interval v1.0.0
fedeghe <fedeghe@gmail.com>
A really simple function to provide a better timing to replace the setInterval
*/
const interval=function(t,e,n){var o=!0,c=0,r=e,i=+new Date;return function u(){r=e+(i+c++*e-new Date),setTimeout(function(){try{t()}catch(t){n&&n(t),o=!1}o&&u()},r)}(),function(){o=!1}};"object"==typeof exports&&(module.exports=interval);