
function loaded(){
    var formElement = document.querySelector("form");
    formElement.address.onfocus=function(e){
        if(!this.value){
          geoFindMe(this,formElement.geo);
//           document.getElementById("allowReceipt").checked = true;

        }
    }
    var addressOninput = function(e){
        autocomplete(this);
    }
    formElement.address.oninput = addressOninput;
    formElement.addressFormatted.onfocus=function(e){
        formElement.address.focus();
    }
    formElement.addressFormattedClose.onclick=function(e){
        formElement.addressFormatted.removeAttribute("value");
        formElement.address.value = "";
        mapClose();
        formElement.address.oninput = addressOninput;
        formElement.address.onfocus = function(){};
        formElement.addressFormatted.focus();
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
        if(this.value&&!document.getElementById("forBookList").classList.contains("ng-scope")){
            
            showBookList(this);
        }
    }
    window.addEventListener("touchstart", function(e){
      if(formElement.description = formElement.description.ownerDocument.activeElement){
        if(formElement.description.value&&!document.getElementById("forBookList").classList.contains("ng-scope")){
          showBookList(formElement.description);
        }
      }
    }, false);
    formElement.onsubmit=function(e){
        var submitButton = formElement.querySelector("button[type=submit]");
        submitButton.disabled="disabled";
        e.preventDefault();
        
        var book = formToObject(formElement);
        book["time"]=0-new Date().getTime();
        
        var me = {
            "address":book.address,
            "username":book.username,
            "tel":book.tel,
            "geo":book.geo,
            "time":book.time,
            "allowMeet":book.allowMeet
        };
        
        localStorage.setItem("me",JSON.stringify(me));

        var uri = formElement.action,
            fn = function(){
              if(localStorage.getItem("reserveBookId")){
                  me["time"] = 0-new Date().getTime();
                  me.status = "fa-hourglass-start";
                  var data = JSON.stringify(me),
                      uri = "https://book-2724e.firebaseio.com/sante/books2/"+localStorage.getItem("reserveBookId")+"/users.json",
                      fn2 = function(){
                          localStorage.removeItem("reserveBookId");
                          fn();
                      },
                      error = error,
                      method = "POST";

                  ajax(uri,fn2,error,method,data); 
                  me = data = null; 
              }else{
                
                  submitButton.innerHTML = "已成功";
                  setTimeout(goGet,1000);
                  function goGet(){
                    if(window.parent.load){
                        window.parent.location.hash = "#get";
                        window.parent.load();
                        location.reload();
                    }else{
                      window.goBack();
                    }

                  }
              }
              
              
            },
            error = function(){
              submitButton.disabled="";
            },
            method = formElement.method,
            data = JSON.stringify(book);


        ajax(uri,fn,error,method,data);
        book = null;

    }
    setUserInfo(formElement);
    getAddressByIp(formElement.address);
    me = formInitData = null;


    function setUserInfo(formElement,me){
      try{
        var me = me||JSON.parse(localStorage.getItem("me"));
      }catch(e){

      }
      var edInput = formElement.querySelector('[class="ed-input"]');
      var aEdInput = formElement.querySelector('[class="ed-input"] a');

      if(me){
          var formInitData = {
              "address":me.address,
              "username":me.username,
              "tel":me.tel,
              "geo":me.geo,
              "allowMeet":me.allowMeet
          }
          setFormValue(formElement,formInitData);
          edInput.classList.remove("show");
      }else{
         edInput.classList.add("show");
         aEdInput.onclick = function(){
           formElement.tel.placeholder = "当时留的手机号是什么？";
           formElement.tel.oninput = telInput;
           formElement.tel.focus();
         }
      }
    }

    function telInput(){
      if(this.value.length == 11){

          var forSearchUserInfo = document.getElementById("forSearchUserInfo");
          forSearchUserInfo.classList.add("ng-scope");
          var uri = "https://book-2724e.firebaseio.com/sante/books2.json?orderBy=%22tel%22&limitToLast=1&equalTo="+"%22"+this.value+"%22";
          var error = function(){
            forSearchUserInfo.classList.remove("ng-scope");
          };
          var reserveBookId = localStorage.getItem("reserveBookId");
          var fn = function(data){
            setUserInfo(formElement,data);
            forSearchUserInfo.classList.remove("ng-scope");
          }

          searchUserInfo(uri,reserveBookId,error,fn);
      }
    }
}

