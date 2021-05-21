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
    // User name for current user
    let userName = "";
    // Gets user name from session and stores as userName
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
    // Populates chatlog with previous chat history
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
    // Called at page load
    getUserName();
    getChatHistory();

    // Socket.io
    let socket = io.connect('/');
    // When new user joins post message
    socket.on('user_joined', function (data) {
        // Start of the string for new users joining, add classes to style join messages
        let beginTag = "<p class='color0'>";
        // Number of users connected
        let numOfUsers = data.numOfUsers;
        // Strings to differentiate multiple or singular user
        let userStr = "";
        if (numOfUsers == 1) {
            userStr = "combatant";
        } else {
            userStr = "combatants";
        }
        // The actual join messages
        if (numOfUsers < 2) {
            $("#chat_content").append(beginTag + "You stand alone in the arena.</p>");

        } else {
            $("#chat_content").append(beginTag + data.user
                + " connected. There are " + numOfUsers + " " + userStr + " currently in the arena.</p>");
        }
    });
    // When user leaves post message
    socket.on('user_left', function (data) {
        // Start of the string for users leaving, add classes to style join messages
        let beginTag = "<p class='color0'>";
        // Number of users connected
        let numOfUsers = data.numOfUsers;
        // Strings to differentiate multiple or singular user
        let userStr = "";
        if (numOfUsers == 1) {
            userStr = "combatant";
        } else {
            userStr = "combatants";
        }
        // The actual disconnect messages
        if (numOfUsers < 2) {
            $("#chat_content").append(beginTag + data.user + " has fled from combat. You stand alone triumphantly. It's lonely at the top.</p>");
        } else {
            $("#chat_content").append(beginTag + data.user
                + " has fled from combat. " + numOfUsers + " " + userStr + " remain with you in the arena.</p>");

        }

    });
    // Posts messages
    socket.on('chatting', function (data) {
        // Sets userName for current user
        let me = userName;
        // This is the beginTag for all users other than the current connected user
        let beginTag = "<p class ='" + data.font + " " + data.color + "'>";
        if (me == data.user) {
            // beginTag is changed for current user
            beginTag = "<p class ='" + fontChoice + " " + colorChoice + "'>";
        }
        if (data.event) {
            // Server messages
            $("#chat_content").append("<p style='color: orange;'>" + data.event + "</p>");
        }
        // Part that actually appends the message to the page
        $("#chat_content").append(beginTag + data.user + " said: " + data.text + "</p>");
    });

    // When send button is hit the message in the chat box is sent to the server
    $("#send").click(function () {
        // Name of the user hitting send
        let name = userName;
        // Their message
        let text = $("#msg").val();
        // If the message is null the textbox quickly fades in and out, no message sent.
        if (text == null || text === "") {
            $("#msg").fadeOut(50).fadeIn(50).fadeOut(50).fadeIn(50);
            return;
        }
        // Sends message to server
        socket.emit('chatting', { "name": name, message: text, font: fontChoice, color: colorChoice });
        // Clears message box after sending message
        $("#msg").val("");
    });

});