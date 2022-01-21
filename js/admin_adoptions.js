// adoptions.js

// ######################################
/* GLOBAL VARIABLES */

var plantationLayer = new L.geoJson(null);
var globalAdoptionEntries = {};
var globalLassoWhichSelect = 'requested';
var globalActiveTable;
// #################################
/* TABULATOR */

var calcTotal = function(values, data, calcParams){
    var calc = values.length;
    return calc + ' total';
}

var tabulator1 = new Tabulator("#tabulator1", {
    height: 400,
    selectable: true,
    index: "sapling_id",
    columns: [
        {title:'user', field:'username', headerFilter:'input', width:100, bottomCalc:calcTotal},
        {title:'name', field:'name', headerFilter:'input', width:100},
        {title:'adopted_name', field:'adopted_name', headerFilter:'input', width:100},
        {title:'approver', field:'approver', headerFilter:'input', width:100},
        {title:'application_date', field:'application_date', headerFilter:'input', width:100},
        {title:'approval_date', field:'approval_date', headerFilter:'input', width:100},
        {title:'created_on', field:'created_on', headerFilter:'input', width:100}
    ]
});
globalActiveTable = tabulator1;
tabulator1.on("rowSelected", function(row){
    //row - row component
    let data = row.getData();
    zoomTo(data.lat, data.lon);
    makeActionDiv();
});

tabulator1.on("rowDeselected", function(row){
    //row - row component
    makeActionDiv();
});

// second table
var tabulator2 = new Tabulator("#tabulator2", {
    height: 400,
    selectable: true,
    index: "sapling_id",
    columns: [
        {title:'user', field:'username', headerFilter:'input', width:100, bottomCalc:calcTotal},
        {title:'name', field:'name', headerFilter:'input', width:100},
        {title:'adopted_name', field:'adopted_name', headerFilter:'input', width:100},
        {title:'approver', field:'approver', headerFilter:'input', width:100},
        {title:'application_date', field:'application_date', headerFilter:'input', width:100},
        {title:'approval_date', field:'approval_date', headerFilter:'input', width:100},
        {title:'created_on', field:'created_on', headerFilter:'input', width:100}
    ]
});
tabulator2.on("rowSelected", function(row){
    //row - row component
    let data = row.getData();
    zoomTo(data.lat, data.lon);
    makeActionDiv();
});

tabulator2.on("rowDeselected", function(row){
    //row - row component
    makeActionDiv();
});

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

const lasso = L.lasso(map); // lasso tool : https://github.com/zakjan/leaflet-lasso

// buttons on map
L.easyButton('<img src="lib/lasso.jpg" width="100%" title="Click to activate Lasso tool: Press mouse button down and drag to draw a lasso on the map around the points you want to select." data-toggle="tooltip" data-placement="right">', function(btn, map){
    lasso.enable();
}).addTo(map);

// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    loadAdoptionEntries();

    map.on('lasso.finished', (event) => {
        console.log(`${event.layers.length} saplings selected by lasso tool`);
        tabulator1.deselectRow();
        event.layers.forEach(element => {
            if(element.properties && element.properties.sapling_id && 
                element.properties.status && element.properties.status == globalLassoWhichSelect) {
                globalActiveTable.selectRow(element.properties.sapling_id);
            }
        });
    });

    map.on('lasso.disabled', (event) => {
        // lasso was making mouse cursor into hand after completion. So make it crosshairs again
        $('.leaflet-container').css('cursor','crosshair');
        // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs
    });

    // https://getbootstrap.com/docs/4.0/components/navs/#via-javascript
    $('#nav-tab1-tab').on('click', function (e) {
      // e.preventDefault();
      // $(this).tab('show');
      globalLassoWhichSelect = 'requested';
      globalActiveTable = tabulator1;
    })
    $('#nav-tab2-tab').on('click', function (e) {
      globalLassoWhichSelect = 'approved';
      globalActiveTable = tabulator2;
    })
});

