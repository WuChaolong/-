

function load(){
    

    window.onhashchange = locationHashChanged;
    
    var get = document.querySelector('#get');
    var give = document.querySelector('#give');
    var money = document.querySelector('#money');
    var long = document.querySelector('#long');
    var drawer = document.querySelector('#drawer');
    var drawer2 = document.querySelector('#drawer2');
    if(dataSrc(give) && dataSrc(get)
        &&dataSrc(long) && dataSrc(money)
    ){
    }else{
      
      drawer.classList.remove("drawer");
    }
    
    var me = JSON.parse(localStorage.getItem("me"));
    if(me){
       loadMe(me);
    }
    if(location.hash){
        locationHashChanged();
    }else{
        if(me){
            openDetails("#get");
        }else{
            openDetails("#give");
        }
//             openDetails("#get");
    }
    
    function locationHashChanged() {
         showBookmark(location.hash);
    }
    var get =  give = money = long = drawer = drawer2 = null;
}
function dataSrc(details){
  return onOpen(details,function(){
      if(details.hasAttribute("open")){
          location.hash = details.id;
          var detailss = details.parentElement.querySelectorAll("details");
          for(var i = 0;i<detailss.length;i++){
            if(detailss[i]!=details){
              detailss[i].open=false;
            }
          }
          var iframe = details.querySelector('iframe');
          if(!iframe.src){
            iframe.src = iframe.dataset["src"];
            if(iFrameResize){
              iFrameResize({}, iframe);
            }
          }
      }
  })
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
        youDocs = null;
    }  
}
function openDetails(id,idClose){
    if(id){
        document.querySelector(id).open = true;
    }
    if(idClose){
        document.querySelector(idClose).open = false;
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
  oBookmark = null;
}
function onOpen(element,fn){
    try{

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        if(!MutationObserver){
          return false;
        }
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
        observer = MutationObserver = null;
        return true;
    }catch(e){
        return false;
    }
}
function gotChatData(data) {
  try{
    
    var o = getO(data);
    if(o==null){
        return;
    }
    document.getElementById("chatFrist").innerHTML=
        ''
            +'<span id="chatFristText"></span>'
            +'<span class="name" id="chatFristName"></span><a href="chat/" class="link-chat fa fa-commenting-o">群</a>';
    document.getElementById("chatFristText").innerText=o.text;
    document.getElementById("chatFristName").innerText=o.name;
    o = null;
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