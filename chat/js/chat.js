$(function() {
  // Get a reference to the root of the chat data.
  var messagesRef = new Firebase("https://book-2724e.firebaseio.com/sante/chat");

  // When the user presses enter on the message input, write the message to firebase.
  $("#form").submit(function (e) {
    e.preventDefault();
    var name = $("#nameInput").val();
    var text = $("#messageInput").val();
    messagesRef.push({name:name, text:text});
    $("#messageInput").val("");
  });

  // Add a callback that is triggered for each chat message.
  messagesRef.on("child_added", function (snapshot) {
    var message = snapshot.val();
    $("<p/>").text(message.text).append($("<em/>")
      .text(message.name)).appendTo($("#messagesDiv"));
    $("#messagesDiv")[0].scrollTop = $("#messagesDiv")[0].scrollHeight;
  });
  try{
    var me = JSON.parse(localStorage.getItem("me"));
  }catch(e){}
  if(me){
      $("#nameInput").val(me.username);
  }
});