function searchUserInfo(uri,reserveBookId,error,fn){
    ajax(uri,function(data,error){
        var book = null;
        try{

            var data = JSON.parse(data);
            for(var key in data){
                book = data[key];
            }
        }catch(e){
            error();
        }
        if(book==null){
            error();
            return;
        }
        var me = {
            "address":book.address,
            "username":book.username,
            "tel":book.tel,
            "geo":book.geo,
            "time":book.time,
            "allowMeet":book.allowMeet
        };
        localStorage.setItem("me", JSON.stringify(me));
//         location = "list.html";
        fn2 = function(){
          localStorage.removeItem("reserveBookId");
          fn(me);
        }
        if(reserveBookId){
            me["time"]=0-new Date().getTime();
            me.status = "fa-hourglass-start";

            var data = JSON.stringify(me),
                uri = "https://book-2724e.firebaseio.com/sante/books2/"+reserveBookId+"/users.json",
                
                error = error,
                method = "POST";

            ajax(uri,fn2,error,method,data);  
        }else{
            fn(me);
        }
        data = book = null;
    },error);
}
function showBookList(description){
//     var q = getQ(description.value);
//     if(window.q == q || q == ""){
//       return;
//     }
//     window.q = q;

     var bookList = document.getElementById("bookList");
     var bookListContent = document.getElementById("bookListContent");

     bookListContent.innerHTML="";


     var qs = getQs(description.value);
     if(!qs){
       error();
     }
     for(var key in qs){
       var q = qs[key];
       if(q == ""){
//           error();
       }else if(window.qs && q in window.qs){
         success(window.qs[q]);
       }else{     
         document.getElementById("forBookList").classList.add("ng-scope");

         addBookList(q,success,error);
       }
     }


     function success(html,q){
          if(q){
            if(window.qs===undefined){
              window.qs = [];
            }
            window.qs[q] = html;
          }
          bookListContent.insertAdjacentHTML('beforeend', html);
          bookList.style.display="block";
          document.getElementById("forBookList").classList.remove("ng-scope");
     }
     function error(){

          
          bookList.style.display="none";
          document.getElementById("forBookList").classList.remove("ng-scope");
     }         
     function addBookList(q,success,error){

      var uri = "//charon-node.herokuapp.com/cross?api=https://api.douban.com/v2/book/search?q="+q;
      ajax(uri,function(data){
  //         console.log(data);
          try{

              var books= JSON.parse(data).books;

              if(books&&books.length){
                var html = '<div>';
                for(var i=0;i<books.length;i++){
                  var book = books[i];
                  var value = JSON.stringify(book);
                  var checked = i===0?"checked":"";
                  html= html+ '<label><input type="radio" id="coding'+q+i
                        +'" name="search['+q+']" value=\''+escape(value)+'\''+checked+'><img src="'+book.image
                        +'"/><a href="'+book.alt+'" target="_blank"><span class="fa fa-link">'+book.title
                        +'</span></a></label>';
                }
                html = html +'</div>';
//                 var bookListTemplate = document.getElementById("bookListTemplate");
//                 var html = template("bookListTemplate"
//                   ,{"books":books}
//                 );
                success(html,q);
              }else{
                error();
              }
              books = null;
          }catch(e){
            error();
          }
      },error);
    }

    
}
function getQ(string){
    return string.split(/\s|,|;|\.|，|；|。/)[0];
}
function getQs(string){
    return string.split(/\s| |,|;|\.|，|；|。/);
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
          +latitude+","+longitude+"&zoom=14&size=800x800&key=AIzaSyCwEybOPnluZ2OST9DM2u6TQLSJSA1l6lI";
      staticmapUrl = "//images.weserv.nl/?url="+escape(staticmapUrl);
      document.getElementById("mapImg").src = staticmapUrl;
      document.getElementById("map").style.display = "block";

  }
  function mapClose(){
      document.getElementById("mapImg").removeAttribute("src");
      document.getElementById("map").style.display = "none";

  }

  function error() {
      console.log("getCurrentPosition error");
      document.getElementById("forGeo").classList.remove("ng-scope");
  }
  function addressByItude(latitude,longitude){
    var uri = "//charon-node.herokuapp.com/cross?api=https://maps.googleapis.com/maps/api/geocode/json?language=zh-CN&latlng="
        +latitude+","+longitude+"&key=AIzaSyAU-cH7LlZPJKoL1m8lUXH3EsVZjnqZRq0";
    ajax(uri,function(data){
//         console.log(data);
        try{
            var addresss = JSON.parse(data);
            var address = addressByResult(addresss.results[0]);
            if(address){
                document.getElementById("addressFormatted").setAttribute("value",address);
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

    ajax(uri,function(data){
//         console.log(data);
        try{
            var addresss = JSON.parse(data);
            var address0 = addressBySearchResult(addresss.results[0]);
            if(address0){
                input.value = address0;
            }
            input.oninput = function(){};
            var addressListD = document.getElementById("addressList");
            var innerHTML = "";
            console.log(addresss.results[0]);
//             input.value = addresss.results[0].name;;
//             addresss.results = JSON.parse(addresss.result);
            for(var i = 0; i<addresss.results.length;i++){
                var address = addresss.results[i];
                var value = address.vicinity+address.name;
                var selected = i === 0?"selected":"";
                innerHTML+='<option value="'+address.name+'" '+selected+'/>';
            }
            if(addressListD.innerHTML != innerHTML){
              addressListD.innerHTML = innerHTML;
            }
            addressListD = addresss = data = null;
        }catch(e){

        }

    });

  }
}

function addressBySearchResult(result){
    var address = ""; 
    address = result.vicinity+result.name
    return result.name;
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

function ajax(uri,fn,error,method,data){
    var request = new XMLHttpRequest();
    request.open(method||"GET", uri);
    try{
      request.send(data||null);
    }catch(e){
        error();
    }
    request.onload = function(e) {
        if (this.status == 200) {
          fn(this.response,error);
        }else{
          error();
        }
    };
    request.onerror = error;
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

// function formToObject(form) {
//     var formData = new FormData(form),
//         result = {};

//     for (var entry of formData.entries())
//     {
//         result[entry[0]] = entry[1];
//     }
//     return result;
// }


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
function autocomplete(input){
    var uri = "//charon-node.herokuapp.com/cross?api=https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCwEybOPnluZ2OST9DM2u6TQLSJSA1l6lI&location=28.251017,117.034697&radius=20000000&input="+input.value;
    ajax(uri,function(data){
//         console.log(data);
        try{
            var addresss = JSON.parse(data);
//             var address0 = addressBySearchResult(addresss.results[0]);
//             if(address0){
//                 input.value = address0;
//             }
            
            var addressListD = document.getElementById("addressList");
            var innerHTML = "";
            console.log(addresss.predictions[0]);
//             addresss.results = JSON.parse(addresss.result);
            for(var i = 0; i<addresss.predictions.length;i++){
                var address = addresss.predictions[i];
                var value = textByAutocompleteAddress(address);
                innerHTML+='<option value="'+value+'">';
            }
            addressListD.innerHTML = innerHTML;
            data = address = addresss = null;
        }catch(e){

        }

    });
}

function textByAutocompleteAddress(address){
  var text = "";
  for(var i = 0;i<address.terms.length;i++){
    var term = address.terms[i];
    if(term.offset>2){
       text = term.value+text;
    }
  }
  return text;
}

function getAddressByIp(input){

    if(input.value){
        return;
    }
//     https://stackoverflow.com/questions/391979/how-to-get-clients-ip-address-using-javascript-only
    var uri = "//api.ipify.org/?format=json";
    ajax(uri,function(data){
//         console.log(data);
        try{
          var ip = JSON.parse(data).ip;
          var uri = "//charon-node.herokuapp.com/cross?api=http://ip.taobao.com/service/getIpInfo.php?ip="+ip;
          ajax(uri,function(data){
              console.log(data);
              try{
                var info = JSON.parse(unescape(data));
//                 info.data.city+info.data.county;
                if(!input.value){
                    document.getElementById("addressFormatted").setAttribute("value",info.data.city+info.data.county);
                }
              }catch(e){

              }

          });
        }catch(e){

        }
      
    });
}