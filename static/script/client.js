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

// Does n
$("#submidt").click(function () {
    $.ajax({
        url: "/authenticate",
        type: "POST",
        dataType: "JSON",
        data: {username: $("#username").val() },
        success: function (data) {
            console.log("Data returned from server: ", data);
            if (data['status'] == "success") {
                // redirect
                window.location.replace("/landing");
            } else {
                // show error message
                $("#errorMsg").html(data['msg']);
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("body").text(jqXHR.statusText);
        }
    });

});