init();

function init(){
    var word = {
        "#whatBook":"出什么书？"
    }
    for(var key in word){
        innerText(key,word[key]);
    }

    
}

function innerText(selector,text){
    document.querySelector(selector).innerText = text;
}