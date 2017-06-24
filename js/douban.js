window.onhashchange = locationHashChanged;
locationHashChanged();
var ofoHtml = document.getElementById("ofoScript").innerHTML;

function locationHashChanged(){
    var urlApi = location.hash.slice(1)||"https://book.douban.com/";
    var subjectIndex = urlApi.indexOf("/subject/");
    showLoading();

    ajax("//charon-node.herokuapp.com/api?api="+urlApi,function(string){
        if(string.length<1000){
            return;
        }
        //    var dom = HTMLParser(string);
        var bodySting =string.slice(string.indexOf("<head>"),string.indexOf("</html>"));
//         console.log(bodySting);
        var c = document.querySelector("html");
        c.innerHTML = bodySting;

        try{
            document.getElementById("db-global-nav").innerHTML="";
            document.querySelector(".nav-secondary").innerHTML="";
            document.querySelector("#footer").innerHTML="";
            document.querySelector(".aside ul").innerHTML="";
        }catch(e){
            
        }

    //     var elements = c.querySelectorAll(".title> a:first-of-type");
    //     for (i = 0; i < 10; ++i) {
    //       window.open(elements[i].href,'_newtab'+i);
    //     }
        var div  = document.createElement("div");
        document.body.appendChild(div);
        div.innerHTML = ofoHtml;
        try{
            if(subjectIndex>0){
                var addForm = document.getElementById("addForm");
                var name=document.querySelector("#wrapper h1").innerText;
                var imgHTML = document.querySelector("#mainpic a").innerHTML;
                addForm.querySelector("label").innerHTML = '<em>'+name+'</em>'+imgHTML;
                addForm.url.value = urlApi;
                addForm.submitButton.disabled = false;
            }

        }catch(e){

        }
        
        var as = document.querySelectorAll("[href]");
        for(var i=0;i<as.length;i++){
            as[i].href = "#"+as[i].href;
            as[i].target="";
        }
        var searchForm = document.querySelector("#db-nav-book form");
        searchForm.onsubmit = function(e){
            location.hash = "#"+this.action+"?"+objectToSerialize(formToObject(this));
            return false;
        }
        string = bodySting = c = div  = imgHTML = imgHTML = name = addForm = as = searchForm = null;
    },function(){
//         setTimeout(1000,locationHashChanged());
    });
//     urlApi = subjectIndex = null;
    
};

function add(formElement,e){

    
    var submitButton = formElement.querySelector("button[type=submit]");
    submitButton.disabled="disabled";

    var data = doubanUrlToObject(formElement);
    
    var book = {
        "search":JSON.stringify(data),
        "description":data.title,
        "address":data.publisher,
        "username":"douban",
        "time":0-new Date().getTime(),
        "users":{}
    }






    var uri = formElement.action,
        fn = function(data){
            console.log(data);
            
            submitButton.innerHTML = "已要，快递中"



        },
        error = function(){
          submitButton.disabled="";
        },
        method = formElement.method;


    var me = JSON.parse(localStorage.getItem("me"));
    if(!me){

        ajax(uri,function(data){
            localStorage.setItem("reserveBookId", data.$id);
            location = "me.html";
        },error,method,JSON.stringify(book));
        return false;
    }
    me["time"] = 0-new Date().getTime();
    me.status = "fa-hourglass-start";

    book["users"][book.time] = me;

    ajax(uri,fn,error,method,JSON.stringify(book));




    function doubanUrlToObject(formElement){
        var index = formElement.url.value.indexOf("/subject/")+9;
        var sliceString = formElement.url.value.slice(index);
        var id = sliceString.slice(0,sliceString.indexOf("/"));
        var object = {};
        ajax("//charon-node.herokuapp.com/cross?api=https://api.douban.com/v2/book/"+id,function(data){
            object = JSON.parse(data);
        },error,null,null,false);
        return object;
    }
    me = book = data = null;
    return false;
}

function showLoading(){
    var loadingD = document.getElementById("loading");
    if(loadingD){
        loadingD.style.display="initial";
    }
    loadingD = null;
}
function objectToSerialize(obj){
    var str = "";
    for (var key in obj) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + encodeURIComponent(obj[key]);
    }
    return str;
}
function formToObject(form) {
    var formData = new FormData(form),
        result = {};

    for (var entry of formData.entries())
    {
        result[entry[0]] = entry[1];
    }
    return result;
}

// function ajax(uri,fn,error,method,data,sync){
//     if(sync === undefined){
//         sync = true;
//     }
//     var request = new XMLHttpRequest();
//     request.open(method||"GET", uri,sync);
//     try{
//       request.send(data||null);
//     }catch(e){
//         error();
//     }
//     request.onload = function(e) {
//         if (this.status == 200) {
//           fn(this.response,error);
//         }
//     };
//     request.onerror = error;
// }
function ajax(url,success,error,method,data,sync) {
    if(sync===undefined){
        sync = true;
    }
    http_request = false;

    if (window.XMLHttpRequest) { // Mozilla, Safari,...
        http_request = new XMLHttpRequest();
        if (http_request.overrideMimeType) {
            http_request.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) { // IE
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
    }

    if (!http_request) {
        error();
//         alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    http_request.onreadystatechange = function () {

        if (http_request.readyState == 4) {
            if (http_request.status == 200) {
                success(http_request.responseText);
                 
            } else {

                error();
//                 alert('There was a problem with the request.');
            }
        }

    };
    http_request.open(method||'GET', url, sync);
    http_request.send(data||null);

}