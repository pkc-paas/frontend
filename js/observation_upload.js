// sapling_upload.js

// ##############################################
// GLOBAL VARS

var formData = new FormData();
var globalGeo;
// var URLParams = {}; // for holding URL parameters

// #################################
/* MAP */
// var cartoPositron = L.tileLayer.provider('CartoDB.Positron');
// var OSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
// var gStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
// var gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
// var esriWorld = L.tileLayer.provider('Esri.WorldImagery');

// var baseLayers = { "Carto Positron": cartoPositron, "OpenStreetMap.org" : OSM, "ESRI Satellite": esriWorld, 
//     "Streets": gStreets, "Hybrid": gHybrid };

// var map = new L.Map('map', {
//     center: STARTLOCATION,
//     zoom: 19,
//     layers: [gStreets],
//     scrollWheelZoom: true,
//     maxZoom: 20,
//     touchZoom: 'center'
// });
// $('.leaflet-container').css('cursor','crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs
// L.control.scale({metric:true, imperial:false}).addTo(map);

// // SVG renderer
// var myRenderer = L.canvas({ padding: 0.5 });

// var overlays = {
//     //"plants": plantationLayer
// };
// var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true, autoZIndex:false, position:'topright'}).addTo(map); 

// // https://github.com/Leaflet/Leaflet.fullscreen
// map.addControl(new L.Control.Fullscreen({position:'topright'}));


// // Add in a crosshair for the map. From https://gis.stackexchange.com/a/90230/44746
// var crosshairIcon = L.icon({
//     iconUrl: crosshairPath,
//     iconSize:     [crosshairSize, crosshairSize], // size of the icon
//     iconAnchor:   [crosshairSize/2, crosshairSize/2], // point of the icon which will correspond to marker's location
// });
// crosshair = new L.marker(map.getCenter(), {icon: crosshairIcon, interactive:false});
// crosshair.addTo(map);
// // Move the crosshair to the center of the map when the user pans
// map.on('move', function(e) {
//     var currentLocation = map.getCenter();
//     crosshair.setLatLng(currentLocation);
//     $('#location').val(`${currentLocation.lat.toFixed(6)},${currentLocation.lng.toFixed(6)}`)
// });

// globalGeo = L.geolet({ position: 'topright',
//         geoOptions: { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
//     }).addTo(map);

// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {

    loadURLParams(URLParams);
    
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

    if(URLParams['S']) {
        saplingInfo4Obs(URLParams['S']);

    } else {
        $('#saplingInfo').html(`No sapling chosen. Taking you back to home page. Please choose a sapling there, then click "Upload Observation" button and you will be brought here properly.`);
        setTimeout(function () {
            window.location.href = "home.html";
        }, 3000);
    }
    $('#observation_date').flatpickr({
        allowInput: true,
        maxDate: 'today',
        defaultDate: 'today'
    });

    // $(".collapse").on('shown.bs.collapse', function(){
    //     map.invalidateSize();
    //     console.log('The collapsible content is now fully shown.');
    // });
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


function postObservation() {
    // formData
    if(formData.getAll('uploadFiles').length < 1) {
        alert("Please attach at least one photo");
        return;
    }

    if(formData.getAll('uploadFiles').length > maxUploadCount) {
        alert(`Over ${maxUploadCount} photos not allowed in one submission, please remove some.`);
        return;
    }
    
    // form fields validation
    let sapling_id = URLParams['S'];
    let observation_date = $('#observation_date').val();
    let growth_status = $('#growth_status').val();
    let health_status = $('#health_status').val();
    let observation = $('#observation').val();

    if(!sapling_id.length || !observation_date.length || !observation.length) {
        alert('all essential fields not filled');
        return;
    }

    // clear previous formData fields if any
    formData.delete('sapling_id');
    formData.delete('observation_date');
    formData.delete('observation');
    formData.delete('growth_status');
    formData.delete('health_status');

    formData.append('sapling_id', sapling_id );
    formData.append('observation_date', observation_date );
    formData.append('observation', observation );
    if(growth_status) formData.append('growth_status', growth_status );
    if(health_status) formData.append('health_status', health_status );
    
    $('#postObservationStatus').html(`Uploading...`);
    $.ajax({
        url : `${APIpath}/postObservation`,
        type : 'POST',
        data : formData,
        cache: false,
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        headers: { "x-access-key": getCookie('paas_auth_token') },
        success : function(data) {
            console.log(data);
            $('#postObservationStatus').html(`Thank you! The observation has been uploaded.`);
            setTimeout(function () {
                clearFields();
            }, 1000);
        },
        error: function(jqXHR, exception) {
            console.log('postObservation POST request failed.');
            $("#postObservationStatus").html('error');
        }

    });


}

function clearFields() {
    $('#observation_date').val('');
    $('#growth_status').val('');
    $('#health_status').val('');
    $('#observation').val('');
    clearUploads();
    formData = new FormData();    
}


function saplingInfo4Obs(sapling_id) {
    var payload = {"sapling_id": sapling_id };
    $('#content').html(`Loading saplings data..`);
    $.ajax({
        url : `${APIpath}/saplingInfo4Obs`,
        type : 'POST',
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            let r = returndata['sapling_data'];
            let content = ``;
            content += `<div class="alert alert-success" role="alert">
                <p>
                Local Name: <span class="s_local_name">${r.local_name || ''}</span><br>
                Botanical Name: <span class="s_botanical_name">${r.botanical_name || ''}</span><br>
                Planted Date: <span class="s_planted_date">${r.planted_date || ''}</span><br>
                Data collection date: <span class="s_data_collection_date">${r.data_collection_date || ''}</span><br>
                Group: <span class="s_group">${r.group || ''}</span><br>
                Height: <span class="s_height">${r.height || ''}</span> | 
                Canopy: <span class="s_canopy">${r.canopy || ''}</span> |
                Girth: <span class="s_girth_1m">${r.girth_1m || ''}</span><br>
                Location: ${r.lat}, ${r.lon}
                <br>
                Description: <span class="s_description">${r.description || ''}</span><br>
                
            `;
            if(r['num']) {
                content += `${r['num']} Observations recorded, last on ${r['last_date']}}<br>`
            }
            content += `</p></div>`;
            $('#saplingInfo').html(content);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#content1').html(`Error: ${jqXHR.responseText}`);
        }
    });
}