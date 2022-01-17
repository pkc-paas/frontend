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


// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    loggedInCheck();
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
            // var returnJ = JSON.parse(returndata);
            processData(returndata);
            $('#content1').html(`Click on a sapling on the map to see more details<br><br><br><br><br>`);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
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
        <img class="mapImgPreview" src="${photoPath}${mapPhoto}">
        </div>
        `;

        var marker = L.circleMarker([r.lat,r.lon], { renderer: myRenderer,
            radius: 5,
            fillColor: decideFillColor(r.adoption_status),
            color: 'white',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindTooltip(tooltipContent, {direction:'right', offset: [30,50], className:'mapToolTip'});

        marker.on('click', function() {
            
            let content1 = ``;
            let content2 = ``;
            let content3 = ``;

            content1 += `<h4>${r.name}</h4>
                <div class="sapling_images">`;
            r.first_photos.forEach(p => {
                content1 += `<div class="card">
                <a href="${photoPath}${p}" data-toggle="lightbox">
                <img class="imgPreview" src="${photoPath}${p}"></a>
                </div>`;
            });
            content1 += `</div>`;
                

            content2 += `<p>Status: ${r.adoption_status=='approved'?'Adopted':'<b>Available for Adoption</b>'}<br>`;
            
            content2 += `<p>
                Local Name: ${r.local_name || ''}<br>
                Botanical Name: ${r.botanical_name || ''}<br>
                Planted Date: ${r.planted_date || ''} <br>
                Data collection date: ${r.data_collection_date || ''}<br>
                Group: ${r.group || ''}<br>
                Location: <span title="click to zoom here" onclick="zoomTo(${r.lat},${r.lon})" class="badge badge-secondary">${r.lat}, ${r.lon}
                </span><br>
                Description: ${r.description || ''}
                </p>`;
            
            
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
            }
            content3 += actionHTML;
            // else if (['admin','moderator'].includes(globalRole) && r.adoption_status=='requested') {
            //     actionHTML
            // }
            $('#content1').html(content1);
            $('#content2').html(content2);
            $('#content3').html(content3);

            loadObservations(r.id);

        });
        marker.addTo(plantationLayer);
    });
    if (!map.hasLayer(plantationLayer)) map.addLayer(plantationLayer);

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

function loadObservations(sapling_id) {
    let payload = {
        "sapling_id": sapling_id
    };
}