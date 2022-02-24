// ######################################
/* GLOBAL VARIABLES */

var plantationLayer = new L.geoJson(null);
var unconfirmedLayer = new L.geoJson(null);
var globalSaplingId = '';

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
    layers: [gStreets],
    scrollWheelZoom: true,
    maxZoom: 20,
});
$('.leaflet-container').css('cursor','crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs
L.control.scale({metric:true, imperial:false}).addTo(map);

// SVG renderer
var myRenderer = L.canvas({ padding: 0.5 });

var overlays = {
    "plants": plantationLayer,
    "unconfirmed": unconfirmedLayer
}

var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true, autoZIndex:false, position:'bottomright'}).addTo(map); 

// https://github.com/Leaflet/Leaflet.fullscreen
map.addControl(new L.Control.Fullscreen({position:'topright'}));


plantationLayer.addTo(map);
unconfirmedLayer.addTo(map);

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

L.control.search({
    layer: plantationLayer,
    initial: false,
    propertyName: 'search',
    buildTip: function(text, val) {
        let group = val.layer.feature.properties.group;
        let name = val.layer.feature.properties.name;
        return `<a href="#" class="${group}">${name} &nbsp; <small>(${group})</small></a>`;
    },
    textPlaceholder: 'Search by name'
})
.addTo(map);

L.control.custom({
    position: 'bottomleft',
    content: `<div class="legend" id="legendContent">
        <p><b>Legend</b><br>
        <span style="background-color: #800080; display: inline-block; width: 15px; height: 15px; margin: 0px; "></span> Unconfirmed<br>
        <span style="background-color: #008000; display: inline-block; width: 15px; height: 15px; margin: 0px; "></span> Confirmed<br>
        <span style="background-color: #0000ff; display: inline-block; width: 15px; height: 15px; margin: 0px; "></span> Requested for Adoption<br>
        <span style="background-color: #ffa500; display: inline-block; width: 15px; height: 15px; margin: 0px; "></span> Adopted<br>
        </p>
    </div>`,
    classes: 'divOnMap_left'
}).addTo(map);

// L.control.custom({
//     position: 'bottomleft',
//     content: `<div id="leftInfo"></div>`,
//     classes: 'divOnMap_left'
// }).addTo(map);


// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    loadMap();

    $(document).on('click', '[data-toggle="lightbox"]', function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });

    // $("img").unveil(); // http://luis-almeida.github.io/unveil/

});



// ############################################
// FUNCTIONS

function loadMap() {
    var payload = {"description": "hello" };
    $('#content').html(`Loading saplings data..`);
    $.ajax({
        url : `${APIpath}/getSaplings`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            processData(returndata);
            $('#content1').html(`Click on a sapling on the map to see more details<br><br><br><br><br>`);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#content1').html(`Error: ${jqXHR.responseText}`);
        }
    });
}



