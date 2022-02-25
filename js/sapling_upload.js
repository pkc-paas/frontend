// sapling_upload.js

// ##############################################
// GLOBAL VARS

var formData = new FormData();
var globalGeo;


// #################################
/* MAP */
var cartoPositron = L.tileLayer.provider('CartoDB.Positron');
var OSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
var gStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var esriWorld = L.tileLayer.provider('Esri.WorldImagery');

var baseLayers = { "Carto Positron": cartoPositron, "OpenStreetMap.org" : OSM, "ESRI Satellite": esriWorld, 
    "Streets": gStreets, "Hybrid": gHybrid };

var map = new L.Map('map', {
    center: STARTLOCATION,
    zoom: 19,
    layers: [gStreets],
    scrollWheelZoom: true,
    maxZoom: 20,
    touchZoom: 'center'
});
$('.leaflet-container').css('cursor','crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs
L.control.scale({metric:true, imperial:false}).addTo(map);

// SVG renderer
var myRenderer = L.canvas({ padding: 0.5 });

var overlays = {
    //"plants": plantationLayer
};
var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true, autoZIndex:false, position:'topright'}).addTo(map); 

// https://github.com/Leaflet/Leaflet.fullscreen
map.addControl(new L.Control.Fullscreen({position:'topright'}));


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
    $('#location').val(`${currentLocation.lat.toFixed(6)},${currentLocation.lng.toFixed(6)}`)
});

globalGeo = L.geolet({ position: 'topright',
        geoOptions: { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    }).addTo(map);

// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    
    var input = document.querySelector('#mypic');
    input.onchange = function () {
        console.log(input.files.length);
        for(let i=0; i < input.files.length; i++) {
            let file = input.files[i];
            displayAsImage(file, 'uploadTray');
            formData.append('uploadFiles', file );
        }
        // var file = input.files[0];
        
        // input.value = null;
    };

    $('#planted_date').flatpickr({
        allowInput: true,
        maxDate: 'today'
    });
    $('#data_collection_date').flatpickr({
        allowInput: true,
        maxDate: 'today',
        defaultDate: 'today'
    });

    $(".collapse").on('shown.bs.collapse', function(){
        map.invalidateSize();
        console.log('The collapsible content is now fully shown.');
    });
});

function clearUploads() {
    formData.delete('uploadFiles');
    $('#uploadTray').html(``);
    var input = document.querySelector('#mypic');
    input.value = null;
}


function getLocation() {
    globalGeo.activate()
}


function uploadSapling() {
    // formData
    let locationHolder = $('#location').val().split(',');
    if(locationHolder.length != 2) {
        alert("Please enter a valid location first");
        return;
    }

    if(formData.getAll('uploadFiles').length < 1) {
        alert("Please attach at least one photo");
        return;
    }
    // form fields validation
    let name = $('#name').val();
    let group = $('#group').val();
    let local_name = $('#local_name').val();
    let botanical_name = $('#botanical_name').val();
    let planted_date = $('#planted_date').val();
    let data_collection_date = $('#data_collection_date').val();
    let description = $('#description').val();
    let height = $('#height').val().length ? parseFloat($('#height').val()) : null;
    // let canopy = $('#canopy').val();
    // let girth_1m = $('#girth_1m').val();

    if(!name.length || !data_collection_date.length || !group.length || !local_name.length || !botanical_name.length || !planted_date.length || !name.length) {
        alert('all essential fields not filled');
        return;
    }

    formData.append('lat', locationHolder[0] );
    formData.append('lon', locationHolder[1] );
    formData.append('name', name );
    formData.append('group', group );
    if(local_name) formData.append('local_name', local_name );
    if(botanical_name) formData.append('botanical_name', botanical_name );
    if(planted_date) formData.append('planted_date', planted_date );
    formData.append('data_collection_date', data_collection_date );
    if(description) formData.append('description', description );
    if(height) formData.append('height', height );
    // formData.append('canopy', canopy );
    // formData.append('girth_1m', girth_1m );

    $('#uploadSaplingStatus').html(`Uploading...`);
    $.ajax({
        url : `${APIpath}/uploadSapling`,
        type : 'POST',
        data : formData,
        cache: false,
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        headers: { "x-access-key": getCookie('paas_auth_token') },
        success : function(data) {
            console.log(data);
            $('#uploadSaplingStatus').html(`Thank you! The sapling has been uploaded.`);
            setTimeout(function () {
                clearFields();
            }, 1000);
        },
        error: function(jqXHR, exception) {
            console.log('uploadSapling POST request failed.');
            $("#uploadSaplingStatus").html('error');
        }

    });


}

function clearFields() {
    $('#name').val('');
    $('#group').val('');
    $('#local_name').val('');
    $('#botanical_name').val('');
    $('#planted_date').val('');
    $('#data_collection_date').val('');
    $('#description').val('');
    $('#height').val('');
    $('#canopy').val('');
    $('#girth_1m').val('');
    clearUploads();    
}
