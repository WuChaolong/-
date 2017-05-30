function load(){
    var me = JSON.parse(localStorage.getItem("me"));
    if(me){
        var meTemplate = document.getElementById("meTemplate").innerHTML;
        Mustache.parse(meTemplate);   // optional, speeds up future uses
        if(me.time){
            var date = new Date(-me.time);
            me.date = date.getMonth() + '.' + date.getDate();
        }
        document.body.innerHTML = Mustache.render(meTemplate, me);
        var detailsLogin = document.querySelector('#login');

    }else{
        var loginTemplate = document.getElementById("loginTemplate").innerHTML;
        Mustache.parse(loginTemplate);
        var setting = {
            reserveBookId:localStorage.getItem("reserveBookId"),
            jsonp:function(){
                var my_awesome_script = document.createElement('script');

                my_awesome_script.setAttribute('src','https://book-2724e.firebaseio.com/sante/books2/'+setting.reserveBookId+'.json?callback=gotBookData');

                document.head.appendChild(my_awesome_script);
            }
        };
        document.body.innerHTML = Mustache.render(loginTemplate,setting);
        onOpen(document.querySelector('#login'),function(){
            if(document.querySelector('#login').hasAttribute("open")){
                document.querySelector('#tel').focus();
            }
        });
    //     document.querySelector('#login').open = true;
    }
}



function login(form){
    var submitButton = form.querySelector("button[type=submit]");
        submitButton.disabled="disabled";
    var uri = form.action+"%22"+form.tel.value+"%22";
    function error(){
        submitButton.disabled="";
        form.tel.focus();
    };
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
        var me = JSON.stringify({
            "address":book.address,
            "username":book.username,
            "tel":book.tel,
            "geo":book.geo,
            "time":book.time,
            "allowMeet":book.allowMeet
        });
        localStorage.setItem("me", me);
//         location = "list.html";

        if(form.reserveBookId&&form.reserveBookId.value){
            me["time"]=0-new Date().getTime();
            var data = me,
                uri = "https://book-2724e.firebaseio.com/sante/books2/"+form.reserveBookId.value+"/users.json",
                fn = function(){
                    localStorage.removeItem("reserveBookId");
                    window.goBack();
                },
                error = error,
                method = "POST";

            ajax(uri,fn,error,method,data);  
        }else{
            window.goBack();
        }
    },error)
    return false;
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
        }
    };
    request.onerror = error;
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
function gotBookData(data){
    var book = data;
    if(book==null){
        return;
    }

    var newBookD  = document.getElementById("newBook");
    newBookD.style.display="inline-block";
    newBookD.innerHTML = book.description.slice(0,3);
    newBookD.title = book.description;
}
function getO(data){
    var o = null;
    for(var key in data){
        o = data[key];
    }
    return o;
}

function reserveBook(){
}