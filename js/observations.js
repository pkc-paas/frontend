// observations.js

// #################################
// GLOBAL VARS
var URLParams = {};
var plantationLayer = new L.geoJson(null);
var globalSaplingsLookup = {};
var globalObsPages = 0;


// #################################
// TABULATOR
var calcTotal = function(values, data, calcParams){
    var calc = values.length;
    return calc + ' total';
}

var tabulator1 = new Tabulator("#tabulator1", {
    height: 300,
    selectable: true,
    index: "sapling_id",
    columns: [
        {title:'id', field:'id', headerFilter:'input', width:100, bottomCalc:calcTotal},
        {title:'sapling', field:'sapling_name', headerFilter:'input', width:100},
        {title:'obs date', field:'observation_date', headerFilter:'input', width:100},
        {title:'growth', field:'growth_status', headerFilter:'input', width:100},
        {title:'health', field:'health_status', headerFilter:'input', width:100},
        {title:'sapling id', field:'sapling_id', headerFilter:'input', width:100}
    ]
});
globalActiveTable = tabulator1;

tabulator1.on("rowSelected", function(row){
    //row - row component
    let data = row.getData();
    zoomTo(globalSaplingsLookup[data.sapling_id].lat, globalSaplingsLookup[data.sapling_id].lon);
    
});


// #################################
// MAP
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

// const lasso = L.lasso(map); // lasso tool : https://github.com/zakjan/leaflet-lasso

// // buttons on map
// L.easyButton('<img src="lib/lasso.jpg" width="100%" title="Click to activate Lasso tool: Press mouse button down and drag to draw a lasso on the map around the points you want to select." data-toggle="tooltip" data-placement="right">', function(btn, map){
//     lasso.enable();
// }).addTo(map);



// #################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    loadURLParams(URLParams);


    // Selectize initializatons
    let saplingSelectize = $('#sapling').selectize({
        placeholder: "Narrow down by Sapling",
        labelField: 'sapling_name',
        valueField: 'sapling_id',
        searchField: ['sapling_name','sapling_id'],
        maxItems: 1,
        // plugins: ['remove_button'], // spotted here: https://stackoverflow.com/q/51611957/4355695
        render: {
            item: function(data, escape) {
                return `<div class="item">${escape(data.sapling_name)} <small><${escape(data.sapling_id)})</small></div>`;
            },
            option: function(data, escape) {
                return `<div class="option">${escape(data.sapling_name)} <small>(${escape(data.sapling_id)})</small></div>`;
            },
        },
        onChange(sapling_id) {
            if(sapling_id) {
                loadObservations(1, sapling_id);
            }
            else {
                loadObservations(1);
            }
            // else globalSTATE_ID = null;
        },
        onClear(){
            loadObservations(1);
        }
    });

    if(URLParams['S']) {
        loadObservations(1, URLParams['S']);
    } else 
        loadObservations();

    loadSaplingsDropdown();

});



// #################################
// FUNCTIONS

function loadObservations(pageNum=1, sapling_id=null) {
    console.log(`loadObservations()`);
    let url = `${APIpath}/listObservations?page=${pageNum}`;
    if(sapling_id) url += `&sapling_id=${sapling_id}`;
	$.ajax({
        url: url,
        type: "GET",
        cache: false,
        contentType: 'application/json',
        success: function (returndata) {
            // console.log("listObservations:",returndata);
            globalSaplingsLookup = returndata['saplingsLookup'];
            tabulator1.setData(returndata['observations']);

            // Pagination of observations: showing 50 trips only at a time
            if(pageNum == 1) {
                globalObsPages = Math.ceil(returndata.total_pages/returndata.pageSize);
            }
            let prev = ``;
            if(pageNum > 1) prev = `<button onclick="loadObservations(${pageNum-1})">prev</button>&nbsp;&nbsp;`;
            let next = ``;
            if(pageNum < globalObsPages) next = `&nbsp;&nbsp;<button onclick="loadObservations(${pageNum+1})">next</button>`;
            $('#obsPaginationHolder').html(`Page: ${prev}${pageNum}${next} of ${globalObsPages}`);

            
    	},
        error: function (jqXHR, exception) {
            // console.log("error:" + jqXHR.responseText);
            if(pageNum == 1 && sapling_id) {
                alert(`No Observations data yet for chosen sapling`);
            }

        }
    });
}

function loadSaplingsDropdown() {
    $.ajax({
        url: `${APIpath}/getSaplingsList`,
        type: "GET",
        cache: false,
        contentType: 'application/json',
        success: function (returndata) {
            // console.log("getSaplingsList:",returndata);

            $("#sapling")[0].selectize.clear();
            $("#sapling")[0].selectize.clearOptions(silent=true);
            $("#sapling")[0].selectize.addOption(returndata.saplings);

            if(URLParams['S']) {
                $("#sapling")[0].selectize.setValue(URLParams['S'],silent=true);
            }
            
            
        },
        error: function (jqXHR, exception) {
            console.log("error:" + jqXHR.responseText);

        }
    });
}