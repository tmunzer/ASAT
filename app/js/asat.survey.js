function initSurvey() {
    document.getElementById("survey").innerHTML =
        '<div class="jumbotron">' +
        '<h1>Not yet available</h1>' +
        '<p>This section is not yet available. <br><br>You can use the Update section to see if there is a new release available</p>' +
        '<p><a class="btn btn-primary btn-lg" href="#" ' +
        'onclick="gui.Shell.openExternal(\'https://github.com/tmunzer/ASAT/releases/latest\')" role="button">' +
        'View On GitHub <i class="fa fa-github"></i></a></p>' +
        '</div>';
}