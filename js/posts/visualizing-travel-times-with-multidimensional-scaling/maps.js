var cityMap,coordinateMap,geocoder,cities,cityNames=[],cityMarkers=[],coordinateMarkers=[];function displayError(e){e=e||"Something went wrong with the Google Maps API. Please try reloading the page",$("#post-error").show().html(e),console.error(e)}function getCityCoordinates(e,t){var n=[];e.forEach((function(r){geocoder.geocode({address:r},(function(a,o){o==google.maps.GeocoderStatus.OK?(n.push({name:r,location:a[0].geometry.location}),n.length==e.length&&t&&t(n)):displayError()}))}))}function drawCities(){clearMarkers(cityMarkers);for(var e=new google.maps.LatLngBounds,t=0;t<cities.length;t++)setMarker(cityMap,cities[t].name,cities[t].location),e.extend(cities[t].location);cityMap.fitBounds(e);var n={min:Number.MAX_VALUE,max:0},r=[];for(t=0;t<cities.length;t++){r[t]=[];for(var a=0;a<cities.length;a++)r[t][a]=getDistanceFromLatLonInKm(cities[t].location.lat(),cities[t].location.lng(),cities[a].location.lat(),cities[a].location.lng()),t!=a&&(r[t][a]<n.min&&(n.min=r[t][a]),r[t][a]>n.max&&(n.max=r[t][a]))}fillTable("distance-table",r," km",n)}function drawGraph(e){getDurations(e,(function(e){var t=getMdsCoordinatesWithGradientDescent(e);t=fitCoordinates(t);var n=cities.map((function(e){return[e.location.lat(),e.location.lng()]}));console.log(getLoss(e,n)),clearMarkers(coordinateMarkers);for(var r=new google.maps.LatLngBounds,a=0;a<cities.length;a++){var o=new google.maps.LatLng(t[a][0],t[a][1]);setMarker(coordinateMap,cities[a].name,o),r.extend(o)}coordinateMap.fitBounds(r)}))}function setMarker(e,t,n){var r=new MarkerWithLabel({position:n,draggable:!1,raiseOnDrag:!1,map:e,labelContent:t,labelAnchor:new google.maps.Point(22,0),labelClass:"labels"});e==cityMap?cityMarkers.push(r):coordinateMarkers.push(r)}function fitCoordinates(e){var t=cities.map((function(e){return[e.location.lat(),e.location.lng()]})),n=mean(t);center(e),center(t);var r=numeric.dot(numeric.transpose(e),e);r=numeric.inv(r),r=numeric.dot(r,numeric.transpose(e)),r=numeric.dot(r,t),e=numeric.dot(e,r);for(var a=0;a<e.length;a++)e[a]=numeric.add(e[a],n);return e}function getMeanEuclideanError(e,t){for(var n=numeric.sub(e,t),r=0,a=0;a<n.length;a++)r+=numeric.norm2Squared(n[a]);return r/n.length}function center(e){for(var t=mean(e),n=0;n<e.length;n++)e[n]=numeric.sub(e[n],t)}function mean(e){return numeric.div(numeric.add.apply(null,e),e.length)}function getMdsCoordinatesSvd(e){for(var t=numeric.mul(-.5,numeric.pow(e,2)),n=mean(t),r=mean(numeric.transpose(t)),a=mean(n),o=0;o<t.length;++o)for(var i=0;i<t[0].length;++i)t[o][i]+=a-n[o]-r[i];var s=numeric.svd(t),c=numeric.sqrt(s.S);return s.U.map((function(e){return numeric.mul(e,c).splice(0,2)}))}function getMdsCoordinatesWithGradientDescent(e,t=2){var n=getMax(e),r=getMin(e);e=numeric.div(numeric.sub(e,r),n-r);for(var a=[],o=0;o<e.length;o++){for(var i=[],s=0;s<t;s++)i.push(Math.random()/Math.sqrt(t));a.push(i)}for(var c=0;c<1e3;c++){var l=getLoss(e,a);console.log(c+" "+l);for(o=0;o<e.length;o++){var d=getGradientForCity(e,a,o),m=numeric.mul(-.01,d);a[o]=numeric.add(a[o],m)}}return a}function getMax(e){return Math.max(...e.map(e=>Array.isArray(e)?getMax(e):e))}function getMin(e){return Math.min(...e.map(e=>Array.isArray(e)?getMin(e):e))}function getLoss(e,t){for(var n=0,r=0;r<t.length;r++)for(var a=0;a<t.length;a++)if(r!==a){var o=t[r],i=t[a],s=e[r][a],c=numeric.norm2(numeric.sub(o,i));n+=Math.pow(s-c,2)}return n}function getGradientForCity(e,t,n){for(var r=t[n],a=[0,0],o=0;o<t.length;o++)if(n!==o)for(var i=t[o],s=numeric.sum(numeric.pow(numeric.sub(r,i),2)),c=Math.sqrt(s),l=[e[n][o],e[o][n]],d=0;d<l.length;d++){var m=-2*(l[d]-c),u=.5/Math.sqrt(s),g=numeric.mul(2,numeric.sub(r,i)),p=numeric.mul(m*u,g);a=numeric.add(a,p)}return a}function getDurations(e,t){for(var n=new google.maps.DistanceMatrixService,r=[],a=[],o=0;o<cities.length;o++)a.push(cities[o].name),r[o]=new Array(cities.length);var i={min:Number.MAX_VALUE,max:0};n.getDistanceMatrix({origins:a,destinations:a,travelMode:google.maps.TravelMode.TRANSIT,drivingOptions:{departureTime:getNextMonday()}},(function(e,n){if(n==google.maps.DistanceMatrixStatus.OK){for(var a=0;a<e.rows.length;a++)for(var o=e.rows[a],s=0;s<o.elements.length;s++)if(a!=s){var c=o.elements[s];c.status==google.maps.DistanceMatrixStatus.OK?(r[a][s]=c.duration.value,c.duration.value<i.min&&(i.min=c.duration.value),c.duration.value>i.max&&(i.max=c.duration.value)):(displayError("GoogleMaps could not find a public transport connection between "+cities[a].name+" and "+cities[s].name+"."),cities.pop(),drawCities(),drawGraph())}else r[a][s]=0;fillTable("duration-table",r,"seconds",i),t(r)}}))}function getDistanceFromLatLonInKm(e,t,n,r){var a=deg2rad(n-e),o=deg2rad(r-t),i=Math.sin(a/2)*Math.sin(a/2)+Math.cos(deg2rad(e))*Math.cos(deg2rad(n))*Math.sin(o/2)*Math.sin(o/2);return 6371*(2*Math.atan2(Math.sqrt(i),Math.sqrt(1-i)))}function deg2rad(e){return e*(Math.PI/180)}function deepCloneTwoDimensionalArray(e){return e.map((function(e){return e.slice()}))}function clearTable(e){for(var t=document.getElementById(e);t.firstChild;)t.removeChild(t.firstChild)}function fillTable(e,t,n,r){clearTable(e);var a=document.getElementById(e),o=document.createElement("TR");o.appendChild(document.createElement("TH"));for(var i=0;i<cities.length;i++){var s=document.createElement("TH");s.appendChild(document.createTextNode(cities[i].name)),o.appendChild(s)}a.appendChild(o);for(i=0;i<t.length;i++){var c=document.createElement("TR");(d=document.createElement("TH")).appendChild(document.createTextNode(cities[i].name)),c.appendChild(d);for(var l=0;l<t[i].length;l++){var d=document.createElement("TD"),m="-";i!=l&&(m="seconds"==n?secondsToText(t[i][l]):Math.round(t[i][l])+" "+n),d.style.backgroundColor=getWeightedColor(t[i][l],r),d.appendChild(document.createTextNode(m)),c.appendChild(d)}a.appendChild(c)}}function getWeightedColor(e,t){return"rgba(255,200,200,"+Math.max(0,(e-t.min)/(t.max-t.min))+")"}function secondsToText(e){if(e<60)return"-";e=Number(e);var t=Math.floor(e/3600);return(t>0?t+" h ":"")+Math.floor(e%3600/60)+" min"}function getNextMonday(){var e=new Date;return e.setDate(e.getDate()+(8-e.getDay())%7),e.setHours(12),e.setMinutes(0),e.setSeconds(0),e.setMilliseconds(0),e}function initMap(){var e=new google.maps.StyledMapType([{stylers:[{visibility:"simplified"}]},{featureType:"road",stylers:[{visibility:"off"}]},{featureType:"administrative",stylers:[{visibility:"off"}]},{featureType:"poi",stylers:[{visibility:"off"}]},{featureType:"administrative.country",elementType:"geometry.stroke",stylers:[{visibility:"on"}]}],{name:"Custom Style"}),t={center:{lat:36.1141105,lng:-116.4614945},zoom:3,navigationControl:!1,mapTypeControl:!1,scrollwheel:!1,streetViewControl:!1,disableDefaultUI:!0};(cityMap=new google.maps.Map(document.getElementById("city-map"),t)).mapTypes.set("custom_style",e),cityMap.setMapTypeId("custom_style"),addSearchBox(),addRemoveCitiesControl(),(coordinateMap=new google.maps.Map(document.getElementById("coordinate-map"),t)).mapTypes.set("custom_style",e),coordinateMap.setMapTypeId("custom_style"),geocoder=new google.maps.Geocoder,getCityCoordinates(cityNames,(function(e){cities=e,drawCities(),drawGraph()}))}function clearMarkers(e){for(var t=0;t<e.length;t++)e[t].setMap(null);e=[]}function removeCities(){clearMarkers(cityMarkers),clearMarkers(coordinateMarkers),cities=[],clearTable("distance-table"),clearTable("duration-table")}function addSearchBox(){var e=document.getElementById("pac-input"),t=new google.maps.places.SearchBox(e);cityMap.controls[google.maps.ControlPosition.TOP_LEFT].push(e),t.addListener("places_changed",(function(){var e=t.getPlaces()[0];e&&($("#post-error").hide(),cities.push({name:getCityForPlace(e),location:e.geometry.location}),drawCities(),cities.length>=3&&drawGraph())}))}function getCityForPlace(e){for(var t=0;t<e.address_components.length;t++){if("locality"==e.address_components[t].types[0])return e.address_components[t].long_name}return e.address_components[0].long_name}function addRemoveCitiesControl(){var e=document.createElement("div");new RemoveCitiesControl(e,cityMap);e.index=1,cityMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(e)}function RemoveCitiesControl(e,t){var n=document.createElement("div");n.style.backgroundColor="#fff",n.style.border="2px solid #fff",n.style.borderRadius="3px",n.style.boxShadow="0 2px 6px rgba(0,0,0,.3)",n.style.cursor="pointer",n.style.marginBottom="22px",n.style.textAlign="center",n.style.marginRight="12px",n.style.marginTop="12px",n.title="Click to remove all markers from the map",e.appendChild(n);var r=document.createElement("div");r.style.color="rgb(25,25,25)",r.style.fontFamily="Roboto,Arial,sans-serif",r.style.fontSize="13px",r.style.lineHeight="24px",r.style.paddingLeft="5px",r.style.paddingRight="5px",r.innerHTML="Remove Cities",n.appendChild(r),n.addEventListener("click",(function(){removeCities()}))}$((function(){cityNames=["San Francisco","Sacramento","Los Angeles","Las Vegas"],cityMarkers=[],coordinateMarkers=[];try{initMap()}catch(e){displayError(e)}}));