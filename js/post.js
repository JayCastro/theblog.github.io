"use strict";function processPageElements(){$("canvas.chart").filter(function(a,l){return $(l).siblings()}).wrap("<div></div>"),colorCellsByLogValue()}function colorCellsByLogValue(){$('[data-transform="color-cells-by-log-value"]').each(function(a,l){var o=$(l).find("td"),t=null,n=null;o.each(function(a,l){l=$(l);var o=parseFloat(l.html());isNaN(o)||(o=Math.log(o),t=t?Math.min(t,o):o,n=n?Math.max(n,o):o)}),o.each(function(a,l){l=$(l);var o=parseFloat(l.html());if(!isNaN(o)){var e=((o=Math.log(o))-t)/(n-t);l.css("background-color","rgba(229,115,115,"+e+")")}})})}processPageElements();