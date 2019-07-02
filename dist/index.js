/*
Interval
fedeghe <fedeghe@gmail.com>
*/
const interval=function(t,e,n){var o=!0,c=0,r=e,i=+new Date;return function u(){r=e+(i+c++*e-new Date),setTimeout(function(){try{t()}catch(t){n&&n(t),o=!1}o&&u()},r)}(),function(){o=!1}};"object"==typeof exports&&(module.exports=interval);