'use strict';

$(document).ready(function () {

    // Finds the dropdown menu
    var dropDown = document.getElementById("fontSelection");
    // Sets initial selection on dropdown menu
    var fontChoice = "timesNew";
    // When dropdown menu changes updates the selection
    dropDown.addEventListener('change', () => {
        let selection = dropDown.selectedIndex + 1;
        switch (selection) {
            case 1:
                fontChoice = "timesNew";
                break;
            case 2:
                fontChoice = "comicSans";
                break;
            case 3:
                fontChoice = "arron";
                break;
            default:
                fontChoice = "timesNew";
                break;
        }
    })

    let userName = "";

    function getUserName() {
        $.ajax({
            url: "/getUserName",
            dataType: "json",
            type: "GET",
            data: { format: "userName" },
            success: function (data) {
                userName = data.user;
                console.log(userName);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("ERROR:", jqXHR, textStatus, errorThrown);
            }
        });
    }
    getUserName();

    let socket = io.connect('/');

    socket.on('user_joined', function (data) {
        let beginTag = "<p style='color: bisque;'>";
        let numOfUsers = data.numOfUsers;
        let userStr = "";
        if (numOfUsers == 1) {
            userStr = "combatant";
        } else {
            userStr = "combatants";
        }
        if (numOfUsers < 2) {

            $("#chat_content").append("<p>You stand alone in the arena.</p>");

        } else {

            $("#chat_content").append(beginTag + data.user
                + " connected. There are " + numOfUsers + " " + userStr + " currently in the arena.</p>");

        }

    });

    socket.on('user_left', function (data) {
        let beginTag = "<p style='color: burlywood;'>";
        let numOfUsers = data.numOfUsers;
        let userStr = "";
        if (numOfUsers == 1) {
            userStr = "combatant";
        } else {
            userStr = "combatants";
        }
        if (numOfUsers < 2) {

            $("#chat_content").append("<p>" + data.user + " has fled from combat. You stand alone triumphantly. It's lonely at the top.</p>");


        } else {

            $("#chat_content").append(beginTag + data.user
                + " has fled from combat. " + numOfUsers + " " + userStr + " remain with you in the arena.</p>");

        }

    });

    // this is from others - not our text
    socket.on('chatting', function (data) {
        //console.log(data);
        let me = userName;
        let beginTag = "<p class ='" + fontChoice + "'>";
        if (me == data.user) {
            beginTag = "<p style='color: darkblue;' class ='" + fontChoice + "'>";
        }
        if (data.event) {
            $("#chat_content").append("<p style='color: orange;'>" + data.event + "</p>");
        }
        $("#chat_content").append(beginTag + data.user + " said: " + data.text + "</p>");

    });


    $("#send").click(function () {

        let name = userName;
        let text = $("#msg").val();

        // check if the name is blank, shouldn't be
        if (name == null || name === "") {
            $("#name").fadeOut(50).fadeIn(50).fadeOut(50).fadeIn(50);
            return;
        }
        if (text == null || text === "") {
            $("#msg").fadeOut(50).fadeIn(50).fadeOut(50).fadeIn(50);
            return;
        }
        socket.emit('chatting', { "name": name, message: text });
        $("#msg").val("");
    });

});