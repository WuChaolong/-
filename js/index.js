function loadMe(){
    var me = JSON.parse(localStorage.getItem("me"));
    if(me){
        var linkToList = document.getElementById("linkToList");
        linkToList.href="list.html";
        var youDocs = document.getElementsByClassName("you");
        for(var i =0;i<youDocs.length;i++){
            var youDoc = youDocs[i];
            youDoc.innerText = me.username;
            if(youDoc.href){
                youDoc.removeAttribute("href");
            }
        }
    }  
}

function gotChatData(data) {
    var o = getO(data);
    if(o==null){
        return;
    }
    document.getElementById("chatFrist").innerHTML=
        '<a href="chat/" class="link-chat fa fa-commenting-o"></a>'
            +'<span id="chatFristText"></span>'
            +'<span class="name" id="chatFristName"></span>';
    document.getElementById("chatFristText").innerText=o.text;
    document.getElementById("chatFristName").innerText=o.name;
}
function gotBookData(data){
    var book = getO(data);
    if(book==null){
        return;
    }

    var newBookD  = document.getElementById("newBook");
    newBookD.style.display="inline-block";
    newBookD.innerHTML = book.description.slice(0,4);
    newBookD.title = book.description;
}
function getO(data){
    var o = null;
    for(var key in data){
        o = data[key];
    }
    return o;
}


