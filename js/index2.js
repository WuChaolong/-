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
function getO(data){
    var o = null;
    for(var key in data){
        o = data[key];
    }
    return o;
}

function load(){
    
    if ("onhashchange" in window) {
        console.log("该浏览器支持hashchange事件!");
    }

    function locationHashChanged() {
         showBookmark(location.hash);
    }

    window.onhashchange = locationHashChanged;
    if(location.hash){
        locationHashChanged();
    }else{
        var me = JSON.parse(localStorage.getItem("me"));
        if(me){
            openDetails("#get");
        }else{
            openDetails("#give");
        }
    }

}
function openDetails(id,idClose){
    if(id=="#give"){
        var idClose = "#get";
    }else if(id=="#get"){
        var idClose = "#give";
    }
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

// var showBookmark = (function () {
//   var  _useHash, _scrollX, _scrollY, _nodeX, _nodeY, _itFrame, _scrollId = -1, _bookMark,
//        /*
//        * nDuration: the duration in milliseconds of each frame
//        * nFrames: number of frames for each scroll
//        */
//        nDuration = 200, nFrames = 10;

//   function _next () {
//     if (_itFrame > nFrames) { clearInterval(_scrollId); _scrollId = -1; return; }
//     _isBot = true;
//     document.documentElement.scrollTop = Math.round(_scrollY + (_nodeY - _scrollY) * _itFrame / nFrames);
//     document.documentElement.scrollLeft = Math.round(_scrollX + (_nodeX - _scrollX) * _itFrame / nFrames);
//     if (_useHash && _itFrame === nFrames) { location.hash = _bookMark; }
//     _itFrame++;
//   }

//   function _chkOwner () {
//     if (_isBot) { _isBot = false; return; }
//     if (_scrollId > -1) { clearInterval(_scrollId); _scrollId = -1; }
//   }

//   if (window.addEventListener) { window.addEventListener("scroll", _chkOwner, false); }
//   else if (window.attachEvent) { window.attachEvent("onscroll", _chkOwner); }

//   return function (sBookmark, bUseHash) {
//     _scrollY = document.documentElement.scrollTop;
//     _scrollX = document.documentElement.scrollLeft;
//     _bookMark = sBookmark;
//     _useHash = arguments.length === 1 || bUseHash;
//     for (
//       var nLeft = 0, nTop = 0, oNode = document.querySelector(sBookmark);
//       oNode;
//       nLeft += oNode.offsetLeft, nTop += oNode.offsetTop, oNode = oNode.offsetParent
//     );
//     _nodeX = nLeft, _nodeY = nTop, _itFrame = 1;
//     if (_scrollId === -1) { _scrollId = setInterval(_next, Math.round(nDuration / nFrames)); }
//   };
// })();