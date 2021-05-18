'use strict';
var userName = document.getElementById('user-name').textContent;



    $("#submit").click(function () {
        $.ajax({
            url: "/landing",
            type: "POST",
            dataType: "JSON",
            data: { userName: $("#user-name").val() },
            success: function (data) {
                //console.log("Data returned from server: ", data);
                if (data['status'] == "success") {
                    // redirect
                    window.location.assign("landing.html");
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
