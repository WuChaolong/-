
function loaded(){
    var formElement = document.querySelector("form");
    formElement.address.onfocus=function(e){
        if(!this.value){
          geoFindMe(this,formElement.geo);
//           document.getElementById("allowReceipt").checked = true;

        }
    }
    formElement.address.onchange = function(e){
//         formElement.allow;
//         document.getElementById("allowmail").checked = true;
    }
    formElement.description.onkeypress=function(e){
      
        if(e.which == 13) {
          formElement.address.focus();
        }
    }
    formElement.description.oninput=function(e){

//         var regexp = /\s*,|;|\.|，|；|。\s*/;
        
        var regexp = /\s|,|;|\.|，|；|。/;
        var valueArr = this.value.split(regexp);
        if(valueArr.length===2&&valueArr[1]===""){
          showBookList(this);
        }
    }
    formElement.description.onchange=function(e){
        var bookList = document.getElementById("bookList");
        if(this.value&&!bookList.innerHTML&&!document.getElementById("forBookList").classList.contains("ng-scope")){
            showBookList(this);
        }
    }
    formElement.onsubmit=function(e){
        var submitButton = formElement.querySelector("button[type=submit]");
        submitButton.disabled="disabled";
        e.preventDefault();

        var request = new XMLHttpRequest();
        request.open(formElement.method, formElement.action);
        var book = formToObject(formElement);
        book["time"]=0-new Date().getTime();
        try{
            request.send(JSON.stringify(book));
        }catch(e){
            submitButton.disabled="";
        }

        request.onload = function(e) {
            if (this.status == 200) {
              console.log(this.response);
              if(window.parent.showBookmark){
                window.parent.showBookmark("#get");
                location.reload();
              }else{
                window.goBack();
              }
            }
        };
        request.onerror = function(e){
          submitButton.disabled="";
        }
        
        var me = JSON.stringify({
            "address":book.address,
            "username":book.username,
            "tel":book.tel,
            "geo":book.geo,
            "time":book.time,
            "allowMeet":book.allowMeet
        });
        localStorage.setItem("me", me);
    }
    try{
      var me = JSON.parse(localStorage.getItem("me"));
    }catch(e){

    }
    if(me){
        var formInitData = {
            "address":me.address,
            "username":me.username,
            "tel":me.tel,
            "geo":me.geo,
            "allowMeet":me.allowMeet
        }
        setFormValue(formElement,formInitData)
    }
}
function showBookList(textarea){
    document.getElementById("forBookList").classList.add("ng-scope");
    var q = getQ(textarea.value);
    var uri = "//charon-node.herokuapp.com/cross?api=https://api.douban.com/v2/book/search?q="+q;
    get(uri,function(data){
//         console.log(data);
        try{
            var books= JSON.parse(data).books;
            if(books){
              var bookList = document.getElementById("bookList");
              var html = '<legend>是这书吗？<i class="fa fa-search">douban</i><span id="bookListGoodFa"></span></legend><div>';
              for(var i=0;i<books.length;i++){
                var book = books[i];
                var value = JSON.stringify(book);
                var checked = i===0?"checked":"";
                html= html+ '<label for="coding'+i
                      +'"><input type="radio" id="coding'+i
                      +'" name="search" value=\''+escape(value)+'\''+checked+' onchange="good(\'bookListGoodFa\',\'show\')"><img src="'+book.image
                      +'"/><a href="'+book.alt+'" target="_blank"><span class="fa fa-link">'+book.title
                      +'</span></a></label>';
              }
              html = html +'</div>';
              bookList.innerHTML=html;
              bookList.style.display="block";

            }
        }catch(e){

        }
        document.getElementById("forBookList").classList.remove("ng-scope");
    });
}
function getQ(string){
    return string.split(/\s|,|;|\.|，|；|。/)[0];
}
function geoFindMe(input,geoHidden) {

  if (!navigator.geolocation){
    return;
  }
  
  document.getElementById("forGeo").classList.add("ng-scope");

  navigator.geolocation.getCurrentPosition(success, error);


  function success(position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
//     alert(JSON.stringify(position.coords)+!latitude||!longitude);
    console.log('<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>');
    
    if(!latitude||!longitude||latitude=="5e-324"||longitude=="5e-324"){
      error();
      return;
    }
    geoHidden.value = latitude+","+longitude;
    addressByItude(latitude,longitude);
    searchAddressByItude(latitude,longitude);
    mapByItude(latitude,longitude);
  }

  function mapByItude(latitude,longitude){
      var staticmapUrl = "maps.googleapis.com/maps/api/staticmap?language=zh-CN&center="
          +latitude+","+longitude+"&zoom=15&size=800x800&key=AIzaSyCwEybOPnluZ2OST9DM2u6TQLSJSA1l6lI";
      staticmapUrl = "//images.weserv.nl/?url="+escape(staticmapUrl);
      document.getElementById("mapImg").src = staticmapUrl;
      document.getElementById("map").style.display = "block";

  }

  function error() {
      console.log("getCurrentPosition error");
      document.getElementById("forGeo").classList.remove("ng-scope");
  }
  function addressByItude(latitude,longitude){
    var uri = "//charon-node.herokuapp.com/cross?api=https://maps.googleapis.com/maps/api/geocode/json?language=zh-CN&latlng="
        +latitude+","+longitude+"&key=AIzaSyAU-cH7LlZPJKoL1m8lUXH3EsVZjnqZRq0";
    get(uri,function(data){
//         console.log(data);
        try{
            var addresss = JSON.parse(data);
            var address = addressByResult(addresss.results[0]);
            if(address&&!input.value){
                document.getElementById("addressFormatted").innerHTML = address;
                document.getElementById("allowmail").checked = true;
            }
          
        }catch(e){

        }

           document.getElementById("forGeo").classList.remove("ng-scope");
    });

  }
  function searchAddressByItude(latitude,longitude){
    var uri  = "//charon-node.herokuapp.com/cross?api=https://maps.googleapis.com/maps/api/place/nearbysearch/json?types=lodging|bank|school|bus_station|cafe|book_store|library&language=zh-CN&location="
        +latitude+","+longitude+"&radius=500&key=AIzaSyAU-cH7LlZPJKoL1m8lUXH3EsVZjnqZRq0";

    get(uri,function(data){
//         console.log(data);
        try{
            var addresss = JSON.parse(data);
            var address0 = addressBySearchResult(addresss.results[0]);
//             if(address0){
//                 input.value = address0;
//             }
            
            var addressListD = document.getElementById("addressList");
            var innerHTML = "";
            console.log(addresss.results[0]);
            input.value = addresss.results[0].name;;
//             addresss.results = JSON.parse(addresss.result);
            for(var i = 0; i<addresss.results.length;i++){
                var address = addresss.results[i];
                var value = address.vicinity+address.name;
                innerHTML+='<option value="'+address.name+'">';
            }
            addressListD.innerHTML = innerHTML+addressListD.innerHTML;
        }catch(e){

        }

    });

  }
}

