'use strict';
/*
Interval v1.0.14
fedeghe <fedeghe@gmail.com>
A really simple function to provide a better timing to replace the setInterval
*/
const interval=function(t,n,i){function e(t,n){this.fn=t,this.interval=n,this.int=0,this.counter=0,this.initDate=+new Date,this.active=!1,this.paused=!1,this._onErr=null,this._onEnd=null,this._pause=null,this._resume=null}var r=function(t){return"function"==typeof t};return e.prototype.clear=function(){return this.active=!1,this._onEnd&&this._onEnd(),this},e.prototype.onEnd=function(t){return r(t)&&(this._onEnd=t),this},e.prototype.onErr=function(t){return r(t)&&(this._onErr=t),this},e.prototype.pause=function(){return this.paused=!0,this},e.prototype.resume=function(){return this.paused=!1,this},e.prototype.runIfActive=function(){return this.active&&this.run(),this},e.prototype.run=function(){this.active=!0;var t=this;return this.int=this.interval+(this.initDate+this.counter++*this.interval-new Date),setTimeout(function(){if(!t.paused)try{t.fn()}catch(n){t._onErr&&t._onErr(n),t.active=!1}t.runIfActive()},t.int),this},function(t,n){return new e(t,n)}}();"object"==typeof exports&&(module.exports=interval);