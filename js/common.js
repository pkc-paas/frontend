// ###########################################################
// CONSTANTS
const STARTLOCATION = [18.5581,73.7854];
const STARTZOOM = 14;
const APIpath = 'https://server.nikhilvj.co.in/paas_backend';

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
    // tooltips:
    $('[data-toggle="tooltip"]').tooltip();


});




function topMenu() {
    var menu = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="index.html">PAAS</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item">
        <a class="nav-link" href="about_us.html">About Us</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="our_partners.html">Our Partners</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Gallery</a>
      </li>
    </ul>
    <ul class="navbar-nav">
        <li class="nav-item">
        <a class="nav-link" href="">Sign Up</a>
      </li>
        <li class="nav-item">
        <a class="nav-link" href="">Login</a>
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
      <small>Copyright &copy; PKC Adopt-a-Sapling</small>
    </div>
    </footer>`;
    $('#footer').html(footer);
}