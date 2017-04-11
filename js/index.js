var me = JSON.parse(localStorage.getItem("me"));
if(me){
    var linkToList = document.getElementById("linkToList");
    linkToList.href="list.html";
    var youDocs = document.getElementsByClassName("you");
    for(var i =0;i<youDocs.length;i++){
        var youDoc = youDocs[i];
        youDoc.innerText = me.name;
    }
}

