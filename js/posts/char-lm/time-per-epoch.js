"use strict";function _toConsumableArray(t){if(Array.isArray(t)){for(var r=0,e=Array(t.length);r<t.length;r++)e[r]=t[r];return e}return Array.from(t)}function printEpochTimes(t,r){r.map(function(r){return $.getJSON("assets/posts/char-lm/data/"+t+"/"+r+"/model.trainstate.json").then(function(t){var e=PostUtil.getPreprocessedLog(t.log),n=Math.max.apply(Math,_toConsumableArray(e.epochs.values()));1==n&&(n=2);var a=Array.from(e.epochs.keys()).filter(function(t){return e.epochs.get(t)<n}),s=Math.max.apply(Math,_toConsumableArray(a)),o=Array.from(e.secondsSinceStart.keys()).filter(function(t){return t<=s}),i=e.secondsSinceStart.get(Math.max.apply(Math,_toConsumableArray(o)));console.log(r,i/(60*(n-1))+" minutes")})})}printEpochTimes("batch_size",[1,10,20,50,100,200,500,2e3]),printEpochTimes("num_timesteps",[40,80,120,160]),printEpochTimes("south_park",["2017-01-18T10-32-14","num_timesteps/200/2017-01-18T13-56-50"]),printEpochTimes("num_neurons",["512","1024"]);