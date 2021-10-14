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

// L.control.custom({
//     position: 'bottomright',
//     content: `<div class="legend" id="legendContent"></div>`,
//     classes: 'divOnMap_right'
// }).addTo(map);

// L.control.custom({
//     position: 'bottomleft',
//     content: `<div id="leftInfo"></div>`,
//     classes: 'divOnMap_left'
// }).addTo(map);

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

// Add in a crosshair for the map. From https://gis.stackexchange.com/a/90230/44746
var crosshairIcon = L.icon({
    iconUrl: crosshairPath,
    iconSize:     [crosshairSize, crosshairSize], // size of the icon
    iconAnchor:   [crosshairSize/2, crosshairSize/2], // point of the icon which will correspond to marker's location
});
crosshair = new L.marker(map.getCenter(), {icon: crosshairIcon, interactive:false});
crosshair.addTo(map);
// Move the crosshair to the center of the map when the user pans
map.on('move', function(e) {
    var currentLocation = map.getCenter();
    crosshair.setLatLng(currentLocation);
});


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
		let tooltipContent = `${r.title}<br>
		<img src="${photoPath}${r.ec5_uuid}_1.jpg"></div>
		`;

		var marker = L.circleMarker([r.lat_5_GPS_location,r.long_5_GPS_location], circleMarker1)
        .bindTooltip(tooltipContent, {direction:'right', offset: [10,-5], className:'mapToolTip'});

        marker.on('click', function() {
        	$('#content').html(`
        		<p>
        		Title: ${r.title}<br>
        		Sapling ID: ${r['3_Sapling_ID']}<br>
        		Local Name: ${r['6_Local_name_of_the_']}<br>
        		Botanical Name: ${r['7_Botanical_name_of_']}<br>
        		Date: ${r['1_Date_of_measuremen']}<br>
        		Measurement Team: ${r['2_Measurement_team_I']}<br>
        		Location: <span title="click to zoom here" onclick="zoomTo(${r.lat_5_GPS_location},${r.long_5_GPS_location})">${r.lat_5_GPS_location}, ${r.long_5_GPS_location}<br>
        		</span></p>
        		<img src="${photoPath}${r.ec5_uuid}_2.jpg"><br><br>
        		<img src="${photoPath}${r.ec5_uuid}_1.jpg">
        	`);
        });
        marker.addTo(plantationLayer);
	});
	if (!map.hasLayer(plantationLayer)) map.addLayer(plantationLayer);

}

function zoomTo(lat,lon) {
	map.flyTo([lat,lon],18,{});
}