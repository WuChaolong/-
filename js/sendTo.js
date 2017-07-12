init();

function init(){
    var id = getURLParameter("id");
    if(!id){
        document.body.innerHTML="error";
    }
    var word = {
        "title":"寄给Ta",
        ".submit .give":"确认",
        "#userInfo .you + em":"书寄到哪？",
        'label[for="username"]':"Ta的名字"
    }
    for(var key in word){
        innerText(key,word[key]);
    }

    var formElement = document.querySelector("form");
    document.querySelector("#descriptionSection").innerHTML="";
    var formInitData = {
        "address":"",
        "username":"",
        "tel":"",
        "geo":"",
        "allowMeet":""
    }
    setFormValue(formElement,formInitData);
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
        me["time"] = 0-new Date().getTime();
        me.status = "fa-hourglass-start";
        var data = JSON.stringify(me),
        uri = "https://book-2724e.firebaseio.com/sante/books2/"+id+"/users.json",
        fn2 = function(){
          submitButton.innerHTML = "已提交";
          if(window.parent){
            setTimeout(closeIframe,1000);
            function closeIframe(){
//                 window.parent.location.hash = "#money";
//                 window.parent.load();
                location.reload();
            }
          }else{
            window.goBack();
          }
        },
        error = function(){
              submitButton.disabled="";
            },
        method = "POST";

        ajax(uri,fn2,error,method,data);  
        book = me = data = null;

    }
}

function innerText(selector,text){
    document.querySelector(selector).innerText = text;
}