
function loaded(){
    var formElement = document.querySelector("form");
    formElement.address.onfocus=function(e){
        if(this.value){
            return;
        }
        geoFindMe(this,formElement.geo);
    }
    formElement.description.oninput=function(e){
        var regexp = /\s*,|;|\.|，|；|。\s*/;
        if(e.data&&e.data.match(regexp)&&this.value.split(regexp).length==2){
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
              window.goBack();
            }
        };

        var me = JSON.stringify({
            "address":book.address,
            "username":book.username,
            "tel":book.tel,
            "geo":book.geo
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
            "geo":me.geo
        }
        setFormValue(formElement,formInitData)
    }
}
function showBookList(textarea){
    document.getElementById("forBookList").classList.add("ng-scope");
    var q = getQ(textarea.value);
    var uri = "//charon-node.herokuapp.com/cross?api=https://api.douban.com/v2/book/search?q="+q;
    get(uri,function(data){
        console.log(data);
        try{
            var books= JSON.parse(data).books;
            if(books.length==0){
              return;
            }
            var bookList = document.getElementById("bookList");
            var html = '<legend>是这书吗？<i class="fa fa-search">douban</i></legend><div>';
            for(var i=0;i<books.length;i++){
              var book = books[i];
              var value = JSON.stringify(book);
              var checked = i===0?"":"";
              html= html+ '<input type="radio" id="coding'+i
                    +'" name="search" value=\''+value+'\''+checked+'><label for="coding'+i
                    +'"><img src="'+book.image
                    +'"/><a href="'+book.alt+'" target="_blank"><span class="fa fa-link">'+book.title
                    +'</span></a></label>';
            }
            html = html +'</div>';
            bookList.innerHTML=html;
            bookList.style.display="block";
        }catch(e){

        }
        document.getElementById("forBookList").classList.remove("ng-scope");
    });
}
function getQ(string){
    return string.split(/\s*,|;|\.|，|；|。\s*/)[0];
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
    console.log('<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>');
    geoHidden.value = latitude+","+longitude;
    addressByItude(latitude,longitude);

  }

  function error() {
      console.log("getCurrentPosition error");
      document.getElementById("forGeo").classList.remove("ng-scope");
  }
  function addressByItude(latitude,longitude){
    var uri = "//charon-node.herokuapp.com/cross?api=https://maps.googleapis.com/maps/api/geocode/json?language=zh-CN&latlng="
        +latitude+","+longitude+"&key=AIzaSyAU-cH7LlZPJKoL1m8lUXH3EsVZjnqZRq0";
    get(uri,function(data){
        console.log(data);
        try{
            var addresss = JSON.parse(data);
            var address = addressByResult(addresss.results[0]);
            if(address){
                input.value = address;
            }

        }catch(e){

        }

           document.getElementById("forGeo").classList.remove("ng-scope");
    });
  }
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