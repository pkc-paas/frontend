// login.js

// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {

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
            }, 500);
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            try {
                let a = JSON.parse(jqXHR.responseText);
                $('#loginStatus').html(a.detail);
            } catch(err) {
                $('#loginStatus').html(jqXHR.responseText);
            }
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });

}


function signup() {
    const minPwLen = 6;
    if ($('#pw').val().length < minPwLen ) {
        alert(`Please choose a stronger password, at least ${minPwLen} chars in length.`);
        return;
    }

    if( $('#pw').val() != $('#pw_confirm').val()) {
        alert(`Passwords don't match.`);
        return;
    }

    let payload = {
        "username": $('#username').val(),
        "fullname": $('#name').val(),
        "email": $('#email').val(),
        "pwd": $('#pw').val(),
        "role": $('#role').val(),
        "referral": $('#referral').val()
    };

    if ( payload['username'].length < 4 || payload['username'].length >20) {
        alert("Invalid username");
        return;
    }

    if ( payload['pwd'].length < 4 || payload['pwd'].length >50) {
        alert("Invalid password, please try another");
        return;
    }

    $('#signupStatus').html('Please wait...');

    $.ajax({
        url : `${APIpath}/signup`,
        type : 'POST',
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            if (returndata.auto)
                $('#signupStatus').html(`You have been signed up directly. Please <b><a href="login.html">click here</a></b> to login.`);
            else {
                $('#signupStatus').html(`Your signup application has been submitted. You will receive an email once it is approved.`);
                setTimeout(function () {
                    window.location.href = "index.html";
                }, 5000);
            }
            
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            try {
                let a = JSON.parse(jqXHR.responseText);
                $('#signupStatus').html(a.detail);
            } catch(err) {
                $('#signupStatus').html(jqXHR.responseText);
            }
            // var data = JSON.parse(jqXHR.responseText);
            // $('#createUserStatus').html(data['message']);
        }
    });

}