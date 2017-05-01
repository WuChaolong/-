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

function gotData(data) {
    var o = null;
    for(var key in data){
        o = data[key];
    }
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