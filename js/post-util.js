class PostUtil{static generateUUID(){let t=(new Date).getTime();return window.performance&&"function"==typeof window.performance.now&&(t+=performance.now()),"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){const a=(t+16*Math.random())%16|0;return t=Math.floor(t/16),("x"===e?a:3&a|8).toString(16)}))}static getRandomCharacter(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";return t.charAt(Math.floor(Math.random()*t.length))}static getRandomSentence(t){let e="";for(let a=0;a<t;a++)e+=PostUtil.getRandomCharacter(),Math.random()<.1667&&(e+=" ");return e}static objectValues(t){return Object.keys(t).map(e=>t[e])}static replaceClosestKeys(t,e){let a=new Map,n=Array.from(e.keys());return t.forEach((t,o)=>{let r=Math.min(...n.filter(t=>t>=o));a.set(e.get(r),t)}),a}static getPreprocessedLog(t){let e={};Object.keys(t).forEach(a=>{e[a]=PostUtil.parseSeriesToIntMap(t[a])}),["lossesTrain","lossesValid"].forEach(t=>{let a=e[t];for(let t of a.keys())a.set(t,Math.pow(2,a.get(t)))});const a={};e.epochs.forEach((t,e)=>{a[t]?e<a[t].min?a[t].min=e:e>a[t].max&&(a[t].max=e):a[t]={min:e,max:e}}),e.epochs.forEach((t,n)=>{let o=a[t].min,r=a[t].max,s=r!==o?(n-o)/(r-o):0;e.epochs.set(n,t+s)}),e.secondsSinceStart=new Map,e.minutesSinceStart=new Map;let n=0;return Array.from(e.intervalSeconds.keys()).sort((t,e)=>t-e).forEach(t=>{n+=e.intervalSeconds.get(t),e.secondsSinceStart.set(t,n),e.minutesSinceStart.set(t,n/60)}),e}static getYRange(t){let e={min:null,max:null};return t.forEach(t=>{t.data.forEach(t=>{e.min=null!=e.min?Math.min(e.min,t.y):t.y,e.max=null!=e.max?Math.max(e.max,t.y):t.y})}),e}static parseSeriesToIntMap(t){let e=new Map;return Object.keys(t).forEach(a=>{e.set(parseInt(a),t[a])}),e}static placeCaretAtEnd(t){if(t.focus(),void 0!==window.getSelection&&void 0!==document.createRange){let e=document.createRange();e.selectNodeContents(t),e.collapse(!1);let a=window.getSelection();a.removeAllRanges(),a.addRange(e)}else if(void 0!==document.body.createTextRange){let e=document.body.createTextRange();e.moveToElementText(t),e.collapse(!1),e.select()}}static clearChart(t){const e=$(`#${t}`),a=e.data("width"),n=e.data("height"),o=e.attr("class"),r=$("<canvas>").data("width",a).data("height",n).attr("width",a).attr("height",n).attr("class",o).attr("id",t);e.parent().empty().append(r)}}PostUtil.CHART_COLORS_DIVERSE=["#fe819d","#2196F3","#ffce56","#9575CD","#e0846b","#5f8ca1","#626a61","#A9A9A9","#C5CAE9"],PostUtil.CHART_COLORS_BLUE=["#BBDEFB","#64B5F6","#2196F3","#1565C0","#133270","#172237"],PostUtil.CHART_COLORS_INDIGO=["#C5CAE9","#7986CB","#3F51B5","#283593","#1e2868","#121424"],PostUtil.CHART_COLORS_DEEP_PURPLE=["#D1C4E9","#9575CD","#673AB7","#4527A0","#2e185d","#121424"],PostUtil.CHART_COLORS_RED=["#FFCDD2","#E57373","#F44336","#C62828","#721414","#340707"],PostUtil.CHART_COLORS_GREEN=["#C8E6C9","#81C784","#4CAF50","#2E7D32","#123317","#0a1a0d"];