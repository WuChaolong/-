

function load(){
    

    window.onhashchange = locationHashChanged;
    
    var get = document.querySelector('#get');
    var give = document.querySelector('#give');
    onOpen(get,function(){
        if(get.hasAttribute("open")){
            give.open=false;
        }
    });
    onOpen(give,function(){
        if(give.hasAttribute("open")){
            get.open=false;
        }
    });
    
    var me = JSON.parse(localStorage.getItem("me"));
    if(me){
       loadMe(me);
    }
    if(location.hash){
        locationHashChanged();
    }else{
//         if(me){
//             openDetails("#get");
//         }else{
//             openDetails("#give");
//         }
            openDetails("#get");
    }
    
    function locationHashChanged() {
         showBookmark(location.hash);
    }
}
function loadMe(me){
    if(me){
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
function openDetails(id,idClose){
    if(id){
        var id = document.querySelector(id);
        id.open = true;
    }
    if(idClose){
        var idClose = document.querySelector(idClose);
        idClose.open = false;
    }
}
function showNode (oNode) {
  var nLeft = 0, nTop = 0;
  for (var oItNode = oNode; oItNode; nLeft += oItNode.offsetLeft, nTop += oItNode.offsetTop, oItNode = oItNode.offsetParent);
     window.scrollTo(nLeft, nTop); 
  
}

function showBookmark (sBookmark, bUseHash) {
  if ( bUseHash) { window.location.hash = sBookmark; return; }
  var oBookmark = document.querySelector(sBookmark);
  if (oBookmark) { 
    showNode(oBookmark);
    openDetails(sBookmark);
  }
}
function onOpen(element,fn){
    try{

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName == "open") {
              fn();
              console.log("attributes changed")
            }
          });
        });

        observer.observe(element, {
          attributes: true //configure it to listen to attribute changes
        });
    }catch(e){
        
    }
}
function gotChatData(data) {
  try{
    
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
  }catch(e){
    
  }
}
function getO(data){
    var o = null;
    for(var key in data){
        o = data[key];
    }
    return o;
}