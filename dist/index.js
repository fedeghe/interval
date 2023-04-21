'use strict';
/*
Interval v1.0.29
fedeghe <fedeghe@gmail.com>
A really simple function to provide a better timing to replace the setInterval
*/
var interval=function(){function t(){return+new Date}function i(t){return"function"==typeof t}function e(t,i){var e=!1;switch(t.status){case h.init:e=i===h.running;break;case h.running:e=[h.running,h.paused,h.ended].includes(i);break;case h.paused:e=[h.running,h.ended].includes(i)}return e=e||i===h.error,e&&(t.status=i),e}function s(t,i,e){i in t.subscribers&&t.subscribers[i].forEach(function(i){i(Object.assign({},e,{instance:t}))})}function n(i){var e=t()-i.StartTime,s=e-i.pauses,n=i.definite?i.definite-e+i.pauses:void 0,r=i.definite?parseFloat((100-100*n/i.definite).toFixed(3),10):void 0;return{cycle:i.cycle-i.addedCycles,elapsed:e,effective:s,remaining:n,progress:r}}function r(i){var e=t(),s=i.StartTime+(i.cycle+1)*i.tick,n=e+i.tick,r=s-n;return i.tick+r}function u(t,i){this.tick=i,this.StartTime=null,this.status=h.init,this.definite=!1,this.definiteDown=!1,this.definiteTo=null,this.sliding=!1,this.started=!1,this.pauses=0,this.pauseStart=null,this.cycle=0,this.subscribers={start:[],pause:[],resume:[],update:[],end:[],tick:[],err:[]},this.to=null,this.addedCycles=0,this.onTick(t)}var h={init:"init",running:"running",paused:"paused",ended:"ended",error:"error"};return u.prototype.getStatus=function(){return n(this)},u.prototype.update=function(t){var i,e=parseInt(t,10),r=n(this);return e&&this.definite&&(i=this.definite+e-r.effective,clearTimeout(this.definiteTo),i>0&&this.endsIn(i)),s(this,"update",r),this},u.prototype.run=function(i){if(this.status===h.error)return this;this.status===h.init&&(this.status=h.running),this.StartTime=this.StartTime||t();var u=this,o=r(this);return i&&this.onStart(i),!this.started&&s(this,"start",{instance:u}),this.started=!0,this.to=setTimeout(function(){if([h.ended,h.error].includes(u.status))return u;var t=n(u);try{u.status===h.running&&s(u,"tick",t),u.cycle++}catch(i){e(u,h.error),s(u,"err",Object.assign(t,{error:i}))}u.run()},o),this},u.prototype.pause=function(i){return e(this,h.paused)?(s(this,"pause",n(this)),this.sliding=!!i&&this.definite,this.definite&&clearTimeout(this.definiteTo),this.pauseStart=t(),this):this},u.prototype.resume=function(){if(!e(this,h.running))return this;var i,r=this,u=t(),o=u-this.pauseStart;return this.pauses+=this.sliding?o:0,i=u-this.StartTime-this.pauses,this.definiteDown=this.definite-i,this.sliding=!1,this.addedCycles+=~~(o/this.tick),s(this,"resume",n(this)),this.definite&&(this.definiteTo=setTimeout(function(){r.end()},this.definiteDown)),this},u.prototype.endsIn=function(t){var i=this;return this.definite=Math.abs(parseInt(t,10)),this.definiteTo&&clearTimeout(this.definiteTo),this.definiteTo=setTimeout(function(){i.end()},this.definite),this},u.prototype.end=function(){if(e(this,h.ended))return s(this,"end",n(this)),this},u.prototype.onStart=function(t){return i(t)&&this.subscribers.start.push(t),this},u.prototype.onPause=function(t){return i(t)&&this.subscribers.pause.push(t),this},u.prototype.onResume=function(t){return i(t)&&this.subscribers.resume.push(t),this},u.prototype.onUpdate=function(t){return i(t)&&this.subscribers.update.push(t),this},u.prototype.onTick=function(t){return i(t)&&this.subscribers.tick.push(t),this},u.prototype.onErr=function(t){return i(t)&&this.subscribers.err.push(t),this},u.prototype.onEnd=function(t){return i(t)&&this.subscribers.end.push(t),this},function(t,i){return new u(t,i)}}();"object"==typeof exports&&(module.exports=interval);