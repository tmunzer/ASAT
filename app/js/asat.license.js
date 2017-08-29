function displayLicense(){
    document.getElementById("license").innerHTML =
        '<article style="padding-top: 2em;">' +
        '<div>' +
        'This software is distributed under the MIT license:<br>' +
        '<div>' +
        '<div style="padding: 0 5em; float: left">' +
        '<h5>Permitted</h5>' +
        '<ul class="license-permitted nav nav-pills nav-stacked">' +
        '<li data-text="This software and derivatives may be used for commercial purposes." class="commercial-use">' +
        '<i class="fa fa-check-circle" style="color: green"></i>' +
        '<span class="license-sprite"></span>' +
        ' Commercial Use' +
        '</li>' +
        '<li data-text="You may distribute this software." class="distribution">' +
        '<i class="fa fa-check-circle" style="color: green"></i>' +
        '<span class="license-sprite"></span>' +
        ' Distribution' +
        '</li>' +
        '<li data-text="This software may be modified." class="modifications">' +
        '<span class="license-sprite"></span>' +
        '<i class="fa fa-check-circle" style="color: green"></i>' +
        ' Modification' +
        '</li>' +
        '<li data-text="You may use and modify the software without distributing it." class="private-use">' +
        '<span class="license-sprite"></span>' +
        '<i class="fa fa-check-circle" style="color: green"></i>' +
        ' Private Use' +
        '</li>' +
        '<li data-text="You may grant a sublicense to modify and distribute this software to third parties not included in the license." class="sublicense">' +
        '<span class="license-sprite"></span>' +
        '<i class="fa fa-check-circle" style="color: green"></i>' +
        ' Sublicensing' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '<div style="padding: 0 5em; float: left">' +
        '<h5>Forbidden</h5>' +
        '<ul class="license-forbidden nav nav-pills nav-stacked">' +
        '<li title="" data-text="Software is provided without warranty and the software author/license owner cannot be held liable for damages." class="no-liability">' +
        '<span class="license-sprite"></span>' +
        '<i class="fa fa-times-circle" style="color: red"></i>' +
        ' Hold Liable' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="license" style="float: left">' +
        '<span>The MIT License (MIT)</span>' +
        '<br><br>' +
        '<span>Copyright (c) 2016 Thomas Munzer</span>' +
        '<br><br>' +
        '<span>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</span>' +
        '<br><br>' +
        '<span>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</span>' +
        '<br><br>' +
        '<span>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</span>' +
        '</div>' +
        '</article>';

  initTooltips();
}
var ruletypes = {
    permitted: "Permitted",
    forbidden: "Forbidden"
};

initTooltips = function() {

    var ref1 = ruletypes;
    for (var ruletype in ref1) {
        var label = ref1[ruletype];
        $(".license-" + ruletype + " li").each(function () {
            $(this).qtip({
                content: {
                    text: $(this).data('text'),
                    title: label
                },
                position: {
                    my: "right center",
                    at: "left center"
                },
                style: {
                    classes: "qtip-shadow qtip-" + ruletype
                }
            });

        });
    }
    return false;

};