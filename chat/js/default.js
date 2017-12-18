function init() {
  var form=document.getElementById("form");
  // Get a reference to the root of the chat data.
  var messagesRef = new Firebase(form.action);
  
  // When the user presses enter on the message input, write the message to firebase.
  form.onsubmit=function (e) {
    e.preventDefault();
    var message = form.messageInput.value;
    messagesRef.push({message:message});
    form.messageInput.value = "";
    return false;
  }

  // Add a callback that is triggered for each chat message.
  messagesRef.on("child_added", function (snapshot) {
    var message = snapshot.val();
    var dd= document.createElement('dd');
        dd.innerHTML= message.message;
    var messagesDiv = document.getElementById("messagesDiv");
    messagesDiv.insertBefore(dd,messagesDiv.firstElementChild.nextElementSibling.nextElementSibling);
    messagesDiv.scrollTop = 0 ;
//      messagesDiv.scrollTop = messagesDiv.scrollHeight;

    var numD = document.getElementById("num");
    var num = parseInt(numD.innerHTML);
    num++;
    numD.innerHTML = num;
  });
}
