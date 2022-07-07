// events.js

// ######################################
/* GLOBAL VARIABLES */

// #################################
/* TABULATOR */

// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    eventsList();

});


// ############################################
// FUNCTIONS

function eventsList() {
    let payload = {};
    $(`#eventsHolder`).html(``);
    $.ajax({
        url : `${APIpath}/eventsList`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            let content = ``;

            returndata.events.forEach(r => {
                let d = new Date(r.start_date);
                let holder1 = d.toString().split(' ');
                let mon = holder1[1].toUpperCase();
                let dt = holder1[2];

                content += `
                <div class="row eventCell">
                    <div class="col-md-4">
                    ${dt}<br>${mon}
                    <p>
                    </div>
                    <div class="col-md-8">
                    ${r.title}<hr>
                    ${r.location_addr}<br>
                    <button class="btn btn-primary">Know More</button>
                    </div>

                </div>
                <hr>
                `;
            });
            $('#eventsHolder').html(content);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#eventsHolder').html(`Error: ${jqXHR.responseText}`);
        }
    });
}