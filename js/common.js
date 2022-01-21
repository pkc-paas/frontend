// ###########################################################
// CONSTANTS
const STARTLOCATION = [18.57,73.7804];
const STARTZOOM = 14;

const crosshairPath = 'lib/focus-black.svg';
const crosshairSize = 50;

let APIpath = 'https://server.nikhilvj.co.in/paas_backend/API';
let staticPath = 'https://server.nikhilvj.co.in/paas_backend/static'
if (window.location.host =="localhost:8000") { 
    APIpath = 'http://localhost:5400/API';
    staticPath = 'http://localhost:5400/static'
}

// let photoPath = `${APIpath}/getPhoto?f=`;
let photoPath = `${staticPath}/sapling_photos/`;
let saplingThumbPath = `${staticPath}/sapling_thumbs/`;

let obsPath = `${staticPath}/observation_files/`;
let obsThumbsPath = `${staticPath}/observation_thumbs/`;

var globalLoggedIn = false;
var globalRole = '';
var globalUser = '';

// ###########################################################
// RUN ON PAGE LOAD
$(document).ready(function() {

    topMenu();
    footer();

    // initiate bootstrap / jquery components like tabs, accordions
    // initiate accordion
    $( "#accordion" ).accordion({
        collapsible: true, active: false
    });

    // tabs
    $( "#tabs" ).tabs({
        active:0
    });
    // // tooltips:
    // $('[data-toggle="tooltip"]').tooltip();


});




function topMenu() {
    // navbar navbar-expand-lg navbar-light bg-light
    // sticky menu: https://getbootstrap.com/docs/4.0/components/navbar/#placement
    var menu = `
<nav class="navbar navbar-expand-md navbar-dark bg-success fixed-top">
  <a class="navbar-brand" href="index.html">ConnecTrees</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto" id="menuItems">
        <li class="nav-item">
            <a class="nav-link" href="home.html">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="about_us.html">About Us</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="our_partners.html">Our Partners</a>
        </li>
    </ul>
    <ul class="navbar-nav">
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span id="account_toptext">Account</span></a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown1">
                <a class="dropdown-item" href="#" id="account_info">Not logged in</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" onclick="logOutOrIn()" id="login_logout">Login</a>
            </div>
        </li>
    </ul>
  </div>
</nav>
    `;
    $('#topMenu').html(menu);
}

function footer(){
    var footer = `
    <footer id="sticky-footer" class="flex-shrink-0 py-4 bg-dark text-white-50">
    <div class="container text-center" style="color: white;">
      <small>Website by ConnecTrees. <a href="https://github.com/pkc-paas/" target="_blank">Github</a></small>
    </div>
    </footer>`;
    $('#footer').html(footer);
}


// ###########################################################
// Login management related

function setCookie(cname, cvalue, exdays = 7) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function logout() {
    $('#account_toptext').html(`Logging out..`)
    $.ajax({
        url : `${APIpath}/logout`,
        type : 'GET',
        cache: false,
        contentType: 'application/json',
        headers: { "x-access-key": getCookie('paas_auth_token') },
        success : function(returndata) {
            console.log(returndata);
            setCookie("paas_user", "", 1);
            setCookie("paas_auth_token","",1);
            $('#account_toptext').html(`Logged out`)
            setTimeout(function () {
              window.location.href = "index.html";
            }, 1000);
            
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            setTimeout(function () {
              window.location.href = "index.html";
            }, 2000);
        }
    });
}

function loggedInCheck() {
    let token = getCookie('paas_auth_token');
    if (!token) return;

    // checkUser
    $.ajax({
        url : `${APIpath}/checkUser`,
        type : 'GET',
        cache: false,
        contentType: 'application/json',
        headers: { "x-access-key": token },
        success : function(returndata) {
            console.log(returndata);
            $('#account_info').html(`${returndata.username} - ${returndata.role}`);
            $('#login_logout').html(`Logout`);
            globalLoggedIn = true;
            globalRole = returndata.role;
            globalUser = returndata.username;
            if(['admin','moderator'].includes(returndata.role)) {
                $('#menuItems').append(`<li class="nav-item">
                    <a class="nav-link" href="adoptions.html">Adoptions</a>
                </li>`);
            }
        },
        error: function(jqXHR, exception) {
            console.log('error:',jqXHR.responseText);
            // setTimeout(function () {
            //   window.location.href = "index.html";
            // }, 2000);
        }
    });
}

function logOutOrIn() {
    if(globalLoggedIn) {
        logout();
    } else {
        setTimeout(function () {
            window.location.href = "index.html";
        }, 1000);
    }
}

function zoomTo(lat,lon) {
    map.flyTo([lat,lon],18,{});
}


// #############################
// Image upload preview related

function displayAsImage(file, destId) {
    var imgURL = URL.createObjectURL(file),
        img = document.createElement('img');
 
    img.onload = function() {
      URL.revokeObjectURL(imgURL);
    };
 
    img.src = imgURL;
    // 432 x 768
    // img.style.height = '40%';
    // img.style.width = '40%';
    img.classList.add("imgPreview"); // from https://www.geeksforgeeks.org/how-to-dynamically-create-and-apply-css-class-in-javascript/
    img.classList.add("card"); // from https://www.geeksforgeeks.org/how-to-dynamically-create-and-apply-css-class-in-javascript/

    var uploadTray = document.querySelector(`#${destId}`);
    uploadTray.appendChild(img);
  }
