// ###########################################################
// CONSTANTS
const crosshairPath = 'lib/focus-black.svg';
const crosshairSize = 50;

const maxUploadCount = 10;

// ###########################################################
// GLOBAL VARIABLES

var STARTLOCATION = [18.57,73.7804];
var STARTZOOM = 14;

let APIpath = 'https://server.nikhilvj.co.in/paas_backend/API';
let staticPath = 'https://server.nikhilvj.co.in/paas_backend/static'
if (window.location.host =="localhost:8000") { 
    APIpath = 'http://localhost:5400/API';
    staticPath = 'http://localhost:5400/static';
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
    loggedInCheck();

    // initiate bootstrap / jquery components like tabs, accordions
    // initiate accordion
    // $( "#accordion" ).accordion({
    //     collapsible: true, active: false
    // });

    // // tabs
    // $( "#tabs" ).tabs({
    //     active:0
    // });
    // // tooltips:
    // $('[data-toggle="tooltip"]').tooltip();


});




function topMenu() {
    // navbar navbar-expand-lg navbar-light bg-light
    // sticky menu: https://getbootstrap.com/docs/4.0/components/navbar/#placement
    var menu = `
<nav class="navbar fixed-top navbar-expand-md navMenu">
  <div class="container">
    <a class="navbar-brand" href="#"><img src="assets/Connectree_logo.png" height="70px" width="auto"></a>
  </div>
  <div class="container">
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
      <!-- <span class="navbar-toggler-icon"></span> -->
      <span class="oi oi-menu"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavDropdown">
      <ul class="navbar-nav">
        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-bs-toggle="dropdown" aria-expanded="false">About Us</a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown1">
            <li><a class="dropdown-item" href="#">PKC</a></li>
            <li><a class="dropdown-item" href="#">Our Team</a></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-expanded="false">Partners</a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown2">
            <li><a class="dropdown-item" href="#">Corporate</a></li>
            <li><a class="dropdown-item" href="#">Individuals</a></li>
          </ul>
        </li>
        
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown4" role="button" data-bs-toggle="dropdown" aria-expanded="false">Plant & Adopt</a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown4" id="menu_plantnAdopt">
          <li><a class="dropdown-item" href="mainmap.html">Map</a></li>
          
          </ul>
        </li>

        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-bs-toggle="dropdown" aria-expanded="false">Projects</a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown3">
            <li><a class="dropdown-item" href="projects-aundh.html">Aundh</a></li>
            <li><a class="dropdown-item" href="projects-baner.html">Baner</a></li>
            <li><a class="dropdown-item" href="projects-balewadi.html">Balewadi</a></li>
          </ul>
        </li>
        <li class="nav-item"><a class="nav-link btn btn-secondary greenbg getStarted text-light" href="login.html">Login / Signup</a></li>
      </ul>
    </div>
  </div>

</nav>
<div class="headerOffset"></div>
<div class="gradient1 gradLine_10"></div>
    `;
    $('#topMenu').html(menu);
}

function footer(){
    var footer = `
    <div class="bottomSpace_40">
      <div class="row">
        <div class="col-md-5">
          <img src="assets/Connectree_logo.png" width="100%" height="auto">
        </div>
        <div class="col-md-7 topSpace_60">
          <div class="row">
            <div class="col-md-7">
                <h5>Office Address</h5>
                <p>3rd floor, Placement Cell,<br>
                Savitribai Phule Pune University,<br>
                Ganeshkhind Rd, Ganeshkhind,<br>
                Pune, Maharashtra 411007, India<br>
                Office timings: 9.30 am – 5.30 pm<br>
                <span class="oi oi-phone"></span> 020 2612 6296<br>
                <span class="oi oi-envelope-closed"></span> &#116;&#114;&#101;&#101;&#118;&#101;&#114;&#115;&#101;&#64;&#112;&#107;&#99;&#46;&#111;&#114;&#103;&#46;&#105;&#110;
                </p>
            </div>
            <div class="col-md-5">
                <h5>Connect with us</h5>
                <p>
                <a href="https://twitter.com/clusterpune?lang=en" target="_blank">Twitter</a><br>
                <a href="https://www.linkedin.com/company/pune-knowledge-cluster-pkc/" target="_blank">LinkedIn</a><br>
                <a href="https://www.facebook.com/Pune-Knowledge-Cluster-100289891825015/" target="_blank">Facebook</a><br>
                <a href="https://www.youtube.com/c/PuneKnowledgeCluster" target="_blank">Youtube</a>
                </p>
            </div>
          </div>
          <p>Copyright &#169; 2022 - Pune Knowledge Cluster (PKC) - All rights reserved</p>

        </div>
      </div>
    </div>
    <div class="gradient1 gradLine_20"></div>
    `;
    // email obfuscation using hexcodes : http://www.katpatuka.org/pub/doc/anti-spam.html
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
            // console.log(returndata);
            if(returndata.username) {
                $('#account_info').html(`${returndata.username} - ${returndata.role}`);
                $('#login_logout').html(`Logout`);
                globalLoggedIn = true;
                globalRole = returndata.role;
                globalUser = returndata.username;
                if(['admin','moderator'].includes(returndata.role)) {
                    $('#menu_plantnAdopt').append(`<li><a class="dropdown-item" href="adoptions.html">Adoptions</a></li>`);
                }
                if(['admin','moderator','saplings_admin','saplings_entry'].includes(returndata.role)) {
                    $('#menu_plantnAdopt').append(`
                        <li><a class="dropdown-item" href="sapling_upload.html">Upload Saplings</a></li>
                        <li><a class="dropdown-item" href="observations.html">Observations</a></li>
                    `);
                }

                if(['admin'].includes(returndata.role)) {
                    $('#menu_plantnAdopt').append(`<li><a class="dropdown-item" href="users.html">Manage Users</a></li>`);
                }
            } else {
                // $('#account_info').html(`Guest`);
                globalLoggedIn = false;
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


// URL params
function loadURLParams(URLParams) {
    // URL parameters. from https://stackoverflow.com/a/2405540/4355695
    var query = window.location.search.substring(1).split("&");
    for (var i = 0, max = query.length; i < max; i++)
    {
        if (query[i] === "") // check for trailing & with no param
            continue;
        var param = query[i].split("=");
        URLParams[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
        // this gets stored to global json variable URLParams
    }
}

