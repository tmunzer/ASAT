var db = require("./libs/sqlite.main");
var testList = [];


function displayFirewallTest() {
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-type").removeClass("fa-circle-o").addClass("fa-circle");
    // create HTML
    document.getElementById("firewall-test").innerHTML =
        '<div class="list-group">' +
        '<a href="#" class="list-group-item" id="firewall-from-devices" onclick="displayFirewallService(\'device\')">' +
        '<h4 class="list-group-item-heading">Test Aerohive Devices Connection<i id="firewall-from-devices-check" style="float:right"></i></h4>' +
        '<p class="list-group-item-text">Test ports used by Aerohive Devices to contact Aerohive Online Services</p>' +
        '</a>' +
        '<a href="#" class="list-group-item" id="firewall-from-hivemanager" onclick="displayFirewallService(\'hivemanager\')">' +
        '<h4 class="list-group-item-heading">Test HiveManager OnPremise Connection<i id="firewall-from-hivemanager-check" style="float:right"></i></h4>' +
        '<p class="list-group-item-text">Test ports used by Aerohive HiveManager to contact Aerohive Online Services</p>' +
        '</a>' +
        '</div>';
    document.getElementById("firewall-action").innerHTML = "";
}


function displayFirewallServiceHTML(res, type) {
    // create HTML
    var htmlString = '<div class="list-group">';
    var entry;
    for (var i in res) {
        entry = res[i];
        htmlString +=
            '<a href="#" class="list-group-item" ' +
            'id="firewall-entry-' + entry.getEntry().ENTRY_ID + '" ' +
            'data-entry-id="' + entry.getEntry().ENTRY_ID + '" ' +
            'onclick="buttonFirewall(\'firewall-entry-' + entry.getEntry().ENTRY_ID + '\', \'firewall-entry-\', false);  return false;">' +
            '<h4 class="list-group-item-heading">' +
            entry.getEntry().ENTRY_NAME +
            '<i id="firewall-entry-' + entry.getEntry().ENTRY_ID + '-check" style="float:right"></i>' +
            '</h4>' +
            '<p class="list-group-item-text">...</p>' +
            '</a>';
    }
    htmlString += '</div>';
    document.getElementById("firewall-test").innerHTML = htmlString;
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallTest()" value="Back"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="displayFirewallDestinations(\'' + type + '\')" disabled="disabled" value="Next"/>';
}

function displayFirewallService(type) {
    // clear the test list. It will be populated just below
    testList = [];
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-service").removeClass("fa-circle-o").addClass("fa-circle");
    // if it's a "from device" test
    if (type == "device") {
        // select all the entries (HM6, HMNG, IDM, Redirector, ...) in the DB
        db.Service.getAll(function (err, res) {
            displayFirewallServiceHTML(res, type);
        });
        // if it's a "from HM Onpremise" test
    } else if (type == "hivemanager") {
        // select all the entries (HM6, HMNG, IDM, Redirector, ...) in the DB
        db.HmVersion.getAll(function (err, res) {
            displayFirewallServiceHTML(res, type);
        });
    } else {
        displayFirewallTest();
    }
}

function displayFirewallDestinationsHTML(type) {
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-dest").removeClass("fa-circle-o").addClass("fa-circle");
    var htmlString =
        "<table class='table table-condensed' id='entry-list'>" +
        "<thead>" +
        "<tr>" +
        "<th> Service </th>" +
        "<th> Hostname </th>" +
        "<th> Port </th>" +
        "<th> Protocol </th>" +
        "<th> Test Result </th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>";
    for (var i in testList) {
        for (var j in testList[i]) {
            htmlString +=
                "<tr>" +
                "<td>" + testList[i][j].TEST_NAME + "</td>" +
                "<td>" + testList[i][j].HOST + "</td>" +
                "<td>" + testList[i][j].PORT + "</td>" +
                "<td class='firewall-test-result'>" + testList[i][j].PROTO_NAME + '</td>' +
                "<td class='firewall-test-result' id='firewall-entry-" + testList[i][j].TEST_ID + "'> </td>" +
                "</tr>";
        }
    }

    htmlString += "</tbody></table>";
    document.getElementById("firewall-test").innerHTML = htmlString;
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallService(\'' + type + '\')" value="Back"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="displayFirewallResult(\'' + type + '\')" value="Run Test"/>';
}

function displayFirewallDestinations(type) {
    if (testList.length == 0) {
        // select all the "selected" entries
        var selectedServices = $("a[id^='firewall-entry-'].active");
        var selectedServicesNumber = 0;
        //for each selected entry, get the destinations from the DB
        $(selectedServices).each(function () {
            var entryId = $(this).data("entry-id");
            if (type == "device"){
                db.Device.findByServiceId(entryId, function (err, res) {
                    testList.push(res);
                    selectedServicesNumber++;
                    if (selectedServicesNumber == selectedServices.length) {
                        displayFirewallDestinationsHTML(type);
                    }
                });
            } else if (type == "hivemanager") {
                db.HiveManager.findByHmVersionId(entryId, function (err, res) {
                    testList.push(res);
                    selectedServicesNumber++;
                    if (selectedServicesNumber == selectedServices.length) {
                        displayFirewallDestinationsHTML(type);
                    }
                });
            } else {
                displayFirewallDestinationsHTML(type);
            }

        });
    } else {
        displayFirewallDestinationsHTML(type);
    }
}


function displayFirewallResult(type) {
    // clear the "Test Result column"
    for (var i in testList) {
        for (var j in testList[i]) {
            document.getElementById("firewall-entry-" + testList[i][j].TEST_ID).innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i>';
        }
    }
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-run").removeClass("fa-circle-o").addClass("fa-circle");
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallDestinations(\'' + type + '\')" value="Back"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="displayFirewallResult()" value="Restart Test"/>';
    for (var i in testList) {
        for (var j in testList[i]) {
            if (testList[i][j].PROTO_ID == "2") {
                new UDPTest(testList[i][j].HOST, testList[i][j].PORT, testList[i][j].TEST_ID, asatConsole, function (err) {
                    if (err) document.getElementById("firewall-entry-" + testList[this.i][this.j].TEST_ID).innerHTML = "<i class='fa fa-times-circle' style='color: red'></i>";
                    else document.getElementById("firewall-entry-" + testList[this.i][this.j].TEST_ID).innerHTML = "<i class='fa fa-check-circle' style='color: green'></i>";
                }.bind({i: i, j: j}));
            } else if (testList[i][j].PROTO_ID == "1") {
                new TCPTest(testList[i][j].HOST, testList[i][j].PORT, testList[i][j].TEST_ID, asatConsole, function (had_error) {
                    if (had_error) document.getElementById("firewall-entry-" + testList[this.i][this.j].TEST_ID).innerHTML = "<i class='fa fa-times-circle' style='color: red'></i>";
                    else document.getElementById("firewall-entry-" + testList[this.i][this.j].TEST_ID).innerHTML = "<i class='fa fa-check-circle' style='color: green'></i>";
                }.bind({i: i, j: j}));
            }
        }
    }
}

function buttonFirewall(id, prefix, exclusif) {
    var currentButton = $("#" + id);
    if (currentButton.hasClass("active")) {
        currentButton.removeClass("active");
        $("#" + id + "-check").removeClass("fa fa-check");
        if ($("a[id^='" + prefix + "'].active").length == 0) {
            $("#button-next").prop("disabled", true);
        }
    }
    else {
        if (exclusif == true) {
            $("[id^=" + prefix + "]").removeClass("active").removeClass("fa fa-check");
        }
        currentButton.addClass("active");
        $("#" + id + "-check").addClass("fa fa-check");
        $("#button-next").prop("disabled", false);
    }

}
$('#UDPtest').click(function () {
    asatConsole.log("start UDP Test");
    new UDPTest('rerector.aerohive.com', 12222, asatConsole);
});
