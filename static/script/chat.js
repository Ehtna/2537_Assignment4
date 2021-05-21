'use strict';

$(document).ready(function () {

    // Finds the font menu
    var fontMenu = document.getElementById("fontSelection");
    // Sets initial selection for font
    var fontChoice = "font0";
    // When dropdown menu changes updates the selection
    fontMenu.addEventListener('change', () => {
        fontChoice = "font" + fontMenu.selectedIndex;
    })

    // Finds the color menu
    var colorMenu = document.getElementById("colorSelection");
    // Sets initial selection for font
    var colorChoice = "color0";
    // When dropdown menu changes updates the selection
    colorMenu.addEventListener('change', () => {
        colorChoice = "color" + colorMenu.selectedIndex;
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
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("ERROR:", jqXHR, textStatus, errorThrown);
            }
        });
    }

    function getChatHistory() {
        $.ajax({
            url: "/getChatHistory",
            dataType: "json",
            type: "GET",
            data: { format: "userName" },
            success: function (data) {
                for (let i = 0; i < data.rows.length; i++){
                    let chat = data.rows[i];
                    $("#chat_content").append(chat.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("ERROR:", jqXHR, textStatus, errorThrown);
            }
        });
    }
    getUserName();
    getChatHistory();

    let socket = io.connect('/');

    socket.on('user_joined', function (data) {
        let beginTag = "<p>";
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
        // Gets used for other users
        let beginTag = "<p class ='" + data.font + " " + data.color + "'>";
        if (me == data.user) {
            // Used for connected user
            beginTag = "<p class ='" + fontChoice + " " + colorChoice + "'>";
        }
        if (data.event) {
            // Server messages
            $("#chat_content").append("<p style='color: orange;'>" + data.event + "</p>");
        }
        // Part that actually appends the message to the page
        $("#chat_content").append(beginTag + data.user + " said: " + data.text + "</p>");

    });


    $("#send").click(function () {

        let name = userName;
        let text = $("#msg").val();

        if (text == null || text === "") {
            $("#msg").fadeOut(50).fadeIn(50).fadeOut(50).fadeIn(50);
            return;
        }
        socket.emit('chatting', { "name": name, message: text, font: fontChoice, color: colorChoice });
        $("#msg").val("");
    });

});