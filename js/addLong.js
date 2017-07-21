init();

function init(){
    var word = {
        "title":"加入游戏",
        ".submit .give":"加入游戏",
        "#userInfo .you + em":"书寄到哪？",
        "#whatBook":"建议加入什么书？"
    }
    for(var key in word){
        innerText(key,word[key]);
    }

    var formElement = document.querySelector("form");

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
        
        localStorage.setItem("me", JSON.stringify(me));
        changeBook(book);


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
                
                  submitButton.innerHTML = "已算上你了,捐点钱吧";
                  if(window.parent.parent.load){
                    var goMoney = function(){
                        window.parent.parent.location.hash = "#money";
                        window.parent.parent.load();
                        location.reload();
                    }
                    setTimeout(goMoney,1000);
                  }else if(window.parent){
                    var goMoney = function(){
                        window.parent.goBack();
                    }
                    setTimeout(goMoney,1000);
                  }else{
                    window.goBack();
                  }
              }
              
              
            },
            error = function(){
              submitButton.disabled="";
            },
            method = formElement.method,
            data = JSON.stringify(book);


        ajax(uri,function(data){
            var data = JSON.parse(data);
            me["reserveBookId"]=data.name;
            localStorage.setItem("reserveBookId",data.name);
            ajax("https://book-2724e.firebaseio.com/sante/long.json",fn,error,method,JSON.stringify(me));

        },error,method,data);

        data = book = null;

    }
}

function changeBook(book){
    book.address = "",
    book.username = "",
    book.tel = "",
    book.geo = "",
    book.allowMeet = "";
    book.addressFormatted = "";
    book.type = "long";
}

function innerText(selector,text){
    document.querySelector(selector).innerText = text;
}