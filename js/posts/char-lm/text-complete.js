"use strict";function selectDataset(e){selectedDataset=null==e?DATASET_DROPDOWN.find(".dropdown-toggle").val():e,TALK_BOX_HEADING.find("button.active").removeClass("active"),TALK_BOX_HEADING.find('button[value="'+selectedDataset+'"]').addClass("active");var t=DATASET_DROPDOWN.find('a[data-value="'+selectedDataset+'"]');selectDropdownItem(t,!1),TEXT_INPUT.html(DATASET_DEFAULTS[selectedDataset].prime),TEXT_OUTPUT.html(""),focusOnInput()}function onInput(){var e=getCleanInput();SEND_ON_ENTER&&e.indexOf("\n")>=0?(TEXT_INPUT.html(e.replace("\n","")),completeText()):TEXT_OUTPUT.html().length&&(TEXT_BRIDGE.hide(),TEXT_OUTPUT.slideToggle({start:function(){return TEXT_OUTPUT.html("")},always:function(){return TEXT_OUTPUT.show()}}))}function getCleanInput(){var e=TEXT_INPUT.html();return e=e.replace(/<div>(?!<br)/g,"<div><br/>"),e=e.replace(/<br ?\/?>/g,"\n"),e=e.replace(/<\/?\w*?\/?>/g,""),e=he.decode(e)}function completeText(){$("#send-button").focus();var e=$.trim(getCleanInput());if(e.length){var t=PostUtil.generateUUID();pendingRequestId=t,animateWaiting(t),console.log("Sending request",e);var n=DATASET_DEFAULTS[selectedDataset];$.get("https://app-1506526767.000webhostapp.com",{url:"http://ec2-35-167-199-162.us-west-2.compute.amazonaws.com:5000/sample",prime:e,steps:n.steps,maxSentences:n.maxSentences,datasetName:selectedDataset}).then(function(e){pendingRequestId==t&&(result=e,pendingRequestId=null)})}}function getNumToAdd(e){return e<300?1:0}function getRandomChange(e){for(var t=getNumToAdd(e.length),n=0;n<t;){var a=t-n;(a>1||Math.random()<a)&&(e+=Math.random()<.167?" ":PostUtil.getRandomCharacter()),n+=1}return e.split("").map(function(e){return" "==e?e:Math.random()<=.2?PostUtil.getRandomCharacter():e}).join("")}function animateResult(e,t){var n=t.getTime()-(new Date).getTime();if(n<=0)return TEXT_OUTPUT.html(e),void focusOnInput();var a=TEXT_OUTPUT.html(),T=Math.ceil(n/ANIMATE_INTERVAL_MILLIS),s=e.length-a.length;if(s>0){var i=Math.ceil(s/T);a+=PostUtil.getRandomSentence(i)}else if(s<0){var l=Math.ceil(-s/T);a=a.substr(0,a.length-l)}var u=[];Array.from(a).forEach(function(t,n){n<e.length&&t!=e[n]&&u.push(n)});var r=Math.ceil(u.length/T);_.sample(u,r).forEach(function(t){a=a.substr(0,t)+e[t]+a.substr(t+1)}),TEXT_OUTPUT.html(a),setTimeout(function(){return animateResult(e,t)},ANIMATE_INTERVAL_MILLIS)}function animateWaiting(e){TEXT_OUTPUT.show(),TEXT_BRIDGE.show(),TEXT_OUTPUT.html("a"),setTimeout(function(){return refreshAnimateWaiting(e)},ANIMATE_INTERVAL_MILLIS)}function refreshAnimateWaiting(e){if(pendingRequestId==e)TEXT_OUTPUT.html(getRandomChange(TEXT_OUTPUT.html())),setTimeout(function(){return refreshAnimateWaiting(e)},ANIMATE_INTERVAL_MILLIS);else if(null==pendingRequestId){var t=new Date((new Date).getTime()+1e3);animateResult(result,t)}}function focusOnInput(){TEXT_INPUT.is(":focus")||PostUtil.placeCaretAtEnd(TEXT_INPUT.get(0))}var ANIMATE_INTERVAL_MILLIS=50,DATASET_DEFAULTS={wiki:{steps:500,maxSentences:3,prime:"The"},congress:{steps:500,maxSentences:50,prime:"The"},southPark:{steps:500,maxSentences:3,prime:"Kenny"},sherlock:{steps:500,maxSentences:3,prime:"Suddenly"},goethe:{steps:500,maxSentences:50,prime:"Der"}},SEND_ON_ENTER=!1,TEXT_INPUT=$(".text-input"),TEXT_OUTPUT=$(".text-output"),TEXT_BRIDGE=$(".text-input-output-bridge"),TALK_BOX_HEADING=$(".talk-box-heading"),DATASET_DROPDOWN=$("#talk-box-dataset-dropdown"),selectedDataset=null,pendingRequestId=null,result=null;$(function(){TEXT_INPUT=$(".text-input"),TEXT_OUTPUT=$(".text-output"),TEXT_BRIDGE=$(".text-input-output-bridge"),TALK_BOX_HEADING=$(".talk-box-heading"),DATASET_DROPDOWN=$("#talk-box-dataset-dropdown"),selectedDataset=null,pendingRequestId=null,result=null,selectDataset("wiki")});