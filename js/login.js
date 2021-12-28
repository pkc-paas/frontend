// login.js

// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    loggedInCheck();
});


function login() {
    var payload = {
        username: $("#username").val(),
        pw: $("#pw").val(),
    };
    //console.log(payload);
    $("#loginStatus").html("Checking..");
    $.ajax({
        url : `${APIpath}/login`,
        type : 'POST',
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);

            setCookie("paas_auth_token",returndata.token,365);
            setCookie("paas_user",payload.username,365);
            $('#account_info').html(`${payload.username} - ${payload.role}`);
            $('#loginStatus').html(`Logged in, taking you to home page..`);
            setTimeout(function () {
                window.location.href = "home.html";
            }, 1000);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            alert(jqXHR.responseText);
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });

}