function processData(returndata) {
    console.log(returndata);
    plantationLayer.clearLayers();
    returndata.data_confirmed.forEach(r => {
        // console.log(r);
        // let photos = r.first_photos.split(',');
        // if(photos.length < 2) photos.push(photos[0]); // in case 2nd photo is missing, repeat the first
        let mapPhoto = r.first_photos[r.first_photos.length-1]; // take last photo as map hover pic

        let tooltipContent = `${r.adoption_status=='approved' ? `${r.adopted_name} (${r.name})` : r.name}<br>
        <div class="mapImgDiv">
        <img class="mapImgPreview" src="${saplingThumbPath}${mapPhoto}">
        </div>
        `;

        var marker = L.circleMarker([r.lat,r.lon], { renderer: myRenderer,
            radius: 6,
            fillColor: decideFillColor(r.adoption_status),
            color: 'white',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindTooltip(tooltipContent, {direction:'right', offset: [30,50], className:'mapToolTip'});

        marker.on('click', function() {
            
            globalSaplingId = r.id;
            let content1 = ``;
            let content2 = ``;
            let content3 = ``;

            content1 += `<h4><span class="s_name">${r.name || ''}</span> <small>(id: ${r.id})</small>
            ${r.adopted_name ? `<br>Adopted name: ${r.adopted_name}` : ''}</h4>
                <div class="sapling_images">`;
            r.first_photos.forEach(p => {
                content1 += `<div class="card">
                <a href="${photoPath}${p}" data-toggle="lightbox">
                <img class="imgPreview" src="${saplingThumbPath}${p}"></a>
                </div>`;
            });
            content1 += `</div>`;
                

            content2 += `<p>Status: ${r.adoption_status=='approved'?`Adopted`:'<b>Available for Adoption</b>'}<br>`;
            
            content2 += `<p>
                Local Name: <span class="s_local_name">${r.local_name || ''}</span><br>
                Botanical Name: <span class="s_botanical_name">${r.botanical_name || ''}</span><br>
                Planted Date: <span class="s_planted_date">${r.planted_date || ''}</span><br>
                Data collection date: <span class="s_data_collection_date">${r.data_collection_date || ''}</span><br>
                Group: <span class="s_group">${r.group || ''}</span><br>
                Height: <span class="s_height">${r.height || ''}</span> | 
                Canopy: <span class="s_canopy">${r.canopy || ''}</span> |
                Girth@1m: <span class="s_girth_1m">${r.girth_1m || ''}</span><br>
                Location: <span title="click to zoom here" onclick="zoomTo(${r.lat},${r.lon})" class="badge badge-secondary s_location">${r.lat}, ${r.lon}
                </span><br>
                Description: <span class="s_description">${r.description || ''}</span><br>
                </p>
                <p><button class="btn" onclick="loadObservations()">Load Observations</button></p>`;
            
            
            let actionHTML='';
            if(globalRole == 'sponsor') {
                if (r.adoption_status!='approved') {
                    //adopted_name comments
                    actionHTML += `<p>Request for Adoption</p>
                    <input placeholder="adopted name" id="adopted_name" class="form-control bottomGap" type="text">
                    <textarea placeholder="comments if any" id="adopt_comments" class="form-control bottomGap"></textarea>
                    <button class="btn btn-primary bottomGap" onclick="requestAdoption('${r.id}')">Request to Adopt</button> 
                    <span id="requestAdoption_status"></span>
                    `;
                }
            } else if (['admin', 'moderator', 'saplings_admin'].includes(globalRole)) {
                actionHTML += `<h4>Action</h4>
                    <button class="btn btn-warning bottomGap btn-md btn-block" onclick="editSaplingStart('${r.id}')">Edit</button>
                    <span id="actionStatus"></span>
                `;
            }
            content3 += actionHTML;
            
            $('#content1').html(content1);
            $('#content2').html(content2);
            $('#content3').html(content3);

            // loadObservations(r.id);

        });
        // for leaflet-search plugin: the marker needs to have feature.properties
        marker.feature = {};
        marker.feature.properties = r;
        marker.addTo(plantationLayer);
    });
    if (!map.hasLayer(plantationLayer)) map.addLayer(plantationLayer);


    // unconfirmed saplings
    unconfirmedLayer.clearLayers();
    returndata.data_unconfirmed.forEach(r => {
        let mapPhoto = r.first_photos[r.first_photos.length-1]; // take last photo as map hover pic

        let tooltipContent = `${r.name || r.id}<br>
        <div class="mapImgDiv">
        <img class="mapImgPreview" src="${saplingThumbPath}${mapPhoto}">
        </div>
        `;

        var marker = L.circleMarker([r.lat,r.lon], { renderer: myRenderer,
            radius: 5,
            fillColor: "purple",
            color: 'black',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindTooltip(tooltipContent, {direction:'right', offset: [30,50], className:'mapToolTip'});

        marker.on('click', function() {
            globalSaplingId = r.id;
        
            let content1 = ``;
            let content2 = ``;
            let content3 = ``;

            content1 += `<h4><span class="s_name">${r.name || ''}</span> <small>(id: ${r.id})</small></h4>
                <div class="sapling_images">`;
            r.first_photos.forEach(p => {
                content1 += `<div class="card">
                <a href="${photoPath}${p}" data-toggle="lightbox">
                <img class="imgPreview" src="${saplingThumbPath}${p}"></a>
                </div>`;
            });
            content1 += `</div>`;
                

            content2 += `<p>Status: Unconfirmed Sapling<br>`;
            
            content2 += `<p>
                Local Name: <span class="s_local_name">${r.local_name || ''}</span><br>
                Botanical Name: <span class="s_botanical_name">${r.botanical_name || ''}</span><br>
                Planted Date: <span class="s_planted_date">${r.planted_date || ''}</span> <br>
                Data collection date: <span class="s_data_collection_date">${r.data_collection_date || ''}</span><br>
                Group: <span class="s_group">${r.group || ''}</span><br>
                Height: <span class="s_height">${r.height || ''}</span> | 
                Canopy: <span class="s_canopy">${r.canopy || ''}</span> |
                Girth@1m: <span class="s_girth_1m">${r.girth_1m || ''}</span><br>
                Location: <span title="click to zoom here" onclick="zoomTo(${r.lat},${r.lon})" class="badge badge-secondary s_location">${r.lat}, ${r.lon}
                </span><br>
                Description: <span class="s_description">${r.description || ''}</span>
                </p>`;
            
            
            let actionHTML='';
            if(['admin', 'moderator', 'saplings_admin'].includes(globalRole)) {
                actionHTML += `<h4>Take action</h4>
                    <button class="btn ctgreen bottomGap btn-md btn-block" onclick="confirmSapling('${r.id}')">Confirm</button>
                    <button class="btn ctblue bottomGap btn-md btn-block" onclick="editSaplingStart('${r.id}')">Edit</button>
                    <button class="btn btn-danger bottomGap btn-md btn-block" onclick="rejectSapling('${r.id}')">Reject</button>
                    <span id="actionStatus"></span>
                `;

            }
            content3 += actionHTML;
            // else if (['admin','moderator'].includes(globalRole) && r.adoption_status=='requested') {
            //     actionHTML
            // }
            $('#content1').html(content1);
            $('#content2').html(content2);
            $('#content3').html(content3);

        });
        marker.addTo(unconfirmedLayer);
    });
    // if (!map.hasLayer(unconfirmedLayer)) map.addLayer(unconfirmedLayer);

}


function requestAdoption(sapling_id) {
    console.log("requestAdoption",sapling_id);

    // adopted_name adopt_comments
    let payload = {"data":[{
        "sapling_id": sapling_id,
        "adopted_name": $('#adopted_name').val(),
        "comments": $('#adopt_comments').val() || '',
    }]};
    $('#requestAdoption_status').html("Submitting request..");
    // requestAdoption
    $.ajax({
        url : `${APIpath}/requestAdoption`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            let result = 'Your request has been submitted.';
            if (returndata.already_adopted.length)
                result = `Sorry, this sapling is already adpoted.`;
            else if(returndata.already_requested.length) 
                result = "You have already requested for this sapling.";
            else if(returndata.invalid.length) 
                result = `Invalid submission, please select and try again`;
            $('#requestAdoption_status').html(result);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#requestAdoption_status').html(jqXHR.responseText);
        }
    });
}

function decideFillColor(adoption_status) {
    if(!adoption_status) return 'green';
    if(adoption_status == 'approved') return 'orange';
    if(adoption_status == 'requested') return 'blue';
    return 'green'; // default
}


function confirmSapling(sapling_id) {
    if(!confirm("Are you sure you want to CONFIRM this sapling? It will be moved into confirmed saplings list.")) return;
    
    let payload = { 'sapling_id': sapling_id, 'accepted':true };
    $('#actionStatus').html(`Confirming..`);
    $.ajax({
        url : `${APIpath}/processUploadedSapling`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        success : function(returndata) {
            $('#actionStatus').html(`Confirmed sapling. (Reload page to see changes)`);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#actionStatus').html(`Error: ${jqXHR.responseText}`);
        }
    });
}

function rejectSapling(sapling_id) {
    if(!confirm("Are you sure you want to REJECT this sapling? It will be removed.")) return;
    
    let payload = { 'sapling_id': sapling_id, 'accepted':false };
    $('#actionStatus').html(`Rejecting..`);
    $.ajax({
        url : `${APIpath}/processUploadedSapling`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        success : function(returndata) {
            $('#actionStatus').html(`Rejected sapling. (Reload page to see changes)`);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#actionStatus').html(`Error: ${jqXHR.responseText}`);
        }
    });
}

function editSaplingStart(sapling_id) {
    console.log('editSaplingStart',sapling_id);
    // populate fields
    $('#edit_sapling_id').html(sapling_id);
    $('#edit_name').val($('.s_name').html()); 
    $('#edit_local_name').val($('.s_local_name').html()); 
    $('#edit_botanical_name').val($('.s_botanical_name').html()); 
    $('#edit_planted_date').val($('.s_planted_date').html()); 
    $('#edit_data_collection_date').val($('.s_data_collection_date').html()); 
    $('#edit_group').val($('.s_group').html()); 
    $('#edit_description').val($('.s_description').html());
    
    $('#editSapling_status').html(``);
    $('#modal_editSapling').modal('show');

}

function editSapling() {
    let payload = {
        'sapling_id' : $('#edit_sapling_id').html(),
        'name': $('#edit_name').val(),
        'local_name' : $('#edit_local_name').val(),
        'botanical_name' : $('#edit_botanical_name').val(),
        'planted_date' : $('#edit_planted_date').val(),
        'data_collection_date' : $('#edit_data_collection_date').val(),
        'group' : $('#edit_group').val(),
        'description' : $('#edit_description').val()
    }
    $('#editSapling_status').html(`Saving...`);
    $.ajax({
        url : `${APIpath}/editSapling`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        success : function(returndata) {
            $('#editSapling_status').html(`Saved.`);
            setTimeout(function () {
                $('#modal_editSapling').modal('hide');
            }, 500);

        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#editSapling_status').html(`Error: ${jqXHR.responseText}`);
        }
    });   
}

// ##########################

function loadObservations() {
    let payload = {
        "saplingsList": [globalSaplingId]
    };
    $(`#loadObservations_status`).html(`Loading..`);
    $.ajax({
        url : `${APIpath}/viewObservations`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        success : function(returndata) {
            console.log(returndata);
            $('#loadObservations_status').html(`Loaded.`);

        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#loadObservations_status').html(`Error: ${jqXHR.responseText}`);
        }
    });  
}