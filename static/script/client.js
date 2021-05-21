'use strict';

$(document).ready(function() {
    // Querries server for /login and redirects when user hits submit
    $("#submit").click(function() {

        var user = document.getElementById("user-name").value;
        // We should properly validate and give an error message for null username
        // sets blank user to "blank" for now
        if (user == "" || user == null){
            user = "\"blank\"";
        }
        var userJSON = {
            userName: user
        };
        $.ajax({
            url: "/login",
            datatype: "json",
            type: "POST",
            data: userJSON,
            success: function (data) {
                console.log(data);
                window.location.assign("html/landing.html");
            },
            error: function (errorThrown) {
                console.log(errorThrown);
            }
        })

    });

});