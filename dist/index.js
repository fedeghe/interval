'use strict';
/*
Interval v1.0.19
fedeghe <fedeghe@gmail.com>
A really simple function to provide a better timing to replace the setInterval
*/
const interval=function(t,n,i){function e(t,n){this.fn=t,this.interval=n,this.int=0,this.counter=0,this.initDate=+new Date,this.active=!1,this.paused=!1,this._onErr=null,this._onEnd=null,this._onPause=null,this._onResume=null,this._pause=null,this._resume=null}var s=function(t){return"function"==typeof t};return e.prototype.onEnd=function(t){return s(t)&&(this._onEnd=t),this},e.prototype.onErr=function(t){return s(t)&&(this._onErr=t),this},e.prototype.onPause=function(t){return s(t)&&(this._onPause=t),this},e.prototype.onResume=function(t){return s(t)&&(this._onResume=t),this},e.prototype.end=function(){return this.active=!1,this._onEnd&&this._onEnd(this),this},e.prototype.endsIn=function(t){var n=this;return setTimeout(function(){n.end()},t),this},e.prototype.pause=function(){return this.paused=!0,this._onPause&&this._onPause(this),this},e.prototype.resume=function(){return this.paused=!1,this._onResume&&this._onResume(this),this},e.prototype.runIfActive=function(){return this.active&&this.run(),this},e.prototype.run=function(t){this.active=!0;var n=this;return this.int=this.interval+(this.initDate+this.counter++*this.interval-new Date),t&&t(n),setTimeout(function(){if(!n.paused&&n.active)try{n.fn(n.counter-1)}catch(t){n._onErr&&n._onErr(t,n),n.active=!1}n.runIfActive()},n.int),this},function(t,n){return new e(t,n)}}();"object"==typeof exports&&(module.exports=interval);