function addressBySearchResult(result){
    var address = ""; 
    address = result.vicinity+result.name
    return address;
}
function addressByResult(result){
    var address = ""; 
    var components = result.address_components;
    for(var i=0;i<components.length;i++){
        var c = components[i];
        var types = c.types;
        if(c.long_name == "Unnamed Road"){
            continue;
        }
        address = c.long_name+address;
        var b = types.indexOf("locality")>=0
            ||types.indexOf("administrative_area_level_1")>=0
            ||types.indexOf("country")>=0;
        if(b){
            break;
        }
    }
    return address;
}
function get(uri,fn){
    var request = new XMLHttpRequest();
    request.open("GET", uri);
    try{
      request.send();
    }catch(e){
    }
    request.onload = function(e) {
        if (this.status == 200) {
          fn(this.response);
        }
    };
}



function setFormValue(form,object){
    for(var key in object){
      if(!form[key]){
        continue;
      }
      if(form[key].type=="checkbox"){
        form[key].checked=true;
        continue;
      }
      form[key].value = object[key];

    }
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


function goBack(e){
    var defaultLocation = "index.html";
    var oldHash = window.location.hash;

    history.back(); // Try to go back

    var newHash = window.location.hash;

    /* If the previous page hasn't been loaded in a given time (in this case
    * 1000ms) the user is redirected to the default location given above.
    * This enables you to redirect the user to another page.
    *
    * However, you should check whether there was a referrer to the current
    * site. This is a good indicator for a previous entry in the history
    * session.
    *
    * Also you should check whether the old location differs only in the hash,
    * e.g. /index.html#top --> /index.html# shouldn't redirect to the default
    * location.
    */

    if(
        newHash === oldHash &&
        (typeof(document.referrer) !== "string" || document.referrer  === "")
    ){
        window.setTimeout(function(){
            // redirect to default location
            window.location.href = defaultLocation;
        },1000); // set timeout in ms
    }
    if(e){
        if(e.preventDefault)
            e.preventDefault();
        if(e.preventPropagation)
            e.preventPropagation();
    }
    return false; // stop event propagation and browser default event
}

function good(elem,action){
  elem = typeof elem === 'string' ? document.getElementById(elem) : elem;
  if(action=="show"){
    elem.innerHTML="<i class='good'>♥</i>";
  }else{
    elem.innerHTML="";
  }

}
function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}