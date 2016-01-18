var currentRelease = "0.1.4";
var buildDate = "January 17, 2016";
var platform = "macos";
var githubFileName = "asat-macos.nw";

var https = require('https');
var fs = require('fs');

var htmlString = "";

function displayUpdate() {
    if (htmlString == ""){
        htmlString =
            "<article><h3>Current Release</h3>" +
            "<div id='saveFileId' style='display: none' >" +
            "</div>" +
            "<span>Version </span><span class='badge'>" + currentRelease + "</span>" +
            "<br>" +
            "<span>Platform: " + platform + "</span>" +
            "<br>" +
            "<span>Release Date: " + buildDate + "</span>" +
            "<hr>" +
            "</article>" +
            "<article>" +
            "<div>" +
            "<div id='progress-bar' class='progress'>" +
            "</div>" +
            "<a href='#' id='cancelDl' class='cancelDL-disabled'><i class='fa fa-close'> Cancel</i></a>" +
            "</div>" +
            "<hr>" +
            "</article>" +
            "<article>" +
            "<button id='cuFromGithub' onclick='checkUpdate()' class='btn btn-default'>Check for Update</button>" +
            "<div id='update-list'></div>" +
            "</article>";
        document.getElementById("update").innerHTML = htmlString;
    }
}

function checkUpdate() {
    $("#cuFromGithub").prop('disabled', true);
    document.getElementById('progress-bar').innerHTML =
        "<div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'> " +
        "<span>Getting information from server</span>" +
        "</div>";
    $.getJSON("https://api.github.com/repos/tmunzer/ASAT/releases", function (data) {
        document.getElementById('progress-bar').innerHTML =
            "<div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'> " +
            "<span>Getting information from server: Done!</span>" +
            "</div>";
        var release = data[0];
        htmlString = "";
        if (release.hasOwnProperty('tag_name') && release.tag_name == currentRelease) {
            htmlString = "<h3> You already have the latest release </h3>";
        } else {
            htmlString = "<h3> ASAT " + release.tag_name + " is available " +
                "<button id='dlFromGithub' onclick='downloadUpdate(\"" + release.tag_name + "\")' class='btn btn-default'>" +
                "Download From GitHub <i class='fa fa-github'></i>" +
                "</button><br>" +
                "</h3>";
        }
        htmlString +=
            '<span>Release Date: ' + release.published_at + "</span><br>" +
            '<span>Release Notes:</span><br>' +
            '<div class="release-note">' +
            release.body.toString().replace(/\r\n/g, "<br>") +
            "</div>" +
            "<hr>" +
            "<h4>History</h4>";
        for (var i = 1; i < data.length; i++) {
            release = data[i];
            htmlString +=
                "<span>Version </span><span class='badge'>" + release.tag_name + "</span><br>" +
                '<span>Release Date: ' + release.published_at + '</span><br>' +
                '<span>Release Notes:</span>' +
                '<div class="release-note">' +
                release.body.toString().replace(/\r\n/g, "<br>") +
                '</div>' +
                '<hr class="history">';
        }
        document.getElementById("update-list").innerHTML = htmlString;
    });
    $("#cuFromGithub").prop('disabled', false);
}


function downloadUpdate(tag_name) {
    $('#dlFromGithub').prop('disabled', true);
    $("#cuFromGithub").prop('disabled', true);
    document.getElementById("saveFileId").innerHTML = "<input type='file' nwsaveas='asat.zip' id='saveFileDialog'/>";
    var filename = "";
    var chooser = $("#saveFileDialog");
    chooser.change(function() {
        filename = ($(this).val());
        console.log(filename);
        console.log(tag_name);
        getLocation(filename, tag_name);
    });

    chooser.trigger('click');
}

function getLocation(filanme, tag_name){
    document.getElementById('progress-bar').innerHTML =
        "<div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'> " +
        "<span class='sr-only'></span>" +
        "</div>";
    var data = "";
    var url = 'https://github.com/tmunzer/ASAT/releases/download/'+ tag_name + "/" + githubFileName;
    https.get(url, function (res) {
        console.log(res);
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('error', function(err){
            console.log(err);
        });
        res.on('end', function () {
            var location = data.split('href="')[1].split('">')[0];
            console.log(location);
            getFile(filanme, location);
        });
    });
}


function getFile(filename, url){
    var len = 0;
    var percent = 0;
    var file = fs.createWriteStream(filename);

    var host = url.split('/')[2];
    var path = url.split(host)[1];

    var options = {
        host : host,
        path : path.replace(/&amp;/g, "&"),
        headers: {
            'Referer': "https://github.com/tmunzer/ASAT/releases"
        }
    };
    document.getElementById('progress-bar').innerHTML =
    "<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'>" +
    "0%" +
    "</div>";
    var req = https.get(options, function (res) {
        res.on('data', function (chunk) {
            file.write(chunk);
            len += chunk.length;
            // percentage downloaded is as follows
            percent = (len / res.headers['content-length']) * 100;
            $('.progress-bar').css('width', percent.toFixed(1)+'%').attr('aria-valuenow', percent.toFixed(1)).text(percent.toFixed(0)+'%');
        });
        res.on('error', function(err){
            $('.progress-bar').addClass("progress-bar-danger").text("Error (" + percent.toFixed(0)+'%)');
            asatConsole.error(err);
        });
        res.on('end', function () {
//            console.log("end");
            file.close();
        });
        file.on('close', function () {
            if (percent.toFixed(0) == 100){
                $('.progress-bar').addClass("progress-bar-success").text("Done!");
            }
            $('#cancelDl').removeClass("cancelDL").addClass("cancelDL-disabled").attr("onclick","");
            $('#dlFromGithub').prop('disabled', false);
            $("#cuFromGithub").prop('disabled', false);
            // the file is done downloading
        });
    });
    $('#cancelDl').removeClass("cancelDL-disabled").addClass("cancelDL").on('click', function(){
        req.abort();
        $('.progress-bar').css('width', '100%').addClass("progress-bar-danger").text("Canceled (" + percent.toFixed(0)+'%)');
    });
}