// ############################################
// FUNCTIONS

function loadAdoptionEntries() {
    $('#actionDiv1').html(`Select some entries to take action`);
    $('#actionDiv2').html(`Select some entries to take action`);
    tabulator1.clearData();
    tabulator2.clearData();
    
    let payload = {};
    $.ajax({
        url : `${APIpath}/viewAdoptionEntries`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            // var returnJ = JSON.parse(returndata);
            globalAdoptionEntries = returndata;
            tabulator1.setData(returndata.requested);
            tabulator2.setData(returndata.approved);
            mapSaplings(returndata.saplings);

        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });
    // let table = Tabulator.findTable("#tabulator_stoptimes")[0];
    // let data = table.getData();

}

function mapSaplings(data) {
    plantationLayer.clearLayers();
    data.forEach(r => {
        let photos = r.first_photos.split(',');
        if(photos.length < 2) photos.push(photos[0]); // in case 2nd photo is missing, repeat the first

        let tooltipContent = `${r.name}<br>
        Requests: ${r.num_requests}`;

        var marker = L.circleMarker([r.lat,r.lon], { renderer: myRenderer,
            radius: 6,
            fillColor: r.status == 'requested'? 'blue': 'orange',
            color: 'white',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindTooltip(tooltipContent, {direction:'right', offset: [10,0]});
        marker.properties = r;
        marker.addTo(plantationLayer);
    });
    if (!map.hasLayer(plantationLayer)) map.addLayer(plantationLayer);

}

function makeActionDiv() {
    let data1 = tabulator1.getSelectedData();
    if(!data1.length) {
        $('#actionDiv1').html(`Select some entries to take action`);
    } else {
        let content = `<span id="processRequest_status"></span> &nbsp; ${data1.length} selected <select id="requestActionSelect" class="bigSelect">
            <option value="">Choose an Action</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            </select> <button class="btn btn-sm btn-warning" onclick="processRequest()">Submit</button>
        `;
        $('#actionDiv1').html(content);
    }
    

    // second table
    let data2 = tabulator2.getSelectedData();
    // console.log('data2',data2);
    if(!data2.length) {
        $('#actionDiv2').html(`Select some entries to take action`);
        
    } else {
        let content2 = `<span id="processAdoptionChange_status"></span> &nbsp; ${data2.length} selected <select id="adoptionChangeSelect" class="bigSelect">
            <option value="">Choose an Action</option>
            <option value="remove">Remove Adopted Status</option>
            
            </select> <button class="btn btn-sm btn-warning" onclick="processAdoptionChange()">Submit</button>
        `;
        $('#actionDiv2').html(content2);
    }
    

}

function processRequest() {
    let action = $('#requestActionSelect').val();
    if(!action) return;

    let data = tabulator1.getSelectedData();
    if(!data.length) {
        return;
    }

    let idsList = [];
    data.forEach(r => {
        idsList.push(r.id)
    });
    
    $('#processRequest_status').html(`Saving..`);

    let payload = {"idsList": idsList, "action":action};
    $.ajax({
        url : `${APIpath}/processAdoptionRequest`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            if(returndata.status == 'duplicates') {
                $('#processRequest_status').html(`Multiple requests for same sapling chosen. Please deselect all but one.`);

            } else {
            $('#processRequest_status').html(`Saved to DB.`);
            loadAdoptionEntries();

            }
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });
}


function processAdoptionChange() {
    let action = $('#adoptionChangeSelect').val();
    if(!action) return;
    
    let data = tabulator2.getSelectedData();
    if(!data.length) {
        return;
    }

    let idsList = [];
    data.forEach(r => {
        idsList.push(r.id)
    });

    $('#processAdoptionChange_status').html(`Saving..`);

    let payload = {"idsList": idsList, "action":action};
    $.ajax({
        url : `${APIpath}/processAdoptionRequest`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            $('#processAdoptionChange_status').html(`Saved to DB.`);
            loadAdoptionEntries();

        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });
}


