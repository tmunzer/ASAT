var Discover = require("./libs/deployment.discover");

var deviceList = {};
var credentials = {
    login: "admin",
    password: "aerohive"
};
var network = "192.168.1.0/24";

var EventEmitter = require('events').EventEmitter;
var discoverMessenger = new EventEmitter();
discoverMessenger.on("update", function(deviceNumber, deviceCount){
    var percent = (deviceNumber / deviceCount) * 100;
    console.log(percent);
    $('.progress-bar').css('width', percent.toFixed(1)+'%').attr('aria-valuenow', percent.toFixed(1)).text(deviceNumber + "/" + deviceCount);
}).on('stop', function(){
    $('.progress-bar').addClass("progress-bar-danger");

});
/* ===================================================
 ============= Deployment locate Devices =============
 =================================================== */

function displayDeployment() {
    // change the breadcrumb status
    $(".deployment-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#deployment-find").removeClass("fa-circle-o").addClass("fa-circle");
    // create HTML
    document.getElementById("deployment-window").innerHTML =
        '<div class="form-group">' +
        '<label for="network">Network:</label>' +
        '<input type="text" value="' + network +'" id="network"/>' +
        '<label for="password">Password:</label>' +
        '<input type="password" value="' + credentials.password + '" id="password"/>' +
        "<hr>" +
        '<div style="width:100%;">' +
        "<div id='progress-bar' class='progress deployment'>" +
        "<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<hr>" +
        "<button id='find-start' onclick='startDiscovery()' class='btn btn-default update'>Start</button>" +
        "<button id='find-stop' onclick='stopDiscovery()' class='btn btn-default update' disabled='disabled'>Stop</button>" +
        "<button id='find-clear' onclick='clearDiscovery()' class='btn btn-default update'>Clear</button>" +
        "<table class='table table-condensed'>" +
        "<thead>" +
        "<tr>" +
        "<th></th>" +
        "<th>Type</th>" +
        "<th>IP Address</th>" +
        "<th>Serial Number</th>" +
        "<th>MAC Address</th>" +
        "<th>Comment</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody></tbody id='table-deployment'>" +
        "</table>";
    document.getElementById("deployment-action").innerHTML = "";
}

function startDiscovery(){
    $("#find-start").prop("disabled", true);
    $("#find-stop").prop("disabled", false);
    $("#find-clear").prop("disabled", true);
    var cidr = $('#network').val();
    console.log(cidr);
    Discover.discover(cidr, credentials, 10, asatConsole, discoverMessenger, function(){
        console.log("done");
    });
}
function stopDiscovery(){
    $("#find-start").prop("disabled", false);
    $("#find-stop").prop("disabled", true);
    $("#find-clear").prop("disabled", false);
    discoverMessenger.emit("stop");
}
function clearDiscovery(){
}