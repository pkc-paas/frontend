// users.js

// ######################################
/* GLOBAL VARIABLES */

// #################################
/* TABULATOR */

var calcTotal = function(values, data, calcParams){
    var calc = values.length;
    return calc + ' total';
}

var usersTable = new Tabulator("#usersTable", {
    height: 350,
    selectable: true,
    index: "username",
    columns: [
        {title:'username', field:'username', headerFilter:'input', width:120, bottomCalc:calcTotal},
        {title:'full name', field:'fullname', headerFilter:'input', width:150},
        {title:'role', field:'role', headerFilter:'input', width:100},
        {title:'email', field:'email', headerFilter:'input', width:200},
        {title:'status', field:'status', headerFilter:'input', width:100},
        {title:'created by', field:'created_by', headerFilter:'input', width:100},
        {title:'created on', field:'created_on', headerFilter:'input', width:200},
        {title:'pw change date', field:'last_pw_change', headerFilter:'input', width:150},
        {title:'remarks', field:'remarks', headerFilter:'input', width:200}
    ]
});


// ############################################
// RUN ON PAGE LOAD
$(document).ready(function () {
    listUsers();

});

// ############################################
// FUNCTIONS

function listUsers() {
	usersTable.clearData();
    $('#tableStatus').html(`Loading users list..`);
	$.ajax({
        url : `${APIpath}/listUsers`,
        type : 'GET',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        // data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            usersTable.setData(returndata.data);
            $('#tableStatus').html(`Loaded`);
        },
        error: function(jqXHR, exception) {
            handleError(jqXHR);
        }
    });
}


function createUser() {

    // validation
    if ($('#username').val().length < 8 || $('#pwd').val().length < 8 || $('#email').val().length < 8 ) {
        alert("Please fill all the mandatory fields, min 8 characters");
        return;
    }

    // validate pwd
    if ($('#pwd').val() != $('#pwd2').val()) {
        alert(`Please re-type the password properly`);
        return;
    }
    let payload = {
        "username": $('#username').val(),
        "role": $('#role').val(),
        "pwd": $('#pwd').val(),
        "email": $('#email').val()
    };
    if ($('#fullname').val().length) payload['fullname'] = $('#fullname').val();
    if ($('#remarks').val().length) payload['remarks'] = $('#remarks').val();
    
    $('#createUser_status').html(`Adding user..`);
    $.ajax({
        url : `${APIpath}/createUser`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            $('#createUser_status').html(`User has been created.`);
            listUsers();
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            $('#tableStatus').html(`Error: ${jqXHR.responseText}`);
        }
    });
}


function approve() {
    var selected = usersTable.getSelectedData();
    if(! selected.length) {
        alert("No users selected");
        return;
    }
    let usersList = [];
    selected.forEach(u => {
        if(u.status == 'APPLIED' || u.status == '' )
            usersList.push(u.username);
    })
    if(! usersList.length) {
        alert("No applied users selected");
        return;
    }

    if(!confirm(`Are you sure you want to approve these users: ${usersList.join(', ')}`)) return;

    console.log(usersList);
    
    let payload = {
        "usersList": usersList
    }
    $('#tableStatus').html(`Please wait..`);
    $.ajax({
        url : `${APIpath}/approveUsers`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            $('#tableStatus').html(`${returndata.count} users approved`);
            listUsers();
        },
        error: function(jqXHR, exception) {
            handleError(jqXHR, element='tableStatus');
        }
    });
}

function revert() {
    var selected = usersTable.getSelectedData();
    if(! selected.length) {
        alert("No users selected");
        return;
    }
    let usersList = [];
    selected.forEach(u => {
        if(u.status == 'APPROVED' || u.status == '' )
            usersList.push(u.username);
    })
    if(! usersList.length) {
        alert("No approved users selected");
        return;
    }
    
    if(!confirm(`Are you sure you want to revert the approval status of these users: ${usersList.join(', ')}`)) return;

    console.log(usersList);
    
    let payload = {
        "usersList": usersList
    }
    $('#tableStatus').html(`Please wait..`);

    $.ajax({
        url : `${APIpath}/revertUsers`,
        type : 'POST',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        data : JSON.stringify(payload),
        cache: false,
        contentType: 'application/json',
        // dataType : 'html',
        success : function(returndata) {
            console.log(returndata);
            $('#tableStatus').html(`${returndata.count} users reverted to APPLIED status.`);
            listUsers();
        },
        error: function(jqXHR, exception) {
            handleError(jqXHR, element='tableStatus');
        }
    });
}