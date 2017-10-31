var app = {
  init: function() {},
  friends: []
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: "http://127.0.0.1:5421/classes/messages",
    type: "POST",
    data: JSON.stringify(message),
    contentType: "application/json",
    success: function(data) {
      console.log("chatterbox: Message sent");
      console.log(data);
    },
    error: function(data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error("chatterbox: Failed to send message", data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    // url: "http://parse.hrr.hackreactor.com/chatterbox/classes/messages",
    url: "http://127.0.0.1:5421/classes/messages",
    type: "GET",
    contentType: "application/json",
    //REQUEST FROM NEWEST
    success: function(data) {
      console.log("fetch request", data);
      var roomNames = [];
      var userNames = [];
      for (var messages in data.results) {
        // debugger;
        app.renderMessage(messages);
        // if condition
        if (roomNames.indexOf(messages.roomname) === -1) {
          app.renderRoom(messages.roomname);
        }
        if (userNames.indexOf(messages.username) === -1) {
          app.renderUsers(messages.username);
        }
        userNames.push(messages.username);
        roomNames.push(messages.roomname);
      }
    },
    error: function(data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error("chatterbox: Failed to send message", data);
    }
  });
};

app.clearMessages = function() {
  var messages = Array.from($("#chats").children());

  for (vals of messages) {
    vals.remove();
  }
};

app.renderUsers = function(username) {
  if (username !== undefined) {
    username = removeTags(username);
  }
  $("#All-User__Sidebar").append(`<p id = '${username}'>${username}</p>`);
};

app.renderMessage = function(message) {
  var { username, text, roomname } = message;
  if (username === undefined || roomname === undefined || text === undefined) {
    console.log('no message');
  } else {
    if (username !== undefined) {
      username = removeTags(username);
    }
    if (roomname !== undefined) {
      roomname = removeTags(roomname);
    }
    if (text !== undefined) {
      text = removeTags(text);
    }

    $("#chats").append(
      `<div class='message ${roomname} ${username}'>${username}: ${text}</div>`
    );
  }
};

app.renderRoom = function(roomname) {
  if (roomname !== undefined) {
    roomname = removeTags(roomname);
    var element = $(`<button class='${roomname}'>${roomname}</button>`);
    $("#roomSelect").append(element);
  }
};

app.handleUsernameClick = function(username) {};

app.handleSubmit = function() {
  var url = window.location.href;
  var username = url.split("=")[1];
  var message = {
    username: username,
    text: $("#sendMessage").val(),
    roomname: $("#chats").attr("class")
  };
  app.send(message);
};

app.addFriends = function(friend) {
  if (app.friends.indexOf(friend.text()) === -1) {
    $('#Friends__Sidebar').append(friend);
    app.friends.push(friend.text());
  }
};

$(document).ready(function() {
  $("#roomSelect").on("click", "button", function() {
    var room = $(this).attr("class");
    $(".message").hide();
    $(`.${room}`).show();
    $("#chats").attr("class", "").attr("class", `${room}`);
  });

  $(".homeRoom").on("click", function() {
    $(".message").show();
  });

  $("#createRoom").on("click", function() {
    var roomName = $("#roomName").val();
    app.renderRoom(roomName);
  });

  $("#sendMessageButton").on("click", function() {
    app.handleSubmit();
  });

  $("#All-User__Sidebar").on('click', 'p', function () {
    var friend = $(this).attr('id');
    $(this).toggleClass('bolded');
    $(document).find(`.${friend}`).toggleClass('friend');
    var userCopy = $(this).clone();
    app.addFriends(userCopy);
  });

  app.fetch();
});

var tagBody = "(?:[^\"'>]|\"[^\"]*\"|'[^']*')*";

var tagOrComment = new RegExp(
  "<(?:" +
    // Comment body.
    "!--(?:(?:-*[^->])*--+|-?)" +
    // Special "raw text" elements whose content should be elided.
    "|script\\b" +
    tagBody +
    ">[\\s\\S]*?</script\\s*" +
    "|style\\b" +
    tagBody +
    ">[\\s\\S]*?</style\\s*" +
    // Regular name
    "|/?[a-z]" +
    tagBody +
    ")>",
  "gi"
);

var removeTags = function(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, "");
  } while (html !== oldHtml);
  return html.replace(/</g, "&lt;");
};
