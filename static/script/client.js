'use strict';

$(document).ready(function() {
    // Querries server for /login and redirects
    $("#submit").click(function() {

        var user = document.getElementById("user-name").value;
        console.log(user);
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