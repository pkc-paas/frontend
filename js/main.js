// ######################################
/* GLOBAL VARIABLES */

var plantationLayer = new L.geoJson(null);

// #################################
/* MAP */

var cartoPositron = L.tileLayer.provider('CartoDB.Positron');
var OSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
var gStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var esriWorld = L.tileLayer.provider('Esri.WorldImagery');

var baseLayers = { "OpenStreetMap.org" : OSM, "Carto Positron": cartoPositron, "ESRI Satellite": esriWorld, 
    "Streets": gStreets, "Hybrid": gHybrid };

var map = new L.Map('map', {
    center: STARTLOCATION,
    zoom: STARTZOOM,
    layers: [cartoPositron],
    scrollWheelZoom: true,
    maxZoom: 19,
});
$('.leaflet-container').css('cursor','crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs
L.control.scale({metric:true, imperial:false}).addTo(map);

// SVG renderer
var myRenderer = L.canvas({ padding: 0.5 });

var overlays = {
    "plants": plantationLayer
};
var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true, autoZIndex:false, position:'topright'}).addTo(map); 

// https://github.com/Leaflet/Leaflet.fullscreen
map.addControl(new L.Control.Fullscreen({position:'topright'}));

L.control.custom({
    position: 'bottomright',
    content: `<div class="legend" id="legendContent"></div>`,
    classes: 'divOnMap_right'
}).addTo(map);

L.control.custom({
    position: 'bottomleft',
    content: `<div id="leftInfo"></div>`,
    classes: 'divOnMap_left'
}).addTo(map);

plantationLayer.addTo(map);

var circleMarker1 = {
    renderer: myRenderer,
    radius: 5,
    fillColor: 'green',
    color: 'white',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8
};

// var hash = new L.Hash(map);



// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
	loadMap();
});



// ############################################
// FUNCTIONS

function loadMap() {
	var payload = {"description": "hello" };
	$.ajax({
        url : `${APIpath}/getData1`,
        type : 'POST',
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            // var returnJ = JSON.parse(returndata);
            processData(returndata.data);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });
}



function processData(data) {
	plantationLayer.clearLayers();
	data.forEach(r => {
		console.log(r);
		let tooltipContent = `${r.title}`;

		var marker = L.circleMarker([r.lat_5_GPS_location,r.long_5_GPS_location], circleMarker1)
        .bindTooltip(tooltipContent, {direction:'top', offset: [0,-5]});

        marker.addTo(plantationLayer);
        marker.on('click', function() {
        });
	});
	if (!map.hasLayer(plantationLayer)) map.addLayer(plantationLayer);

}

function displayData(r) {

}